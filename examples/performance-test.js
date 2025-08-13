// 格式化时间为 'YYYY-MM-DD HH:mm:ss'
function formatDateTime(date) {
  const pad = (n) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
}
import puppeteer, { devices } from "puppeteer";
import { log, getOutputPath } from "../utils/helpers.js";
import fs from "fs";

/**
 * 性能测试例子
 * 演示如何使用 Puppeteer 进行网页性能分析
 */
async function performanceTestExample() {
  log("开始性能测试例子演示", "info");

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS Chrome 可执行文件路径
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // 1. 基础性能指标收集
    log("开始收集基础性能指标...", "info");

    // 监听性能相关事件
    const performanceData = {
      metrics: {},
      timing: {},
      resources: [],
      console: [],
      errors: [],
    };

    // 监听控制台消息
    page.on("console", (msg) => {
      performanceData.console.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now(),
      });
    });

    // 监听页面错误
    page.on("pageerror", (error) => {
      performanceData.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      });
    });

    // 启动性能追踪
    await page.tracing.start({
      path: getOutputPath("performance-trace", "json"),
      screenshots: true,
      categories: ["devtools.timeline"],
    });

    // 访问测试页面
    const startTime = Date.now();
    log("访问测试网站...", "info");

    const response = await page.goto("http://zgj.test.zhangin.cn", {
      waitUntil: "networkidle2",
    });

    const loadTime = Date.now() - startTime;

    // 收集基础指标
    const metrics = await page.metrics();
    performanceData.metrics = metrics;

    log(`页面加载时间: ${loadTime}ms`, "success");
    log("页面指标:", "info");
    console.log(`DOM 节点数: ${metrics.Nodes}`);
    console.log(
      `JavaScript 堆大小: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(
        2
      )} MB`
    );
    console.log(`文档数: ${metrics.Documents}`);
    console.log(`事件监听器数: ${metrics.JSEventListeners}`);

    // 2. 收集 Web Vitals 指标
    log("收集 Web Vitals 指标...", "info");

    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};

        // First Contentful Paint (FCP)
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === "first-contentful-paint") {
              vitals.FCP = entry.startTime;
            }
          }
        }).observe({ entryTypes: ["paint"] });

        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.LCP = lastEntry.startTime;
        }).observe({ entryTypes: ["largest-contentful-paint"] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.CLS = clsValue;
        }).observe({ entryTypes: ["layout-shift"] });

        // 导航时序
        const navigation = performance.getEntriesByType("navigation")[0];
        if (navigation) {
          vitals.TTFB = navigation.responseStart - navigation.requestStart;
          vitals.DOMContentLoaded =
            navigation.domContentLoadedEventEnd - navigation.navigationStart;
          vitals.LoadComplete =
            navigation.loadEventEnd - navigation.navigationStart;
        }

        // 等待一段时间收集数据
        setTimeout(() => {
          resolve(vitals);
        }, 2000);
      });
    });

    performanceData.webVitals = webVitals;

    log("Web Vitals 指标:", "success");
    console.log(`FCP (首次内容绘制): ${webVitals.FCP?.toFixed(2) || "N/A"} ms`);
    console.log(`LCP (最大内容绘制): ${webVitals.LCP?.toFixed(2) || "N/A"} ms`);
    console.log(`CLS (累积布局偏移): ${webVitals.CLS?.toFixed(4) || "N/A"}`);
    console.log(`TTFB (首字节时间): ${webVitals.TTFB?.toFixed(2) || "N/A"} ms`);
    console.log(
      `DOM 内容加载: ${webVitals.DOMContentLoaded?.toFixed(2) || "N/A"} ms`
    );
    console.log(
      `页面完全加载: ${webVitals.LoadComplete?.toFixed(2) || "N/A"} ms`
    );

    // 3. 网络资源分析
    log("分析网络资源...", "info");

    const resourceTiming = await page.evaluate(() => {
      return performance.getEntriesByType("resource").map((resource) => ({
        name: resource.name,
        type: resource.initiatorType,
        size: resource.transferSize,
        duration: resource.duration,
        startTime: resource.startTime,
        responseEnd: resource.responseEnd,
      }));
    });

    performanceData.resources = resourceTiming;

    // 分析资源类型
    const resourcesByType = resourceTiming.reduce((acc, resource) => {
      const type = resource.type || "other";
      if (!acc[type]) {
        acc[type] = { count: 0, totalSize: 0, totalDuration: 0 };
      }
      acc[type].count++;
      acc[type].totalSize += resource.size || 0;
      acc[type].totalDuration += resource.duration || 0;
      return acc;
    }, {});

    log("资源分析结果:", "success");
    Object.entries(resourcesByType).forEach(([type, stats]) => {
      console.log(
        `${type}: ${stats.count} 个文件, 总大小: ${(
          stats.totalSize / 1024
        ).toFixed(2)} KB, 平均加载时间: ${(
          stats.totalDuration / stats.count
        ).toFixed(2)} ms`
      );
    });

    // 4. 内存使用分析
    log("开始内存使用分析...", "info");

    // 执行一些操作来观察内存变化
    await page.evaluate(() => {
      // 创建一些 DOM 元素
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement("div");
        div.textContent = `动态元素 ${i}`;
        document.body.appendChild(div);
      }
    });

    const memoryAfterCreation = await page.metrics();

    log("创建元素后的内存使用:", "info");
    console.log(
      `JavaScript 堆大小: ${(
        memoryAfterCreation.JSHeapUsedSize /
        1024 /
        1024
      ).toFixed(2)} MB`
    );
    console.log(`DOM 节点数: ${memoryAfterCreation.Nodes}`);

    // 清理创建的元素
    await page.evaluate(() => {
      const dynamicElements = Array.from(
        document.querySelectorAll("div")
      ).filter((div) => div.textContent.startsWith("动态元素"));
      dynamicElements.forEach((el) => el.remove());
    });

    const memoryAfterCleanup = await page.metrics();

    log("清理元素后的内存使用:", "info");
    console.log(
      `JavaScript 堆大小: ${(
        memoryAfterCleanup.JSHeapUsedSize /
        1024 /
        1024
      ).toFixed(2)} MB`
    );
    console.log(`DOM 节点数: ${memoryAfterCleanup.Nodes}`);

    // 5. 模拟慢速网络测试
    log("模拟慢速网络测试...", "info");

    // 兼容所有 Puppeteer 版本的网络条件模拟
    const client = await page.target().createCDPSession();
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 200, // 200ms 延迟
      downloadThroughput: (500 * 1024) / 8, // 500 KB/s -> 字节/秒
      uploadThroughput: (500 * 1024) / 8, // 500 KB/s -> 字节/秒
      connectionType: "wifi",
    });

    const slowNetworkStart = Date.now();
    await page.goto("http://zgj.test.zhangin.cn", {
      waitUntil: "networkidle2",
    });
    const slowNetworkTime = Date.now() - slowNetworkStart;

    log(`慢速网络下页面加载时间: ${slowNetworkTime}ms`, "success");

    // 6. CPU 使用率测试
    log("进行 CPU 密集型操作测试...", "info");

    // 通过 CDP 设置 CPU 节流
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 }); // 4倍 CPU 节流

    const cpuTestStart = Date.now();
    await page.evaluate(() => {
      // CPU 密集型操作
      let sum = 0;
      for (let i = 0; i < 1000000; i++) {
        sum += Math.sqrt(i);
      }
      return sum;
    });
    const cpuTestTime = Date.now() - cpuTestStart;

    log(`CPU 节流下计算时间: ${cpuTestTime}ms`, "success");

    // 7. 移动设备性能测试
    log("进行移动设备性能测试...", "info");

    await page.emulate(devices["iPhone 12"]);

    const mobileTestStart = Date.now();
    await page.goto("http://zgj.test.zhangin.cn", {
      waitUntil: "networkidle2",
    });
    const mobileTestTime = Date.now() - mobileTestStart;

    const mobileMetrics = await page.metrics();

    log(`移动设备模拟加载时间: ${mobileTestTime}ms`, "success");
    log(
      `移动设备内存使用: ${(mobileMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(
        2
      )} MB`,
      "info"
    );

    // 停止性能追踪
    await page.tracing.stop();

    // 8. 生成性能报告
    log("生成性能报告...", "info");

    const performanceReport = {
      timestamp: formatDateTime(new Date()),
      testUrl: "http://zgj.test.zhangin.cn",
      loadTimes: {
        desktop: loadTime,
        mobile: mobileTestTime,
        slowNetwork: slowNetworkTime,
      },
      webVitals: webVitals,
      metrics: {
        initial: performanceData.metrics,
        afterMemoryTest: memoryAfterCreation,
        afterCleanup: memoryAfterCleanup,
        mobile: mobileMetrics,
      },
      resources: {
        summary: resourcesByType,
        details: resourceTiming,
      },
      cpuTest: {
        throttledTime: cpuTestTime,
      },
      console: performanceData.console,
      errors: performanceData.errors,
    };

    const reportPath = getOutputPath("performance-report", "json");
    fs.writeFileSync(reportPath, JSON.stringify(performanceReport, null, 2));
    log(`性能报告已保存到: ${reportPath}`, "success");

    // 9. 生成性能评分
    log("计算性能评分...", "info");

    const performanceScore = calculatePerformanceScore(performanceReport);

    log("=== 性能测试总结 ===", "success");
    console.log(`总体评分: ${performanceScore.overall}/100`);
    console.log(`加载速度: ${performanceScore.loading}/100`);
    console.log(`内存效率: ${performanceScore.memory}/100`);
    console.log(`资源优化: ${performanceScore.resources}/100`);

    if (performanceScore.suggestions.length > 0) {
      log("优化建议:", "warning");
      performanceScore.suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
      });
    }

    log("性能测试例子演示完成！", "success");
  } catch (error) {
    log(`执行过程中出现错误: ${error.message}`, "error");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 计算性能评分
 * @param {Object} report 性能报告
 * @returns {Object} 评分结果
 */
function calculatePerformanceScore(report) {
  const scores = { loading: 100, memory: 100, resources: 100 };
  const suggestions = [];

  // 加载速度评分
  if (report.loadTimes.desktop > 3000) {
    scores.loading -= 30;
    suggestions.push("桌面端加载时间超过3秒，需要优化");
  } else if (report.loadTimes.desktop > 2000) {
    scores.loading -= 15;
    suggestions.push("桌面端加载时间略长，建议优化");
  }

  if (report.loadTimes.mobile > 5000) {
    scores.loading -= 30;
    suggestions.push("移动端加载时间过长，需要优化");
  } else if (report.loadTimes.mobile > 3000) {
    scores.loading -= 15;
    suggestions.push("移动端加载时间较长，建议优化");
  }

  // 内存使用评分
  const memoryUsage = report.metrics.initial.JSHeapUsedSize / 1024 / 1024;
  if (memoryUsage > 50) {
    scores.memory -= 40;
    suggestions.push("内存使用过高，需要优化");
  } else if (memoryUsage > 20) {
    scores.memory -= 20;
    suggestions.push("内存使用较高，建议优化");
  }

  // 资源优化评分
  const totalResources = Object.values(report.resources.summary).reduce(
    (sum, type) => sum + type.count,
    0
  );
  if (totalResources > 100) {
    scores.resources -= 30;
    suggestions.push("资源文件过多，建议合并压缩");
  } else if (totalResources > 50) {
    scores.resources -= 15;
    suggestions.push("资源文件较多，建议优化");
  }

  const overall = Math.round(
    (scores.loading + scores.memory + scores.resources) / 3
  );

  return {
    overall,
    loading: Math.max(0, scores.loading),
    memory: Math.max(0, scores.memory),
    resources: Math.max(0, scores.resources),
    suggestions,
  };
}

// 运行例子
if (import.meta.url === `file://${process.argv[1]}`) {
  performanceTestExample();
}
