# 首页应用场景滚动展示

2026-11-16：四个补充场景改为与主要示例一致的左图右文行式布局，移动端自然单列。七个示例统一放入有独立滚动条的 `applications-viewport`，最大高度为 720px / 72svh 中较小值。滚动区域支持键盘焦点和原生方向键/PageDown；在区域外可以继续滚动整页。不使用强制吸附或滚动劫持脚本。

内容：`content/applications.ts`，中英文说明、图片替代文字及滚动提示集中管理。
展示：`components/home/model-applications.tsx`，补充图片按场景 ID 读取 `/images/application-{id}.webp`。
样式：`app/styles/home.css`，仅应用场景相关规则。

保留 7 个真实数据入口和数据集编号；没有修改推理接口、Playground 或首页 Hero。图片为生成的概念图，不代表模型预测，来源及发布前确认事项见 ASSET_LICENSES.md。

## 实际验收

- `npm run typecheck`、`npm run lint`：通过。
- `node --test scripts/data-contract.test.mjs`：39/39 通过，覆盖七个应用入口的数据集映射。
- `npm run build -- --webpack`：通过，25 个静态页面生成成功。首次尝试因本地目录权限 EPERM 失败；允许构建目录写入后重试通过，未跳过检查。
- 本地生产预览 `http://127.0.0.1:3000` 已启动。最初受本地套接字权限影响不可访问，重新以可访问本机网络的进程启动后正常。
- 浏览器实测：中文 1440×1000、390×844，英文 1024×900、390×844。检查的页面及滚动区均无横向溢出，七张图片正常加载。
- 区域内滚轮测试：区域 scrollTop 从 896.8 增至 1076.8，整页 scrollY 保持 1532.8；原生滚轮独立滚动正常。键盘 PageDown 可浏览区域；聚焦时浏览器会将区域滚入视口。
- 实际点击英文电商入口，正确进入 `?dataset=46947` 并加载 Shopping intention（180 行、11 列）。没有提交远程模型推理。
- 当前测试标签页未捕获 Console Error；未进行实体触屏设备验收。
- 截图：`screenshots/application-gallery/desktop-zh.jpg`、`mobile-zh.jpg`、`mobile-en.jpg`。
