import puppeteer from "puppeteer";
import { log } from "../utils/helpers.js";

/**
 * Puppeteer 基础使用例子
 * 演示如何启动浏览器、打开页面、获取页面信息
 */
async function basicExample() {
  log("开始 Puppeteer 基础例子演示", "info");

  let browser;
  try {
    // 启动浏览器
    log("正在启动浏览器...", "info");
    browser = await puppeteer.launch({
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS Chrome 可执行文件路径
      headless: false, // 设置为 false 可以看到浏览器界面
      slowMo: 100, // 每个操作延迟 100ms，便于观察
      defaultViewport: {
        width: 1280,
        height: 720,
      },
    });

    // 创建新页面
    log("创建新页面...", "info");
    const page = await browser.newPage();

    // 访问网页
    const testUrl = "http://zgj.test.zhangin.cn";
    log(`访问示例网站: ${testUrl}`, "info");
    await page.goto(testUrl, {
      waitUntil: "networkidle2", // 等待网络请求完成
      timeout: 30000,
    });

    // 获取页面标题
    const title = await page.title();
    log(`页面标题: ${title}`, "success");

    // 获取页面 URL
    const url = page.url();
    log(`当前 URL: ${url}`, "success");

    // 获取页面内容
    const content = await page.content();
    log(`页面 HTML 长度: ${content.length} 字符`, "success");

    // 执行 JavaScript 代码
    const result = await page.evaluate(() => {
      return {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        language: navigator.language,
      };
    });

    log("浏览器信息:", "info");
    console.log(JSON.stringify(result, null, 2));

    // 等待 3 秒让用户观察
    log("等待 3 秒钟...", "info");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    log("基础例子演示完成！", "success");
  } catch (error) {
    log(`执行过程中出现错误: ${error.message}`, "error");
  } finally {
    // 关闭浏览器
    if (browser) {
      log("关闭浏览器...", "info");
      await browser.close();
    }
  }
}

// 运行例子
if (import.meta.url === `file://${process.argv[1]}`) {
  basicExample();
}
