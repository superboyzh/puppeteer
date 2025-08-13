import puppeteer, { devices } from "puppeteer";
import { log, getOutputPath } from "../utils/helpers.js";

const iPhone = devices["iPhone 13 Pro Max"];

/**
 * 模拟设备示例
 * 演示如何在特定设备（如 iPhone 13 Pro Max）上模拟页面并截图
 */
async function emulateDeviceExample() {
  log("开始设备模拟例子演示", "info");
  let browser;
  try {
    log("正在启动浏览器...", "info");
    browser = await puppeteer.launch({
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS Chrome 可执行文件路径
      headless: false,
    });

    const page = await browser.newPage();
    log("创建新页面...", "info");

    // 模拟 iPhone 13 Pro Max
    log("模拟设备: iPhone 13 Pro Max", "info");
    await page.emulate(iPhone);

    const url = "http://zgj.test.zhangin.cn";
    log(`访问网站: ${url}`, "info");

    await page.goto(url, { waitUntil: "networkidle0" });
    log("页面加载完成，等待3秒以确保渲染...", "info");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 截取模拟设备屏幕
    const outputPath = getOutputPath("emulated-iphone", "png");
    await page.screenshot({ path: outputPath });
    log(`截图已保存到: ${outputPath}`, "success");

    log("设备模拟例子演示完成！", "success");
  } catch (error) {
    log(`执行过程中出现错误: ${error.message}`, "error");
  } finally {
    if (browser) {
      log("关闭浏览器...", "info");
      await browser.close();
    }
  }
}

// 运行例子
if (import.meta.url === `file://${process.argv[1]}`) {
  emulateDeviceExample();
}
