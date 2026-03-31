/**
 * Vite 主配置文件
 *
 * 功能说明：
 * 1. 加载环境变量并进行类型转换处理
 * 2. 配置开发服务器（端口、代理、CORS等）
 * 3. 配置构建选项（输出目录、压缩、代码分割等）
 * 4. 配置全局变量和路径别名
 * 5. 配置 SCSS 预处理器（自动注入全局变量）
 *
 * @description Vite 配置入口文件
 * @author zhangwk
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import pkg from './package.json';
import { formatDateTime } from './src/utils/utils.ts';
import createVitePlugins from './vite/plugins.mjs';
import { createProxy } from './vite/proxy.mjs';
import { wrapperEnv } from './vite/utils.mjs';

// 构建时间统计插件
function buildTimePlugin() {
	let startTime;
	return {
		name: 'build-time',
		enforce: 'pre',
		buildStart() {
			startTime = Date.now();
			console.log('\n🚀 构建开始...');
			console.log(`📅 时间: ${new Date().toLocaleString()}`);
			console.log(`🌍 环境: ${process.env.NODE_ENV}`);
			console.log(`📦 模式: ${process.env.VITE_APP_MODE}\n`);
		},
		closeBundle() {
			const endTime = Date.now();
			const duration = ((endTime - startTime) / 1000).toFixed(2);
			console.log(`\n✅ 构建完成`);
			console.log(`⏱️  耗时: ${duration} 秒`);
			console.log(`📊 输出: dist/\n`);
		},
	};
}

export default async ({ mode, command }) => {
	// 加载当前模式的环境变量
	const env = loadEnv(mode, process.cwd());
	// 对环境变量进行类型转换处理（如 'true' -> true, JSON字符串解析等）
	const viteEnv = wrapperEnv(env);
	// 生成构建时间戳，用于版本标识
	const nowTime = new Date().getTime();

	// 从处理后的环境变量中提取代理相关配置
	const { VITE_PROXY, VITE_OPEN_PROXY, VITE_APP_MODE, VITE_BUILD_DROP_CONSOLE } = viteEnv;
	// 用于存储全局 SCSS 变量文件的导入语句
	const scssResources = [];

	// 自动扫描 src/styles/resources 目录下的所有 SCSS 文件
	// 这些文件会被自动注入到所有组件的样式中，无需手动导入
	const scssDir = 'src/styles/resources';
	if (fs.existsSync(scssDir)) {
		fs.readdirSync(scssDir)
			.filter((file) => file.endsWith('.scss')) // 只处理 .scss 文件
			.forEach((file) => {
				// Vite 8 需要使用别名路径或绝对路径
				scssResources.push(`@use "@/styles/resources/${file}" as *;`);
			});
	}

	return defineConfig({
		// 项目部署的基础路径，'./' 表示相对路径部署
		base: './',

		// 开发服务器配置
		server: {
			port: 3001, // 开发服务器端口号
			host: '0.0.0.0', // 允许外部访问（局域网内可访问）
			// 仅在开发模式下启用代理，避免生产环境代理冲突
			proxy: VITE_APP_MODE == 'dev' ? createProxy(VITE_PROXY, VITE_OPEN_PROXY) : {},
			open: false, // 启动时不自动打开浏览器
			cors: true, // 开启 CORS 跨域支持
		},

		// 构建配置
		build: {
			target: 'es2020', // 构建目标，兼容现代浏览器（包体积更小，性能更好）
			cssTarget: 'chrome90', // CSS 兼容目标，防止 rgba() 被转换为 #RGBA 十六进制
			outDir: 'dist', // 构建产物输出目录
			minify: 'terser', // 使用 terser 进行压缩，显式控制 drop_console / drop_debugger
			// 是否生成 sourcemap，通过环境变量控制
			sourcemap: env.VITE_BUILD_SOURCEMAP === 'true',
			terserOptions: {
				compress: {
					drop_console: Boolean(VITE_BUILD_DROP_CONSOLE),
					drop_debugger: true,
				},
			},
			reportCompressedSize: false, // 禁用压缩大小报告，略微加速打包
			cssCodeSplit: true, // 启用 CSS 代码分割
			chunkSizeWarningLimit: 2000, // chunk 大小警告阈值（单位：KB），默认 2MB，尽早暴露包体积问题
			rollupOptions: {
				output: {
					// 代码块文件命名规则
					chunkFileNames: 'static/js/[name]-[hash].js',
					// 入口文件命名规则
					entryFileNames: 'static/js/[name]-[hash].js',
					// 静态资源文件命名规则（按扩展名分类）
					assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
					// 自定义代码分割策略
					// 将 Vue 全家桶和 Element Plus 单独打包，其他依赖按模块名分割
					manualChunks(id) {
						// Vue 全家桶单独打包
						if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
							return 'vue-vendor';
						}
						// Element Plus 单独打包
						if (id.includes('element-plus')) {
							return 'element-plus';
						}
						// 其他 node_modules 按模块名分割
						if (id.includes('node_modules')) {
							const match = id.toString().match(/\/node_modules\/(?!.pnpm)(?<moduleName>[^/]*)\//);
							return match?.groups?.moduleName ?? 'vendor';
						}
					},
				},
			},
		},

		// 依赖预构建配置
		optimizeDeps: {
			include: ['vue', 'vue-router', 'pinia', 'axios', 'element-plus'],
			exclude: ['@iconify/json'], // 排除大型 JSON 文件
		},

		// 全局常量定义
		// 可在代码中直接使用 __SYSTEM_INFO__ 和 __APP_VERSION__
		define: {
			// 系统信息：包含依赖信息和构建时间
			__SYSTEM_INFO__: JSON.stringify({
				pkg: {
					dependencies: pkg.dependencies,
					devDependencies: pkg.devDependencies,
				},
				lastBuildTime: formatDateTime(),
			}),
			// 应用版本号（时间戳），用于版本更新检测
			__APP_VERSION__: nowTime,
		},

		// 插件配置
		plugins: [buildTimePlugin(), ...createVitePlugins(env, command === 'build', nowTime)],

		// 路径别名配置
		resolve: {
			alias: {
				'@': path.resolve(process.cwd(), 'src'), // @ 指向 src 目录
				'#': path.resolve(process.cwd(), 'types'), // # 指向 types 目录
			},
		},

		// CSS 预处理器配置
		css: {
			preprocessorOptions: {
				scss: {
					// 自动注入全局 SCSS 变量，所有组件无需手动导入即可使用
					additionalData: scssResources.join(''),
					// 静默旧版 JS API 的弃用警告
					silenceDeprecations: ['legacy-js-api'],
				},
			},
		},
	});
};
