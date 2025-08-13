import axios from "axios";
import { log } from "../utils/helpers.js";
import fs from "fs";
import { getOutputPath } from "../utils/helpers.js";

const BASE_URL = "http://zgj.test.zhangin.cn"; // 修改为你的后端域名

// 在此处维护你的接口列表
const apis = [
  {
    name: "获取当前时间",
    url: "/app/getCurrTime.htm",
    method: "GET",
    enabled: true,
    params: {},
    callback: (response) => {
      log("当前时间接口返回: " + JSON.stringify(response), "info");
    },
  },
  {
    name: "获取SSO配置",
    url: "/app/sys/getSSOParameter.htm",
    method: "GET",
    enabled: true,
    params: {},
  },
  {
    name: "获取控制台配置",
    url: "/app/console/check.htm",
    method: "GET",
    enabled: true,
    params: {},
  },
];

// ====== 逻辑区 ======
const enabledApis = apis.filter((api) => api.enabled !== false);

async function resolveParams(params, context) {
  if (typeof params === "function") {
    return await params(context);
  }
  return params || {};
}

// ====== 日志文件切片全局变量和函数 ======
const LOG_BASE = `api-error-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const LOG_MAX_SIZE = 500 * 1024; // 500KB
let logFileIndex = 0;

function getCurrentLogFilePath() {
  let filePath = getOutputPath(
    `${LOG_BASE}${logFileIndex === 0 ? "" : "-" + logFileIndex}`,
    "log"
  );
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > LOG_MAX_SIZE) {
    logFileIndex++;
    filePath = getOutputPath(`${LOG_BASE}-${logFileIndex}`, "log");
  }
  return filePath;
}

async function testApi(api, context, index, total) {
  const url = BASE_URL + api.url;
  const method = (api.method || "GET").toUpperCase();
  const params = await resolveParams(api.params, context);
  const data = await resolveParams(api.data, context);
  log(
    `\n[${index + 1}/${total}] 测试接口: ${api.name} (${method} ${url})`,
    "info"
  );
  if (params && Object.keys(params).length)
    log("请求参数: " + JSON.stringify(params), "info");
  if (data && Object.keys(data).length)
    log("请求数据: " + JSON.stringify(data), "info");
  const start = Date.now();
  let response;
  try {
    if (method === "GET") {
      response = await axios.get(url, { params });
    } else {
      response = await axios.post(url, data);
    }
    const duration = Date.now() - start;
    log(`响应状态: ${response.status}，耗时: ${duration}ms`, "success");
    log("响应数据: " + JSON.stringify(response.data), "info");

    // 状态码不为200时写日志
    if (response.status !== 200) {
      await writeErrorLog({
        api,
        url,
        method,
        params,
        data,
        status: response.status,
        response: response.data,
        duration,
        type: "http-status",
      });
    }
    // 返回数据status不为1时写日志
    if (
      response.data &&
      response.data.status !== undefined &&
      response.data.status !== 1
    ) {
      await writeErrorLog({
        api,
        url,
        method,
        params,
        data,
        status: response.status,
        response: response.data,
        duration,
        type: "business-status",
      });
    }

    if (typeof api.callback === "function") {
      await api.callback(response.data, null, context);
    }
  } catch (err) {
    const duration = Date.now() - start;
    log(`请求失败，耗时: ${duration}ms`, "error");
    log(
      "错误信息: " +
        (err.response ? JSON.stringify(err.response.data) : err.message),
      "error"
    );
    // 写错误日志
    await writeErrorLog({
      api,
      url,
      method,
      params,
      data,
      status: err.response ? err.response.status : "NO_RESPONSE",
      response: err.response ? err.response.data : err.message,
      duration,
      type: "http-error",
    });
    if (typeof api.callback === "function") {
      await api.callback(null, err, context);
    }
  }
}

async function writeErrorLog(logObj) {
  const { api, url, method, params, data, status, response, duration, type } =
    logObj;
  const content = [
    `接口名称: ${api.name || ""}`,
    `接口地址: ${url}`,
    `请求方法: ${method}`,
    `请求参数: ${JSON.stringify(params)}`,
    `请求数据: ${JSON.stringify(data)}`,
    `HTTP状态: ${status}`,
    `耗时: ${duration}ms`,
    `返回内容: ${JSON.stringify(response, null, 2)}`,
    `错误类型: ${type}`,
    `时间: ${new Date().toLocaleString()}`,
    "-----------------------------",
  ].join("\n");
  const filePath = getCurrentLogFilePath();
  fs.appendFileSync(filePath, content + "\n", "utf-8");
  log(`已输出错误日志到: ${filePath}`, "error");
}

async function main() {
  log(`开始接口测试，域名: ${BASE_URL}`);
  const context = {
    testApis: enabledApis,
    setApiTempData: () => {},
    testConfig: {},
    log,
  };
  for (let i = 0; i < enabledApis.length; i++) {
    await testApi(enabledApis[i], context, i, enabledApis.length);
  }
  log("所有接口测试完成！", "success");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
