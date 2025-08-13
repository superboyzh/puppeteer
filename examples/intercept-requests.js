import puppeteer from "puppeteer";
import { log, getOutputPath } from "../utils/helpers.js";

/**
 * 请求拦截示例
 * 演示如何拦截网络请求，例如阻止加载图片
 */
async function interceptRequestsExample() {
  log("开始请求拦截例子演示", "info");
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

    // 启用请求拦截
    await page.setRequestInterception(true);
    log("已启用请求拦截", "info");

    // 添加请求监听器
    page.on("request", (request) => {
      if (request.resourceType() === "image") {
        log(`阻止图片请求: ${request.url()}`, "warning");
        request.abort();
      } else {
        request.continue();
      }
    });

    // 访问有图片的网站
    const url =
      "https://image.baidu.com/search/index?tn=baiduimage&ipn=r&ct=201326592&cl=2&lm=&st=-1&fm=index&fr=&hs=0&xthttps=111110&sf=1&fmq=&pv=&ic=0&nc=1&z=&se=&showtab=0&fb=0&width=&height=&face=0&istype=2&ie=utf-8&word=%E7%BE%8E%E5%A5%B3";
    log(`访问网站: ${url}`, "info");
    await page.goto(url);

    log("已导航到图片搜索结果，图片请求被阻止。", "info");

    // 截图以显示图片未加载
    const outputPath = getOutputPath("no-images", "png");
    await page.screenshot({ path: outputPath });
    log(`截图已保存到: ${outputPath}`, "success");

    log("请求拦截例子演示完成！", "success");
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
  interceptRequestsExample();
}
