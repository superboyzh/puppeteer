import puppeteer from "puppeteer";
import { log, getOutputPath } from "../utils/helpers.js";

/**
 * 自动登录、点击新增申请单、自动填写表单并送审
 */
async function autoLoginAndSubmitForm() {
  log("开始自动登录并自动填单送审示例", "info");
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: false,
      slowMo: 100,
      defaultViewport: { width: 1620, height: 950 },
    });

    const page = await browser.newPage();

    // 1. 打开登录页
    const loginUrl = "http://zgj.test.zhangin.cn";
    log(`访问登录页: ${loginUrl}`, "info");
    await page.goto(loginUrl, { waitUntil: "networkidle2" });

    // 2. 输入用户名和密码
    await page.type('input[id="normal_login_phone"]', "14796306731");
    await page.type('input[id="normal_login_password"]', "666666");

    // 3. 点击登录按钮
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
    log("登录成功", "success");

    // 4. 先跳转主页 防止无权限
    const applyUrl = "http://zgj.test.zhangin.cn/index.htm";
    log(`访问申请单页面: ${applyUrl}`, "info");
    await page.goto(applyUrl, { waitUntil: "networkidle2" });

    //  再跳转申请页
    const testUrl =
      "http://zgj.test.zhangin.cn/seal/sealApply/preAddOrUpdate.htm?open_sub_page=1";
    log(`访问申请单页面: ${testUrl}`, "info");
    await page.goto(testUrl, { waitUntil: "networkidle2" });

    // 5. 点击“新增申请单”按钮（使用您提供的精确选择器）
    // log("点击新增申请单按钮", "info");
    // const addBtnSelector =
    //   "#queryForm > div > div.page_title > div.layui-col-md3.more_btn > a:nth-child(1)";
    // await page.waitForSelector(addBtnSelector);
    // await page.click(addBtnSelector);

    // 6. 等待表单弹出并填写内容（请根据实际表单字段选择器修改）
    // log("等待表单弹出并填写内容", "info");
    // await page.waitForSelector(
    //   "#commentForm > div.box_cont > div.tab_info > div > ul > li:nth-child(1) > div:nth-child(1) > div > input"
    // );
    log("开始填写表单字段", "info");
    await page.type('input[name="name"]', "申请测试单据");
    log("文件名称填写完成", "info");
    await page.click(
      "#commentForm > div.box_cont > div.tab_info > div > ul > li:nth-child(2) > div:nth-child(1) > div > div > div > input"
    );
    await page.keyboard.type("其他类");
    await page.click(
      "#commentForm > div.box_cont > div.tab_info > div > ul > li:nth-child(2) > div:nth-child(1) > div > div > dl > dd:nth-child(885)"
    );
    log("文件类型选择完成", "info");
    await page.click("#selectSealInfoText1");
    // 这里会打开一个弹窗 是iframe的 要选择里面的内容
    // 找到id为layui-layer-iframe4的iframe
    log("等待印章选择弹窗iframe加载", "info");
    await page.waitForSelector("div.layui-layer-title", {
      timeout: 10000,
    });
    await page.waitForSelector(
      'iframe[id^="layui-layer-iframe"], iframe[class^="layui-layer-iframe"]',
      { timeout: 10000 }
    );
    log("弹窗加载完成", "info");
    const frameHandle = await page.$(
      'iframe[id^="layui-layer-iframe"], iframe[class^="layui-layer-iframe"]'
    );
    if (!frameHandle) {
      log("未找到印章选择iframe，保存截图供排查", "error");
      await page.screenshot({ path: getOutputPath("error-no-iframe", "png") });
      throw new Error("未找到印章选择iframe");
    }
    const frame = await frameHandle.contentFrame();
    await frame.click(
      "#rightInfo > div.table > div > div.layui-table-box > div.layui-table-body.layui-table-main > table > tbody > tr:nth-child(1) > td.layui-table-col-special > div > div > i"
    );
    await frame.click("#addSealBtn");
    log("印章选择完成", "info");
    await page.type('input[name="use_count1"]', "20");
    log("常规盖章次数填写完成", "info");
    await page.click("#is_sealed_bid_text > div:nth-child(1) > div > div > i");
    log("骑缝盖章勾选完成", "info");
    await page.type('input[name="seal_bid_use_count1"]', "50");
    log("骑缝盖章次数填写完成", "info");
    await page.click(
      "#commentForm > div.box_cont > div.tab_info > div > ul > li.layui-form-item.noContractInfo.is_auto_batch > div > div > div > i"
    );
    log("批量盖章勾选完成", "info");

    await page.click(
      "#workflow > div.tab_info > div > ul > li:nth-child(1) > div > div > div > input"
    );
    await page.keyboard.type("自由流程（用印申请）");
    await page.click(
      "#workflow > div.tab_info > div > ul > li:nth-child(1) > div > div > dl > dd.layui-this"
    );
    await page.click("#free_approval_person > b > img");

    log("等待审批人选择弹窗iframe加载", "info");
    await page.waitForSelector(
      'iframe[id^="layui-layer-iframe"], iframe[class^="layui-layer-iframe"]',
      { timeout: 10000 }
    );
    log("弹窗加载完成", "info");
    const frameHandlePerson = await page.$(
      'iframe[id^="layui-layer-iframe"], iframe[class^="layui-layer-iframe"]'
    );
    if (!frameHandlePerson) {
      log("未找到审批人选择iframe，保存截图供排查", "error");
      await page.screenshot({ path: getOutputPath("error-no-iframe", "png") });
      throw new Error("未找到审批人选择iframe");
    }
    const framePerson = await frameHandlePerson.contentFrame();

    await framePerson.type(
      "body > div > div > div > div > div > div.user_so > input[type=text]",
      "14796306731"
    );
    await framePerson.click(
      "body > div > div > div > div > div > div.user_so > a"
    );
    await framePerson.click("#ff8080818dfce5d1018dfcfcfd7202a0_s");
    await framePerson.click("body > div > div > div > div > div > a");
    log("审批人选择完成", "info");
    // 7. 点击送审按钮（请根据实际按钮选择器修改）
    log("点击送审按钮", "info");
    await page.click("#commentForm > div.box_cont_btn > button");
    // 8. 等待送审结果提示
    await page.waitForTimeout(2000); // 可根据实际情况调整等待时间
    log("表单已自动填写并送审完成！", "success");

    // 9. 可选：截图保存
    const outputPath = getOutputPath("apply-form-submit", "png");
    await page.screenshot({ path: outputPath });
    log(`已保存送审后截图到: ${outputPath}`, "success");
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
  autoLoginAndSubmitForm();
}
