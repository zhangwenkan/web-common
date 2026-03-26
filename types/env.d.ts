/// <reference types="vite/client" />

interface ImportMetaEnv {
	// 应用配置
	readonly VITE_APP_TITLE: string; // 应用标题
	readonly VITE_APP_MODE: 'dev' | 'prod'; // 应用模式
	readonly VITE_APP_API_BASEURL?: string; // API 基础路径
	readonly VITE_APP_MOCK_BASEURL?: string; // Mock API 基础路径

	// 开发环境配置（import.meta.env 原始值均为字符串）
	readonly VITE_APP_DEV_USE_MOCK?: string;
	readonly VITE_APP_PRO_USE_MOCK?: string;

	// 代理配置（JSON/布尔字符串，在 Vite 配置层通过 wrapperEnv 转换）
	readonly VITE_OPEN_PROXY?: string;
	readonly VITE_PROXY?: string;

	// 构建配置（import.meta.env 原始值均为字符串）
	readonly VITE_BUILD_COMPRESS?: string; // gzip | brotli | gzip,brotli
	readonly VITE_BUILD_SOURCEMAP?: string;
	readonly VITE_BUILD_DROP_CONSOLE?: string;
	readonly VITE_BUILD_MOCK?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
