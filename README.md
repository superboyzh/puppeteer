# Puppeteer 学习项目

这个项目包含了多个 Puppeteer 使用例子，帮助您学习和掌握这个强大的自动化工具。

## 什么是 Puppeteer？

Puppeteer 是一个 Node.js 库，它提供了一个高级 API 来控制 Chrome 或 Chromium 浏览器（通过 DevTools 协议）。默认情况下，Puppeteer 以无头模式运行，但可以配置为运行有头的 Chrome 或 Chromium。

## 主要功能

- 生成页面的截图和 PDF
- 爬取单页应用程序（SPA）并生成预渲染内容
- 自动化表单提交、UI 测试、键盘输入等
- 测试你的站点是否适用于最新的 JavaScript 和浏览器功能
- 捕获网站的时间线轨迹，帮助诊断性能问题

## 安装

```bash
pnpm install
```

## 使用例子

### 1. 基础例子
```bash
pnpm start
# 或者
node examples/basic-example.js
```

### 2. 网页截图
```bash
pnpm screenshot
```

### 3. 生成 PDF
```bash
pnpm pdf
```

### 4. 网页数据抓取
```bash
pnpm scraping
```

### 5. 表单交互
```bash
pnpm form
```

### 6. 性能测试
```bash
pnpm performance
```

### 7. 移动端模拟
```bash
pnpm mobile
```

## 项目结构

```
puppeteer/
├── package.json
├── README.md
├── examples/
│   ├── basic-example.js      # 基础使用例子
│   ├── screenshot.js         # 网页截图
│   ├── generate-pdf.js       # 生成PDF
│   ├── web-scraping.js       # 网页数据抓取
│   ├── form-interaction.js   # 表单交互
│   ├── performance-test.js   # 性能测试
│   └── mobile-simulation.js  # 移动端模拟
├── output/                   # 输出文件目录
└── utils/                    # 工具函数
    └── helpers.js
```

## 注意事项

1. 首次运行时，Puppeteer 会下载 Chromium 浏览器（约 ~170MB Mac，~282MB Linux，~280MB Win）
2. 某些例子可能需要访问外部网站，请确保网络连接正常
3. 生成的截图和 PDF 文件会保存在 `output/` 目录中

## 学习建议

建议按照以下顺序学习：
1. 先运行基础例子了解 Puppeteer 的基本概念
2. 学习截图功能
3. 尝试数据抓取
4. 练习表单交互
5. 最后学习性能测试和移动端模拟

## 参考资源

- [Puppeteer 官方文档](https://pptr.dev/)
- [Puppeteer GitHub](https://github.com/puppeteer/puppeteer)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
