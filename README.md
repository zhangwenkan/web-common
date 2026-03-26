# Web Wsi

一个偏轻量的 Vue 3 + Vite 基础脚手架，内置路由、Pinia、国际化、Element Plus、SVG 图标、Mock、Lint 规范和基础构建优化，适合作为中后台或通用 Web 项目的起点。

## 特性概览

- Vue 3 + Vite 8 + TypeScript
- Pinia 状态管理
- Vue Router 路由基础结构
- Vue I18n 国际化
- Element Plus 组件库
- SVG Sprite 图标方案
- Mock 数据能力
- ESLint + Prettier + Stylelint + Husky + lint-staged
- 基础构建优化（压缩、分包、版本文件）
- Vitest 最小单测基线

## 推荐环境

- Node.js >= 18
- pnpm >= 8

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm run dev

# 打包
pnpm run build

# 预览产物
pnpm run preview
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm run dev` | 启动开发环境 |
| `pnpm run build` | 类型检查并打包 |
| `pnpm run preview` | 预览构建产物 |
| `pnpm run test` | 运行单元测试 |
| `pnpm run test:watch` | 监听模式运行单元测试 |
| `pnpm run lint` | 运行全部 lint 检查 |
| `pnpm run lint:check` | 运行全部 lint 检查 |
| `pnpm run lint:fix` | 自动修复可修复问题 |
| `pnpm run gen` | 运行 plop 模板生成 |

### 分项检查命令

- `pnpm run lint:check:eslint`
- `pnpm run lint:check:prettier`
- `pnpm run lint:check:stylelint`
- `pnpm run lint:fix:eslint`
- `pnpm run lint:fix:prettier`
- `pnpm run lint:fix:stylelint`
- `pnpm run lint:staged`

## 目录结构

```text
src/
├── api/            # 请求封装与接口类型
├── components/     # 通用组件
├── layouts/        # 布局组件
├── locales/        # 国际化资源
├── router/         # 路由配置
├── store/          # Pinia store
├── styles/         # 全局样式与主题
├── utils/          # 通用工具函数
└── views/          # 页面视图
vite/
├── plugins.mjs     # Vite 插件集合
├── proxy.mjs       # 代理生成逻辑
└── utils.mjs       # 环境变量转换工具
types/              # 全局类型声明
```

## 环境变量说明

### 基础变量

| 变量名 | 说明 |
| --- | --- |
| `VITE_APP_TITLE` | 应用标题 |
| `VITE_APP_MODE` | 应用模式标识，开发为 `dev`，生产为 `prod` |
| `VITE_APP_DEV_USE_MOCK` | 开发环境是否使用 Mock |
| `VITE_APP_PRO_USE_MOCK` | 生产环境是否使用 Mock |

### 代理相关

| 变量名 | 说明 |
| --- | --- |
| `VITE_OPEN_PROXY` | 是否开启代理能力；在当前实现中主要影响 `changeOrigin` |
| `VITE_PROXY` | 代理配置列表，格式为 JSON 字符串数组 |

示例：

```env
VITE_OPEN_PROXY = true
VITE_PROXY = [["/api","http://localhost:3000"],["/mock/api","http://localhost:3000"]]
```

### 构建相关

| 变量名 | 说明 |
| --- | --- |
| `VITE_BUILD_COMPRESS` | 构建压缩格式，支持 `gzip`、`brotli`、`gzip,brotli` |
| `VITE_BUILD_SOURCEMAP` | 是否生成 sourcemap |
| `VITE_BUILD_DROP_CONSOLE` | 是否在生产构建中移除 `console` |
| `VITE_BUILD_MOCK` | 是否在生产构建中启用 Mock |

### 关于类型

`import.meta.env` 读取到的原始值都是字符串。

当前项目只在 Vite 配置层通过 [vite/utils.mjs](vite/utils.mjs) 里的 `wrapperEnv` 做布尔值和 JSON 转换，因此：

- 业务代码里不要默认把 `import.meta.env.VITE_OPEN_PROXY` 当成 boolean
- `VITE_PROXY` 这类 JSON 配置也应视为原始字符串，只有在配置层转换后才是数组

## 测试说明

项目已提供最小 Vitest 基线：

- 配置文件：[vitest.config.mjs](vitest.config.mjs)
- 示例测试：[src/utils/utils.test.ts](src/utils/utils.test.ts)

你可以按同样方式继续在 `src/**/*.test.ts` 下补充测试。

## 包管理器约定

项目默认使用 **pnpm**。

仓库应只保留 `pnpm-lock.yaml`，避免与 npm 锁文件混用造成依赖不一致。

## 当前模板定位

这个脚手架重点提供的是“基础工程能力”，包括：

- 基础页面结构
- 工程化规范
- 常用开发插件
- 构建和代理配置

它**不会**预置完整业务系统，例如：

- 权限系统
- 动态路由
- 完整请求模块拆分规范
- 完整测试体系（当前只提供最小基线）

这些能力建议按具体项目需要逐步补充。
