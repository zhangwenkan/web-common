/**
 * Vite 插件统一配置入口
 *
 * 功能说明：
 * 1. 统一管理和导出所有 Vite 插件配置
 * 2. 支持根据环境变量动态加载插件
 * 3. 提供插件配置的模块化管理
 *
 * 插件列表：
 * - vue: Vue 3 单文件组件支持
 * - vueJsx: Vue JSX 语法支持
 * - ElementPlus: Element Plus 样式自动导入
 * - Icons: 图标自动安装和导入
 * - versionUpdate: 版本更新检测
 * - autoImport: API 自动导入（vue, vue-router, pinia 等）
 * - components: 组件自动注册
 * - svgIcon: SVG 图标自动注册
 * - mock: Mock 数据服务
 * - layouts: 布局系统
 * - compression: 构建产物压缩（Gzip/Brotli）
 * - restart: 开发时监听配置文件变化自动重启 Vite
 * - setupExtend: setup 语法中直接定义组件 name
 *
 * @description Vite 插件配置集合
 */
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { visualizer } from 'rollup-plugin-visualizer';
import autoImport from 'unplugin-auto-import/vite';
import ElementPlus from 'unplugin-element-plus/vite';
import Icons from 'unplugin-icons/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import components from 'unplugin-vue-components/vite';
import { compression } from 'vite-plugin-compression2';
import { vitePluginFakeServer } from 'vite-plugin-fake-server';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import Layouts from 'vite-plugin-vue-meta-layouts';
import setupExtend from 'vite-plugin-vue-setup-extend';

/**
 * 图片优化插件配置
 *
 * 功能：
 * - 自动压缩 PNG、JPG、GIF、SVG 等图片格式
 * - 减小图片体积，提升加载速度
 * - 仅在生产环境构建时启用
 *
 * 使用方式：
 * - 需要先安装：pnpm add -D vite-plugin-imagemin
 * - 构建时会自动压缩 src/assets 目录下的图片
 *
 * 注意：首次使用时会下载压缩工具，可能需要较长时间
 */
function createImagemin(_isBuild) {
	// 由于 vite-plugin-imagemin 需要额外安装，这里提供配置示例
	// 如需启用，请先执行：pnpm add -D vite-plugin-imagemin
	// 然后取消下面代码的注释

	// if (!_isBuild) return [];
	//
	// import viteImagemin from 'vite-plugin-imagemin';
	//
	// return viteImagemin({
	// 	gifsicle: { optimizationLevel: 7 },
	// 	optipng: { optimizationLevel: 7 },
	// 	mozjpeg: { quality: 80 },
	// 	pngquant: { quality: [0.8, 0.9], speed: 4 },
	// 	svgo: {
	// 		plugins: [
	// 			{ name: 'removeViewBox', active: false },
	// 			{ name: 'removeEmptyAttrs', active: false },
	// 		],
	// 	},
	// });

	return [];
}

/**
 * 构建分析工具配置
 *
 * 功能：
 * - 生成构建产物分析报告（HTML 格式）
 * - 显示每个模块的大小和依赖关系
 * - 支持 Gzip 和 Brotli 压缩大小显示
 *
 * 使用方式：
 * - 执行 pnpm run build 后，会在 dist 目录生成 stats.html
 * - 在浏览器中打开 stats.html 查看分析报告
 */
function createVisualizer(isBuild) {
	if (!isBuild) return [];

	return visualizer({
		filename: 'dist/stats.html', // 输出文件路径
		open: false, // 构建后不自动打开浏览器
		gzipSize: true, // 显示 gzip 压缩后的大小
		brotliSize: true, // 显示 brotli 压缩后的大小
	});
}

/**
 * API 自动导入配置
 *
 * 功能：
 * - 自动导入 Vue、Vue Router、Pinia 的 API，无需手动 import
 * - 自动导入 Element Plus 组件
 * - 自动扫描 src/composables 目录下的函数并导入
 *
 * 使用示例：
 * // 无需写 import { ref, computed } from 'vue'
 * const count = ref(0)
 * const double = computed(() => count.value * 2)
 */
