import puppeteer, { devices } from "puppeteer";
import { log, getOutputPath } from "../utils/helpers.js";

/**
 * 网页截图例子
 * 演示如何对网页进行全屏截图和元素截图
 */
async function screenshotExample() {
  log("开始网页截图例子演示", "info");

  let browser;
  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: true, // 截图通常在后台进行
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS Chrome 可执行文件路径
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });

    const page = await browser.newPage();

    // 访问示例网站
    log("访问示例网站...", "info");
    await page.goto("http://zgj.test.zhangin.cn", {
      waitUntil: "networkidle2",
    });

    // 1. 全屏截图
    log("正在进行全屏截图...", "info");
    const fullScreenshotPath = getOutputPath("full-page-screenshot", "png");
    await page.screenshot({
      path: fullScreenshotPath,
      fullPage: true, // 截取整个页面，包括需要滚动的部分
    });
    log(`全屏截图已保存: ${fullScreenshotPath}`, "success");

    // 2. 视口截图（仅当前可见区域）
    log("正在进行视口截图...", "info");
    const viewportScreenshotPath = getOutputPath("viewport-screenshot", "png");
    await page.screenshot({
      path: viewportScreenshotPath,
      fullPage: false,
    });
    log(`视口截图已保存: ${viewportScreenshotPath}`, "success");

    // 3. 指定区域截图
    log("正在进行指定区域截图...", "info");
    const clipScreenshotPath = getOutputPath("clip-screenshot", "png");
    await page.screenshot({
      path: clipScreenshotPath,
      clip: {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
      },
    });
    log(`指定区域截图已保存: ${clipScreenshotPath}`, "success");

    // 4. 高质量截图
    log("正在进行高质量截图...", "info");
    const highQualityScreenshotPath = getOutputPath(
      "high-quality-screenshot",
      "png"
    );
    await page.screenshot({
      path: highQualityScreenshotPath,
      fullPage: true,
    });
    log(`高质量截图已保存: ${highQualityScreenshotPath}`, "success");

    // 5. JPEG 格式截图
    log("正在进行 JPEG 格式截图...", "info");
    const jpegScreenshotPath = getOutputPath("jpeg-screenshot", "jpg");
    await page.screenshot({
      path: jpegScreenshotPath,
      type: "jpeg",
      quality: 90,
      fullPage: true,
    });
    log(`JPEG 截图已保存: ${jpegScreenshotPath}`, "success");

    // 访问更复杂的网站进行演示
    log("访问百度首页进行更多截图演示...", "info");
    await page.goto("https://www.baidu.com", {
      waitUntil: "networkidle2",
    });

    // 等待页面完全加载
    await page.waitForSelector("#kw", { timeout: 5000 });

    // 6. 元素截图 - 截取搜索框
    log("正在截取搜索框元素...", "info");
    try {
      const searchBox = await page.$("#kw");
      if (searchBox) {
        // 判断元素是否可见且为 HTMLElement
        const isVisible = await page.evaluate((el) => {
          if (!el || !(el instanceof HTMLElement)) return false;
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return (
            style &&
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            rect.width > 0 &&
            rect.height > 0
          );
        }, searchBox);
        if (isVisible) {
          // 滚动到元素可见区域
          await page.evaluate(
            (el) => el.scrollIntoView({ block: "center" }),
            searchBox
          );
          const elementScreenshotPath = getOutputPath(
            "search-box-element",
            "png"
          );
          await searchBox.screenshot({
            path: elementScreenshotPath,
          });
          log(`搜索框元素截图已保存: ${elementScreenshotPath}`, "success");
        } else {
          log(
            "搜索框元素不可见或不是有效的 HTMLElement，跳过截图。",
            "warning"
          );
        }
      } else {
        log("未找到搜索框元素，跳过截图。", "warning");
      }
    } catch (error) {
      log(`元素截图失败: ${error.message}`, "warning");
    }

    // 7. 移动设备模拟截图
    log("正在进行移动设备模拟截图...", "info");
    await page.emulate(devices["iPhone 12"]);
    await page.reload({ waitUntil: "networkidle2" });

    const mobileScreenshotPath = getOutputPath("mobile-screenshot", "png");
    await page.screenshot({
      path: mobileScreenshotPath,
      fullPage: true,
    });
    log(`移动端截图已保存: ${mobileScreenshotPath}`, "success");

    // 8. Base64 截图（不保存文件）
    log("正在生成 Base64 格式截图...", "info");
    const base64Screenshot = await page.screenshot({
      encoding: "base64",
      type: "png",
    });
    log(
      `Base64 截图生成完成，长度: ${base64Screenshot.length} 字符`,
      "success"
    );

    log("截图例子演示完成！", "success");
    log("所有截图文件已保存在 output 目录中", "info");
  } catch (error) {
    log(`执行过程中出现错误: ${error.message}`, "error");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 运行例子
if (import.meta.url === `file://${process.argv[1]}`) {
  screenshotExample();
}
