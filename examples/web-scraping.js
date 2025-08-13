import puppeteer from "puppeteer";
import { log, getOutputPath } from "../utils/helpers.js";
import fs from "fs";

/**
 * 网页数据抓取例子
 * 演示如何从网页中提取数据
 */
async function webScrapingExample() {
  log("开始网页数据抓取例子演示", "info");

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS Chrome 可执行文件路径
      headless: true,
    });

    const page = await browser.newPage();

    // 1. 抓取新闻网站标题和链接
    log("访问示例新闻网站...", "info");
    await page.goto("https://news.ycombinator.com", {
      waitUntil: "networkidle2",
    });

    // 提取 Hacker News 的文章标题和链接
    log("正在提取新闻标题和链接...", "info");
    const newsData = await page.evaluate(() => {
      const items = [];
      const titleElements = document.querySelectorAll(".titleline > a");

      titleElements.forEach((element, index) => {
        if (index < 10) {
          // 只取前10条
          items.push({
            title: element.textContent.trim(),
            url: element.href,
            index: index + 1,
          });
        }
      });

      return items;
    });

    log(`成功提取 ${newsData.length} 条新闻`, "success");
    newsData.forEach((item) => {
      console.log(`${item.index}. ${item.title}`);
      console.log(`   链接: ${item.url}\n`);
    });

    // 2. 抓取GitHub趋势项目
    log("访问 GitHub 趋势页面...", "info");
    await page.goto("https://github.com/trending", {
      waitUntil: "networkidle2",
    });

    log("正在提取 GitHub 趋势项目...", "info");
    const githubTrending = await page.evaluate(() => {
      const repos = [];
      const repoElements = document.querySelectorAll("article.Box-row");

      repoElements.forEach((element, index) => {
        if (index < 5) {
          // 只取前5个
          const titleElement = element.querySelector("h2 a");
          const descElement = element.querySelector("p");
          const starsElement = element.querySelector('a[href*="/stargazers"]');
          const languageElement = element.querySelector(
            '[itemprop="programmingLanguage"]'
          );

          if (titleElement) {
            repos.push({
              name: titleElement.textContent.trim().replace(/\s+/g, " "),
              description: descElement
                ? descElement.textContent.trim()
                : "无描述",
              stars: starsElement ? starsElement.textContent.trim() : "0",
              language: languageElement
                ? languageElement.textContent.trim()
                : "未知",
              url: `https://github.com${titleElement.getAttribute("href")}`,
            });
          }
        }
      });

      return repos;
    });

    log(`成功提取 ${githubTrending.length} 个趋势项目`, "success");
    githubTrending.forEach((repo, index) => {
      console.log(`${index + 1}. ${repo.name}`);
      console.log(`   描述: ${repo.description}`);
      console.log(`   语言: ${repo.language} | Stars: ${repo.stars}`);
      console.log(`   链接: ${repo.url}\n`);
    });

    // 3. 抓取表格数据
    log("访问包含表格的示例页面...", "info");

    // 创建一个包含表格的 HTML 页面
    const tableHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>示例表格</title>
        <style>
            table { border-collapse: collapse; width: 100%; margin: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h1>员工信息表</h1>
        <table id="employee-table">
            <thead>
                <tr>
                    <th>姓名</th>
                    <th>职位</th>
                    <th>部门</th>
                    <th>薪资</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>张三</td>
                    <td>软件工程师</td>
                    <td>技术部</td>
                    <td>15000</td>
                </tr>
                <tr>
                    <td>李四</td>
                    <td>产品经理</td>
                    <td>产品部</td>
                    <td>18000</td>
                </tr>
                <tr>
                    <td>王五</td>
                    <td>UI设计师</td>
                    <td>设计部</td>
                    <td>12000</td>
                </tr>
                <tr>
                    <td>赵六</td>
                    <td>数据分析师</td>
                    <td>数据部</td>
                    <td>16000</td>
                </tr>
            </tbody>
        </table>
    </body>
    </html>
    `;

    await page.setContent(tableHtml);

    log("正在提取表格数据...", "info");
    const tableData = await page.evaluate(() => {
      const table = document.querySelector("#employee-table");
      const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
        th.textContent.trim()
      );
      const rows = Array.from(table.querySelectorAll("tbody tr"));

      return {
        headers,
        data: rows.map((row) => {
          const cells = Array.from(row.querySelectorAll("td"));
          const rowData = {};
          cells.forEach((cell, index) => {
            rowData[headers[index]] = cell.textContent.trim();
          });
          return rowData;
        }),
      };
    });

    log("成功提取表格数据", "success");
    console.log("表头:", tableData.headers);
    console.log("数据:");
    tableData.data.forEach((row, index) => {
      console.log(`第 ${index + 1} 行:`, row);
    });

    // 4. 抓取具有分页的数据
    log("演示分页数据抓取...", "info");

    // 创建一个模拟分页的页面
    const paginationHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>分页示例</title>
        <style>
            .item { padding: 10px; border: 1px solid #ccc; margin: 5px 0; }
            .pagination { margin: 20px 0; }
            .page-btn { padding: 5px 10px; margin: 0 2px; cursor: pointer; background: #007bff; color: white; border: none; }
        </style>
    </head>
    <body>
        <div id="content">
            <div class="item">项目 1 - 第1页</div>
            <div class="item">项目 2 - 第1页</div>
            <div class="item">项目 3 - 第1页</div>
        </div>
        <div class="pagination">
            <button class="page-btn" onclick="loadPage(1)">1</button>
            <button class="page-btn" onclick="loadPage(2)">2</button>
            <button class="page-btn" onclick="loadPage(3)">3</button>
        </div>
        
        <script>
            function loadPage(pageNum) {
                const content = document.getElementById('content');
                content.innerHTML = '';
                for (let i = 1; i <= 3; i++) {
                    const div = document.createElement('div');
                    div.className = 'item';
                    div.textContent = \`项目 \${i} - 第\${pageNum}页\`;
                    content.appendChild(div);
                }
            }
        </script>
    </body>
    </html>
    `;

    await page.setContent(paginationHtml);

    const allPageData = [];

    // 抓取多页数据
    for (let pageNum = 1; pageNum <= 3; pageNum++) {
      log(`正在抓取第 ${pageNum} 页数据...`, "info");

      // 点击页码按钮
      await page.click(`button:nth-child(${pageNum})`);

      // 等待内容更新
      await page.waitForTimeout(500);

      // 提取当前页数据
      const pageItems = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".item")).map((item) =>
          item.textContent.trim()
        );
      });

      allPageData.push(...pageItems);
    }

    log("分页数据抓取完成", "success");
    allPageData.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });

    // 5. 抓取动态加载的内容
    log("演示动态内容抓取...", "info");

    const dynamicHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>动态内容</title>
    </head>
    <body>
        <div id="dynamic-content">加载中...</div>
        <button id="load-btn">加载数据</button>
        
        <script>
            document.getElementById('load-btn').addEventListener('click', function() {
                setTimeout(() => {
                    document.getElementById('dynamic-content').innerHTML = 
                        '<h3>动态加载的内容</h3><p>这是通过 JavaScript 动态生成的内容</p>';
                }, 1000);
            });
            
            // 自动加载
            setTimeout(() => {
                document.getElementById('load-btn').click();
            }, 2000);
        </script>
    </body>
    </html>
    `;

    await page.setContent(dynamicHtml);

    // 直接注入动态内容，跳过页面 JS
    log("注入动态内容...", "info");
    await page.evaluate(() => {
      document.getElementById("dynamic-content").innerHTML =
        "<h3>动态加载的内容</h3><p>这是通过 JavaScript 动态生成的内容</p>";
    });
    await page.waitForSelector("#dynamic-content h3", { timeout: 2000 });

    const dynamicContent = await page.evaluate(() => {
      return document.getElementById("dynamic-content").textContent;
    });

    log("动态内容抓取成功", "success");
    console.log("动态内容:", dynamicContent);

    // 6. 保存抓取的数据到 JSON 文件
    const scrapedData = {
      timestamp: new Date().toISOString(),
      hackerNews: newsData,
      githubTrending: githubTrending,
      tableData: tableData,
      paginationData: allPageData,
      dynamicContent: dynamicContent,
    };

    const dataPath = getOutputPath("scraped-data", "json");
    fs.writeFileSync(dataPath, JSON.stringify(scrapedData, null, 2));
    log(`抓取的数据已保存到: ${dataPath}`, "success");

    log("网页数据抓取例子演示完成！", "success");
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
  webScrapingExample();
}