function createAutoImport() {
	return autoImport({
		// 预设自动导入的库
		imports: ['vue', 'vue-router', 'pinia'],
		// Element Plus 组件自动导入解析器
		resolvers: [ElementPlusResolver()],
		// 类型声明文件输出路径
		dts: './types/auto-imports.d.ts',
		// 自动扫描并导入 composables 目录下的函数
		dirs: ['./src/composables/**'],
	});
}

/**
 * 组件自动注册配置
 *
 * 功能：
 * - 自动注册 src/components 目录下的组件
 * - 支持 .vue、.tsx 文件格式
 * - 自动导入 Element Plus 组件
 *
 * 使用示例：
 * // 无需 import，直接使用
 * <MyComponent />
 */
function createComponents() {
	return components({
		// 组件扫描目录
		dirs: ['src/components'],
		// 包含的文件类型
		include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
		// Element Plus 组件自动导入解析器
		resolvers: [ElementPlusResolver()],
		// 类型声明文件输出路径
		dts: './types/components.d.ts',
	});
}

/**
 * SVG 图标自动注册配置
 *
 * 功能：
 * - 自动扫描 src/assets/icons 目录下的 SVG 文件
 * - 生成 SVG Sprite，通过 symbol 引用
 * - 生产环境自动使用 SVGO 优化 SVG
 *
 * 使用示例：
 * // 在 main.ts 中导入：import 'virtual:svg-icons-register'
 * // 在组件中使用：
 * <svg><use xlink:href="#icon-example-star" /></svg>
 */
function createSvgIcon(isBuild) {
	return createSvgIconsPlugin({
		// SVG 图标目录
		iconDirs: [path.resolve(process.cwd(), 'src/assets/icons/')],
		// symbol ID 格式：icon-{目录名}-{文件名}
		symbolId: 'icon-[dir]-[name]',
		// 生产环境启用 SVGO 优化
		svgoOptions: isBuild,
	});
}

/**
 * Mock 数据服务配置
 *
 * 功能：
 * - 开发环境提供 Mock 数据接口
 * - 支持生产环境 Mock（可选）
 * - 自动扫描 src/mock 目录下的 Mock 文件
 *
 * 使用示例：
 * // src/mock/test.ts
 * export default defineFakeRoute([{
 *   url: '/api/user',
 *   method: 'get',
 *   response: () => ({ code: 200, data: { name: 'test' } })
 * }])
 */
function createMock(env, isBuild) {
	const { VITE_BUILD_MOCK } = env;
	return vitePluginFakeServer({
		// 开发环境显示日志
		logger: !isBuild,
		// Mock 文件目录
		include: 'src/mock',
		// 不在文件名中添加中间件标识
		infixName: false,
		// 生产环境是否启用 Mock（通过环境变量控制）
		enableProd: isBuild && VITE_BUILD_MOCK === 'true',
	});
}

/**
 * 布局系统配置
 *
 * 功能：
 * - 支持通过路由 meta 自动匹配布局组件
 * - 默认使用 layouts/index.vue 作为布局
 *
 * 使用示例：
 * // 路由配置
 * {
 *   path: '/dashboard',
 *   component: () => import('@/views/dashboard.vue'),
 *   meta: { layout: 'index' }  // 使用 layouts/index.vue
 * }
 */
function createLayouts() {
	return Layouts({
		// 默认布局名称
		defaultLayout: 'index',
	});
}

/**
 * 构建产物压缩配置
 *
 * 功能：
 * - 支持 Gzip 压缩
 * - 支持 Brotli 压缩（压缩率更高）
 * - 通过环境变量 VITE_BUILD_COMPRESS 控制压缩格式
 *
 * 环境变量配置：
 * VITE_BUILD_COMPRESS = gzip        # 仅 Gzip
 * VITE_BUILD_COMPRESS = brotli      # 仅 Brotli
 * VITE_BUILD_COMPRESS = gzip,brotli # 同时生成两种格式
 */
