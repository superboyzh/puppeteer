import puppeteer from "puppeteer";
import { log, getOutputPath } from "../utils/helpers.js";

/**
 * PDF 生成例子
 * 演示如何将网页转换为 PDF 文档
 */
async function generatePdfExample() {
  log("开始 PDF 生成例子演示", "info");

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS Chrome 可执行文件路径
      headless: true, // PDF 生成通常在后台进行
    });

    const page = await browser.newPage();

    // 1. 生成简单网页的 PDF
    log("访问示例网站...", "info");
    await page.goto("https://www.baidu.com", {
      waitUntil: "networkidle2",
    });

    log("正在生成基础 PDF...", "info");
    const basicPdfPath = getOutputPath("basic-webpage", "pdf");
    await page.pdf({
      path: basicPdfPath,
      format: "A4",
      printBackground: true, // 包含背景色和图片
    });
    log(`基础 PDF 已保存: ${basicPdfPath}`, "success");

    // 2. 生成带自定义设置的 PDF
    log("正在生成自定义设置的 PDF...", "info");
    const customPdfPath = getOutputPath("custom-settings", "pdf");
    await page.pdf({
      path: customPdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "1in",
        bottom: "1in",
        left: "0.5in",
        right: "0.5in",
      },
      displayHeaderFooter: true,
      headerTemplate:
        '<div style="font-size: 10px; width: 100%; text-align: center;">页面标题</div>',
      footerTemplate:
        '<div style="font-size: 10px; width: 100%; text-align: center;">第 <span class="pageNumber"></span> 页，共 <span class="totalPages"></span> 页</div>',
    });
    log(`自定义 PDF 已保存: ${customPdfPath}`, "success");

    // 3. 生成横向 PDF
    log("正在生成横向 PDF...", "info");
    const landscapePdfPath = getOutputPath("landscape", "pdf");
    await page.pdf({
      path: landscapePdfPath,
      format: "A4",
      landscape: true,
      printBackground: true,
    });
    log(`横向 PDF 已保存: ${landscapePdfPath}`, "success");

    // 4. 生成指定页面范围的 PDF
    await page.goto("https://www.baidu.com", {
      waitUntil: "networkidle2",
    });

    log("正在生成指定页面范围的 PDF...", "info");
    const rangedPdfPath = getOutputPath("page-range", "pdf");
    await page.pdf({
      path: rangedPdfPath,
      format: "A4",
      pageRanges: "1-1", // 只生成第一页
      printBackground: true,
    });
    log(`指定范围 PDF 已保存: ${rangedPdfPath}`, "success");

    // 5. 创建一个包含多种内容的 HTML 页面并生成 PDF
    log("正在创建复杂内容并生成 PDF...", "info");

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Puppeteer PDF 生成示例</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                margin: -20px -20px 30px -20px;
            }
            .content {
                max-width: 800px;
                margin: 0 auto;
            }
            .section {
                margin-bottom: 30px;
                padding: 20px;
                border-left: 4px solid #667eea;
                background: #f8f9fa;
            }
            .code {
                background: #2d3748;
                color: #e2e8f0;
                padding: 15px;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                margin: 10px 0;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .table th, .table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            .table th {
                background-color: #667eea;
                color: white;
            }
            .page-break {
                page-break-before: always;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Puppeteer PDF 生成示例</h1>
            <p>展示如何使用 Puppeteer 生成美观的 PDF 文档</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>1. 关于 Puppeteer</h2>
                <p>Puppeteer 是一个 Node.js 库，提供了一个高级 API 来控制 Chrome 或 Chromium 浏览器。</p>
                <p>主要功能包括：</p>
                <ul>
                    <li>生成页面的截图和 PDF</li>
                    <li>网页爬取和数据提取</li>
                    <li>自动化表单提交和 UI 测试</li>
                    <li>性能监控和分析</li>
                </ul>
            </div>

            <div class="section">
                <h2>2. 代码示例</h2>
                <p>以下是一个基本的 Puppeteer 使用示例：</p>
                <div class="code">
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
await page.pdf({ path: 'example.pdf' });
await browser.close();
                </div>
            </div>

            <div class="section">
                <h2>3. 功能对比表</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>功能</th>
                            <th>Puppeteer</th>
                            <th>Selenium</th>
                            <th>Playwright</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>PDF 生成</td>
                            <td>✅ 优秀</td>
                            <td>❌ 不支持</td>
                            <td>✅ 支持</td>
                        </tr>
                        <tr>
                            <td>跨浏览器</td>
                            <td>⚠️ 仅 Chrome</td>
                            <td>✅ 全支持</td>
                            <td>✅ 全支持</td>
                        </tr>
                        <tr>
                            <td>性能</td>
                            <td>✅ 很快</td>
                            <td>⚠️ 较慢</td>
                            <td>✅ 很快</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="page-break section">
                <h2>4. 新页面内容</h2>
                <p>这部分内容会出现在新的一页上，演示了 CSS 的 page-break-before 属性。</p>
                <p>当生成 PDF 时，Puppeteer 会尊重 CSS 的打印样式，包括分页控制。</p>
            </div>

            <div class="section">
                <h2>5. 总结</h2>
                <p>Puppeteer 是一个功能强大的工具，特别适合：</p>
                <ul>
                    <li>生成高质量的 PDF 报告</li>
                    <li>网站截图和监控</li>
                    <li>自动化测试</li>
                    <li>性能分析</li>
                </ul>
                <p>希望这个示例对您学习 Puppeteer 有所帮助！</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);

    const complexPdfPath = getOutputPath("complex-content", "pdf");
    await page.pdf({
      path: complexPdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
        right: "0.5in",
      },
      displayHeaderFooter: true,
      headerTemplate:
        '<div style="font-size: 10px; width: 100%; text-align: center; color: #666;">Puppeteer PDF 示例文档</div>',
      footerTemplate:
        '<div style="font-size: 10px; width: 100%; text-align: center; color: #666;">第 <span class="pageNumber"></span> 页，共 <span class="totalPages"></span> 页</div>',
    });
    log(`复杂内容 PDF 已保存: ${complexPdfPath}`, "success");

    // 6. 生成 Buffer 格式的 PDF（不保存到文件）
    log("正在生成 Buffer 格式的 PDF...", "info");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    log(`Buffer PDF 生成完成，大小: ${pdfBuffer.length} 字节`, "success");

    log("PDF 生成例子演示完成！", "success");
    log("所有 PDF 文件已保存在 output 目录中", "info");
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
  generatePdfExample();
}
