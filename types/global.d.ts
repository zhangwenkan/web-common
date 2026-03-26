/**
 * 全局类型声明文件
 *
 * 功能说明：
 * 1. 声明全局变量类型（由 vite.config.mjs 中的 define 注入）
 * 2. 声明模块类型（用于 TypeScript 模块解析）
 */

declare global {
	/**
	 * 系统信息
	 *
	 * 由 vite.config.mjs 中的 define 注入
	 * 包含项目依赖信息和构建时间
	 *
	 * @example
	 * console.log(__SYSTEM_INFO__.lastBuildTime)  // 输出构建时间
	 * console.log(__SYSTEM_INFO__.pkg.dependencies)  // 输出依赖列表
	 */
	const __SYSTEM_INFO__: {
		pkg: {
			/** 项目运行时依赖 */
			dependencies: Record<string, string>;
			/** 项目开发依赖 */
			devDependencies: Record<string, string>;
		};
		/** 最后构建时间（格式：YYYY-MM-DD HH:mm:ss） */
		lastBuildTime: string;
	};

	/**
	 * 应用版本号
	 *
	 * 由 vite.config.mjs 中的 define 注入
	 * 使用构建时的时间戳作为版本标识
	 *
	 * 用途：
	 * - 前端版本更新检测
	 * - 静态资源缓存控制
	 *
	 * @example
	 * // 检测版本更新
	 * fetch('/version.json')
	 *   .then(res => res.json())
	 *   .then(data => {
	 *     if (data.version !== __APP_VERSION__) {
	 *       alert('检测到新版本，请刷新页面')
	 *     }
	 *   })
	 */
	const __APP_VERSION__: number;
}

/**
 * unplugin-icons 图标模块类型声明
 *
 * 允许通过 ~icons/ 前缀导入图标组件
 *
 * @example
 * // 导入 Element Plus 图标
 * import Edit from '~icons/ep/edit'
 *
 * // 导入 Material Design 图标
 * import Home from '~icons/mdi/home'
 */
declare module '~icons/*' {
	import { FunctionalComponent, SVGAttributes } from 'vue';
	const component: FunctionalComponent<SVGAttributes>;
	export default component;
}

// 确保此文件被视为模块
export {};
