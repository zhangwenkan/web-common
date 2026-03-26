/**
 * 服务端口配置
 *
 * @description 根据环境变量动态获取 API 基础地址
 */

/**
 * 后端接口请求地址服务
 */
const BASEURL: Record<string, string> = {
	dev: '/api',
	test: 'http://127.0.0.1:8080/api',
	sit: '',
	prod: '',
};

/**
 * 导出当前环境的 API 基础地址
 */
export const PORT = BASEURL[import.meta.env.VITE_APP_MODE] || '/api';
