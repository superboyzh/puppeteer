import puppeteer from "puppeteer";
import { log, delay } from "../utils/helpers.js";

/**
 * 表单交互例子
 * 演示如何与网页表单进行交互
 */
async function formInteractionExample() {
  log("开始表单交互例子演示", "info");

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS Chrome 可执行文件路径
      headless: false, // 显示浏览器界面以便观察操作
      slowMo: 100, // 每个操作延迟 100ms
      defaultViewport: {
        width: 1280,
        height: 720,
      },
    });

    const page = await browser.newPage();

    // 创建一个包含各种表单元素的测试页面
    const formHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>表单交互测试</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .checkbox-group, .radio-group { display: flex; gap: 15px; flex-wrap: wrap; }
            .checkbox-item, .radio-item { display: flex; align-items: center; gap: 5px; }
            .checkbox-item input, .radio-item input { width: auto; }
            .result { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px; }
        </style>
    </head>
    <body>
        <h1>表单交互测试页面</h1>
        
        <form id="test-form">
            <div class="form-group">
                <label for="name">姓名:</label>
                <input type="text" id="name" name="name" placeholder="请输入您的姓名">
            </div>
            
            <div class="form-group">
                <label for="email">邮箱:</label>
                <input type="email" id="email" name="email" placeholder="example@email.com">
            </div>
            
            <div class="form-group">
                <label for="age">年龄:</label>
                <input type="number" id="age" name="age" min="1" max="120">
            </div>
            
            <div class="form-group">
                <label for="city">城市:</label>
                <select id="city" name="city">
                    <option value="">请选择城市</option>
                    <option value="beijing">北京</option>
                    <option value="shanghai">上海</option>
                    <option value="guangzhou">广州</option>
                    <option value="shenzhen">深圳</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>性别:</label>
                <div class="radio-group">
                    <div class="radio-item">
                        <input type="radio" id="male" name="gender" value="male">
                        <label for="male">男</label>
                    </div>
                    <div class="radio-item">
                        <input type="radio" id="female" name="gender" value="female">
                        <label for="female">女</label>
                    </div>
                    <div class="radio-item">
                        <input type="radio" id="other" name="gender" value="other">
                        <label for="other">其他</label>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>兴趣爱好:</label>
                <div class="checkbox-group">
                    <div class="checkbox-item">
                        <input type="checkbox" id="reading" name="hobbies" value="reading">
                        <label for="reading">阅读</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="sports" name="hobbies" value="sports">
                        <label for="sports">运动</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="music" name="hobbies" value="music">
                        <label for="music">音乐</label>
                    </div>
                    <div class="checkbox-item">
                        <input type="checkbox" id="travel" name="hobbies" value="travel">
                        <label for="travel">旅行</label>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="message">留言:</label>
                <textarea id="message" name="message" rows="4" placeholder="请输入您的留言..."></textarea>
            </div>
            
            <div class="form-group">
                <input type="checkbox" id="agree" name="agree" required>
                <label for="agree">我同意相关条款和条件</label>
            </div>
            
            <button type="submit">提交表单</button>
            <button type="button" id="clear-btn">清空表单</button>
        </form>
        
        <div id="result" class="result" style="display: none;">
            <h3>表单提交结果:</h3>
            <pre id="result-content"></pre>
        </div>
        
        <script>
            document.getElementById('test-form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = {};
                
                // 处理普通字段
                for (let [key, value] of formData.entries()) {
                    if (data[key]) {
                        if (Array.isArray(data[key])) {
                            data[key].push(value);
                        } else {
                            data[key] = [data[key], value];
                        }
                    } else {
                        data[key] = value;
                    }
                }
                
                // 显示结果
                document.getElementById('result').style.display = 'block';
                document.getElementById('result-content').textContent = JSON.stringify(data, null, 2);
            });
            
            document.getElementById('clear-btn').addEventListener('click', function() {
                document.getElementById('test-form').reset();
                document.getElementById('result').style.display = 'none';
            });
        </script>
    </body>
    </html>
    `;

    log("加载表单测试页面...", "info");
    await page.setContent(formHtml);

    // 1. 文本输入
    log("正在填写文本输入框...", "info");
    await page.type("#name", "张三", { delay: 50 });
    await page.type("#email", "zhangsan@example.com", { delay: 50 });
    await page.type("#age", "25", { delay: 50 });

    // 2. 下拉选择
    log("正在选择下拉选项...", "info");
    await page.select("#city", "beijing");

    // 3. 单选按钮
    log("正在选择单选按钮...", "info");
    await page.click("#male");

    // 4. 复选框
    log("正在选择复选框...", "info");
    await page.click("#reading");
    await page.click("#sports");
    await page.click("#music");

    // 5. 文本域
    log("正在填写文本域...", "info");
    await page.type(
      "#message",
      "这是一个通过 Puppeteer 自动填写的表单测试。\n包含多行文本内容。",
      { delay: 30 }
    );

    // 6. 必填复选框
    log("正在勾选同意条款...", "info");
    await page.click("#agree");

    // 等待一下让用户看到填写过程
    await delay(2000);

    // 7. 提交表单
    log("正在提交表单...", "info");
    await page.click('button[type="submit"]');

    // 等待结果显示
    await page.waitForFunction(
      () => {
        const el = document.getElementById("result");
        return el && window.getComputedStyle(el).display !== "none";
      },
      { timeout: 30000 }
    );

    // 获取提交结果
    const formResult = await page.evaluate(() => {
      return document.getElementById("result-content").textContent;
    });

    log("表单提交成功！", "success");
    console.log("提交的数据:");
    console.log(formResult);

    await delay(2000);

    // 8. 清空表单
    log("正在清空表单...", "info");
    await page.click("#clear-btn");

    await delay(1000);

    // 9. 演示更高级的表单操作
    log("演示高级表单操作...", "info");

    // 使用 page.evaluate 进行复杂操作
    await page.evaluate(() => {
      // 批量设置表单值
      document.getElementById("name").value = "李四";
      document.getElementById("email").value = "lisi@example.com";
      document.getElementById("age").value = "30";

      // 触发 change 事件
      document.getElementById("name").dispatchEvent(new Event("change"));
      document.getElementById("email").dispatchEvent(new Event("change"));
      document.getElementById("age").dispatchEvent(new Event("change"));
    });

    // 使用键盘操作
    log("演示键盘操作...", "info");
    await page.focus("#message");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA"); // 全选
    await page.keyboard.up("Control");
    await page.keyboard.type("使用键盘快捷键清空并重新输入的内容");

    await delay(1000);

    // 10. 文件上传演示（模拟）
    log("演示文件操作...", "info");

    // 向页面添加文件输入框
    await page.evaluate(() => {
      const fileGroup = document.createElement("div");
      fileGroup.className = "form-group";
      fileGroup.innerHTML = `
        <label for="file">上传文件:</label>
        <input type="file" id="file" name="file" accept=".txt,.pdf,.jpg,.png">
      `;
      document
        .querySelector("form")
        .insertBefore(
          fileGroup,
          document.querySelector('button[type="submit"]')
        );
    });

    // 注意：在实际项目中，你可以这样上传文件：
    // const filePath = '/path/to/your/file.txt';
    // const input = await page.$('#file');
    // await input.uploadFile(filePath);

    // 11. 验证表单验证
    log("测试表单验证...", "info");

    // 清空必填字段
    await page.evaluate(() => {
      document.getElementById("name").value = "";
      document.getElementById("email").value = "invalid-email"; // 无效邮箱
    });

    // 尝试提交
    await page.click('button[type="submit"]');

    // 检查验证状态
    const validationResult = await page.evaluate(() => {
      const nameField = document.getElementById("name");
      const emailField = document.getElementById("email");

      return {
        nameValid: nameField.checkValidity(),
        emailValid: emailField.checkValidity(),
        nameValidationMessage: nameField.validationMessage,
        emailValidationMessage: emailField.validationMessage,
      };
    });

    log("表单验证结果:", "info");
    console.log(JSON.stringify(validationResult, null, 2));

    // 12. 恢复有效数据并最终提交
    log("恢复有效数据并提交...", "info");
    await page.evaluate(() => {
      document.getElementById("name").value = "王五";
      document.getElementById("email").value = "wangwu@example.com";
    });

    await page.click("#female"); // 选择不同的性别
    await page.click("#travel"); // 添加旅行兴趣

    await page.click('button[type="submit"]');

    // 等待最终结果
    await page.waitForFunction(
      () => {
        const el = document.getElementById("result");
        return el && window.getComputedStyle(el).display !== "none";
      },
      { timeout: 30000 }
    );

    const finalResult = await page.evaluate(() => {
      return document.getElementById("result-content").textContent;
    });

    log("最终表单提交成功！", "success");
    console.log("最终提交的数据:");
    console.log(finalResult);

    // 等待让用户看到最终结果
    await delay(3000);

    log("表单交互例子演示完成！", "success");
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
  formInteractionExample();
}
