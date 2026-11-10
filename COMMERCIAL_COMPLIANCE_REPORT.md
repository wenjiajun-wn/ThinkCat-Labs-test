# 商用准备审计

日期：2026-11-09。第一阶段工程检查及本地浏览器预览已完成。正式发布前仍需确认内容、备案及第三方许可义务。

## 页面资源与交付边界

- 使用系统字体回退。仓库与静态产物没有自带第三方字体文件。不同系统的字形和换行会略有差异。
- 首页曲面、曲线、矩阵及行业图形由项目原创 SVG/CSS 绘制。示意数据标明为合成数据。品牌字标为文本，箭头使用字符。无第三方图片、视频、图标库或复制的 Runway 素材。详见 ASSET_LICENSES.md。
- 静态交付 `out/`。Next、React、React DOM 以 MIT 声明，已在安装包内核对对应文本。公开交付的第三方声明在 `public/THIRD_PARTY_NOTICES.txt`，由 `node scripts/notices.mjs` 从实际安装包提取，共 136 份，包含 Next 的打包子组件声明。更新依赖后重新生成并检查。

## 依赖许可证与待确认项

`npm run audit:licenses` 枚举了 348 个已安装包。`THIRD_PARTY_LICENSES.md` 列出版本、声明和文件证据。扫描覆盖当前 Windows 安装的运行、开发和平台包，未安装的其他平台可选包未逐一核对原文。自动清单供人工复核。

- Sharp 的 Windows 原生和可选 WASM 包声明包含 LGPL-3.0-or-later。当前站点使用静态导出及关闭图片优化的配置。未在 `out/` 发现 Sharp 原生二进制或 WASM。交付构建容器、依赖目录或离线构建包时，单独确认 LGPL 等许可义务。
- 清单另含 MPL-2.0（axe-core）、CC-BY-4.0（caniuse-lite）、Python-2.0、BlueOak-1.0.0 等。部署前由负责方按实际分发范围复核声明、署名及适用条款。
- 扫描标记了 21 条缺少包根目录许可证文件的记录，例如 `@next/env`、Windows SWC 和 `client-only`。这表示当前证据缺口。需核对精确版本的上游文本及 Next 内嵌副本，尤其是进入公开交付的组件。

## 漏洞和上线边界

最终锁定依赖的 `npm audit --json` 报告 8 条中危记录，均追溯到开发依赖 `@typescript-eslint/typescript-estree` 下的 minimatch 10.2.6。公开公告 GHSA-g3hv-75wg-m249 给出的修复版本为 11.0.1，超出当前上游版本范围。`npm audit --omit=dev --json` 返回 0 条。ESLint 9 安装时还提示停止支持，后续随官方 lint 配置升级。日志位于 `artifacts/npm-audit*.json`。

上线前补齐真实域名、法定主体、联系方式、适用备案及隐私说明。公司 PPT 中未核实的论文归属和对外公开信息保持待确认。工程测试和未覆盖项见 PHASE_1_ACCEPTANCE.md。


## 第二阶段增量审计

新增页面使用项目内生成的 SVG、系统字体和文字箭头。未增加 npm、字体、图库、视频或外部图标依赖。`package.json` 与 `package-lock.json` 的第三方清单保持不变。研究候选论文只显示名称及待核实状态，未填写作者、会议或链接。所有行业图形标注合成演示数据。第一阶段记录的许可证证据缺口与开发依赖漏洞仍需按上述要求处理。
