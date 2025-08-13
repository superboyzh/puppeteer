import puppeteer from "puppeteer";
import { log, getOutputPath } from "../utils/helpers.js";
import fs from "fs";

/**
 * 辅助功能测试示例
 * 演示如何运行页面的可访问性审计并保存结果
 */
async function accessibilityTestExample() {
  log("开始辅助功能测试例子演示", "info");
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

    const url = "https://www.baidu.com";
    log(`访问网站: ${url}`, "info");
    await page.goto(url);

    // 运行可访问性审计
    log("正在运行可访问性审计...", "info");
    const accessibilityTree = await page.accessibility.snapshot();

    // 将结果保存到文件
    const outputPath = getOutputPath("accessibility-tree", "json");
    fs.writeFileSync(outputPath, JSON.stringify(accessibilityTree, null, 2));
    log(`可访问性树已保存到: ${outputPath}`, "success");

    log("辅助功能测试例子演示完成！", "success");
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
  accessibilityTestExample();
}
