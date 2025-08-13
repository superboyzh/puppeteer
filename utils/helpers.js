import fs from "fs";
import path from "path";

/**
 * 确保目录存在，如果不存在则创建
 * @param {string} dirPath 目录路径
 */
export function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 获取当前时间戳字符串
 * @returns {string} 格式化的时间戳
 */
export function getTimestamp() {
  const now = new Date();
  // 格式: YYYY-MM-DD HH-mm-ss（冒号用-替换，兼容文件名）
  const pad = (n) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/**
 * 延迟执行
 * @param {number} ms 延迟毫秒数
 * @returns {Promise}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 生成输出文件路径
 * @param {string} filename 文件名
 * @param {string} extension 文件扩展名
 * @returns {string} 完整的文件路径
 */
export function getOutputPath(filename, extension) {
  const outputDir = path.join(process.cwd(), "output");
  ensureDirectoryExists(outputDir);
  return path.join(outputDir, `${filename}-${getTimestamp()}.${extension}`);
}

/**
 * 打印带颜色的日志
 * @param {string} message 消息
 * @param {string} type 类型：info, success, error, warning
 */
export function log(message, type = "info") {
  const colors = {
    info: "\x1b[36m", // 青色
    success: "\x1b[32m", // 绿色
    error: "\x1b[31m", // 红色
    warning: "\x1b[33m", // 黄色
    reset: "\x1b[0m", // 重置
  };

  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}
