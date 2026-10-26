#!/usr/bin/env node

import { firefox } from "playwright";
import { mkdirSync } from "fs";
import { tmpdir, homedir } from "os";
import { join } from "path";
import { createInterface } from "readline";

const PROFILE_DIR = join(homedir(), ".cache", "playwright-reader", "firefox-profile");
const TIMEOUT = 60_000;
const SETTLE_DELAY = 15_000;

// --- Text extraction helper (reused in both modes) ---
async function extractPageText(page) {
  const mainText = await page.evaluate(() => {
    function extractText(node) {
      let parts = [];
      if (node.shadowRoot) parts.push(extractText(node.shadowRoot));
      if (node.children) {
        for (const child of node.children) {
          const tag = child.tagName?.toLowerCase();
          if (tag === "script" || tag === "style" || tag === "noscript" || tag === "svg") continue;
          if (child.shadowRoot) {
            parts.push(extractText(child));
          } else if (child.children && child.children.length > 0) {
            parts.push(extractText(child));
          } else {
            const t = child.textContent?.trim();
            if (t) parts.push(t);
          }
        }
      }
      return parts.filter(Boolean).join("\n");
    }
    return extractText(document.body);
  });

  const frames = page.frames();
  const frameParts = [];
  for (const frame of frames) {
    if (frame === page.mainFrame()) continue;
    try {
      const ft = await frame.evaluate(() => {
        const clone = document.body.cloneNode(true);
        clone.querySelectorAll("script, style, noscript, svg").forEach((el) => el.remove());
        return clone.innerText || clone.textContent || "";
      });
      if (ft.trim()) frameParts.push(ft.trim());
    } catch {}
  }

  return [mainText, ...frameParts].filter(Boolean).join("\n---\n");
}

// --- Arg parsing ---
const args = process.argv.slice(2);
let url = null;
let screenshot = false;
let login = false;
let interactive = false;
let timeout = TIMEOUT;
let settleDelay = SETTLE_DELAY;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--screenshot") screenshot = true;
  else if (args[i] === "--login") login = true;
  else if (args[i] === "--interactive") interactive = true;
  else if (args[i] === "--timeout" && args[i + 1]) { timeout = parseInt(args[i + 1], 10); i++; }
  else if (args[i] === "--wait" && args[i + 1]) { settleDelay = parseInt(args[i + 1], 10); i++; }
  else if (!args[i].startsWith("--")) url = args[i];
}

if (!interactive && !url) {
  console.error("Usage: page-reader.mjs <url> [--screenshot] [--login] [--timeout <ms>] [--wait <ms>]");
  console.error("       page-reader.mjs --interactive [--timeout <ms>]");
  process.exit(1);
}

mkdirSync(PROFILE_DIR, { recursive: true });

// --- Interactive mode ---
if (interactive) {
  const context = await firefox.launchPersistentContext(PROFILE_DIR, { headless: true, timeout });
  let page = context.pages()[0] || await context.newPage();

  function out(obj) { process.stdout.write(JSON.stringify(obj) + "\n"); }

  const rl = createInterface({ input: process.stdin, terminal: false });

  async function handleCommand(cmd) {
    switch (cmd.cmd) {

      case "navigate": {
        await page.goto(cmd.url, { waitUntil: "load", timeout: cmd.timeout || timeout });
        await page.waitForTimeout(cmd.wait || settleDelay);
        out({ ok: true });
        break;
      }

      case "extract": {
        const text = await extractPageText(page);
        out({ ok: true, text });
        break;
      }

      case "screenshot": {
        const p = join(tmpdir(), `page-reader-${Date.now()}.png`);
        await page.screenshot({ path: p, fullPage: cmd.fullPage !== false });
        out({ ok: true, path: p });
        break;
      }

      case "click": {
        await page.click(cmd.selector, { timeout: cmd.timeout || 10_000 });
        if (cmd.wait !== 0) await page.waitForTimeout(cmd.wait || 3_000);
        out({ ok: true });
        break;
      }

      case "click-text": {
        await page.getByText(cmd.text, { exact: cmd.exact ?? false }).first().click({ timeout: cmd.timeout || 10_000 });
        if (cmd.wait !== 0) await page.waitForTimeout(cmd.wait || 3_000);
        out({ ok: true });
        break;
      }

      case "type": {
        await page.fill(cmd.selector, cmd.text, { timeout: cmd.timeout || 10_000 });
        out({ ok: true });
        break;
      }

      case "wait": {
        await page.waitForTimeout(cmd.ms || 1_000);
        out({ ok: true });
        break;
      }

      case "eval": {
        const result = await page.evaluate(cmd.js);
        out({ ok: true, result });
        break;
      }

      case "exit": {
        out({ ok: true });
        await context.close();
        process.exit(0);
      }

      default:
        out({ ok: false, error: `Unknown command: ${cmd.cmd}` });
    }
  }

  for await (const line of rl) {
    try {
      const cmd = JSON.parse(line);
      await handleCommand(cmd);
    } catch (err) {
      out({ ok: false, error: err.message });
    }
  }

  await context.close();
  process.exit(0);

} else {
  // --- One-shot mode (original behavior) ---
  const context = await firefox.launchPersistentContext(PROFILE_DIR, {
    headless: !login,
    timeout,
  });

  try {
    const page = context.pages()[0] || await context.newPage();

    if (login) {
      await page.goto(url, { waitUntil: "load", timeout: 0 });
      console.error("Browser opened for login. Close the browser when done.");
      await new Promise(() => {});
    }

    await page.goto(url, { waitUntil: "load", timeout });
    await page.waitForTimeout(settleDelay);

    const allText = await extractPageText(page);
    console.log(allText);

    if (screenshot) {
      const screenshotPath = join(tmpdir(), `page-reader-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error(`Screenshot saved: ${screenshotPath}`);
    }
  } finally {
    await context.close();
  }
}