function createCompression(env, isBuild) {
	const plugin = [];

	if (isBuild) {
		const { VITE_BUILD_COMPRESS } = env;
		// 解析压缩格式列表
		const compressList = VITE_BUILD_COMPRESS.split(',');

		// Gzip 压缩
		if (compressList.includes('gzip')) {
			plugin.push(compression());
		}

		// Brotli 压缩（压缩率更高，但兼容性略差）
		if (compressList.includes('brotli')) {
			plugin.push(
				compression({
					// 排除已压缩的文件
					exclude: [/\.(br)$/, /\.(gz)$/],
					// 使用 Brotli 算法
					algorithms: ['brotliCompress'],
				})
			);
		}
	}

	return plugin;
}

/**
 * 版本更新检测插件
 *
 * 功能：
 * - 构建时在 public 目录生成 version.json 文件
 * - 前端可通过请求该文件检测版本更新
 * - 用于实现"检测到新版本，请刷新页面"功能
 *
 * 生成文件内容：
 * { "version": 1709123456789 }  // 构建时间戳
 */
function versionUpdate(options) {
	let configPath;

	return {
		name: 'refreshVersion',
		// 获取 Vite 解析后的配置
		configResolved(resolvedConfig) {
			configPath = resolvedConfig.publicDir;
		},
		// 构建开始时生成版本文件
		async buildStart() {
			const file = `${configPath}${path.sep}version.json`;
			const content = JSON.stringify({ version: options.version });

			if (fs.existsSync(configPath)) {
				// 目录存在，直接写入文件
				fs.writeFile(file, content, (err) => {
					if (err) throw err;
				});
			} else {
				// 目录不存在，先创建目录再写入文件
				fs.mkdir(configPath, (err) => {
					if (err) throw err;
					fs.writeFile(file, content, (err) => {
						if (err) throw err;
					});
				});
			}
		},
	};
}

/**
 * Vue Setup 语法扩展插件
 *
 * 功能：
 * - 允许在 <script setup> 标签上直接定义组件 name
 * - 解决 setup 语法无法自定义组件 name 的问题
 * - 配合 keep-alive 使用时非常有用
 *
 * 使用示例：
 * // 传统方式需要写两个 script 标签：
 * <script setup>
 *   // 组件逻辑
 * </script>
 * <script>
 *   export default { name: 'MyComponent' }
 * </script>
 *
 * // 使用本插件后，可以直接在 setup 标签上定义 name：
 * <script setup name="MyComponent">
 *   // 组件逻辑
 * </script>
 */
function createSetupExtend() {
	return setupExtend();
}

/**
 * 创建 Vite 插件列表
 *
 * @param viteEnv - 环境变量对象
 * @param isBuild - 是否为构建模式
 * @param nowTime - 当前时间戳（用于版本标识）
 * @returns 插件数组
 */
export default function createVitePlugins(viteEnv, isBuild = false, nowTime) {
	const vitePlugins = [
		// ========== 基础插件 ==========
		vue(), // Vue 3 支持
		vueJsx(), // JSX 支持
		ElementPlus({}), // Element Plus 样式自动导入
		Icons({
			autoInstall: true, // 自动安装图标包
		}),
		versionUpdate({
			version: nowTime, // 版本时间戳
		}),

		// ========== 自动导入插件 ==========
		createAutoImport(), // API 自动导入
		createComponents(), // 组件自动注册
		createSvgIcon(isBuild), // SVG 图标注册
		createSetupExtend(), // setup 语法 name 扩展

		// ========== 开发辅助插件 ==========
		createMock(viteEnv, isBuild), // Mock 服务
		createLayouts(), // 布局系统

		// ========== 构建优化插件 ==========
		...createCompression(viteEnv, isBuild), // 代码压缩
		createVisualizer(isBuild), // 构建分析工具
		createImagemin(isBuild), // 图片优化（需额外安装）
	];

	return vitePlugins;
}
