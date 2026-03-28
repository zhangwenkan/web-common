/**
 * 代理配置生成工具
 *
 * 功能说明：
 * 1. 根据代理列表动态生成 Vite 代理配置
 * 2. 自动识别 HTTP/HTTPS 目标地址并配置 secure 选项
 * 3. 支持路径重写功能
 * 4. 支持 changeOrigin 配置，解决跨域问题
 *
 * @description 创建开发服务器代理配置
 * @param list - 代理列表，格式为 [[前缀, 目标地址], ...]
 * @param VITE_OPEN_PROXY - 是否开启代理（控制 changeOrigin 和路径重写行为）
 * @returns Vite 代理配置对象
 *
 * @example
 * // 环境变量配置
 * VITE_PROXY = [["/api","http://localhost:8080"],["/mock","https://mock.server.com"]]
 * VITE_OPEN_PROXY = true
 *
 * // 生成的代理配置
 * createProxy([["/api","http://localhost:8080"]], true) => {
 *   "/api": {
 *     target: "http://localhost:8080",
 *     changeOrigin: true,
 *     rewrite: (path) => path.replace(/^\/api/, "/api")
 *   }
 * }
 */

// HTTPS 协议正则，用于判断目标地址是否为 HTTPS
const httpsRE = /^https:\/\//;

export function createProxy(list = [], VITE_OPEN_PROXY) {
	const ret = {};

	// 遍历代理列表，为每个代理项生成配置
	for (const [prefix, target] of list) {
		// 判断目标地址是否为 HTTPS
		const isHttps = httpsRE.test(target);

		ret[prefix] = {
			target, // 代理目标地址
			changeOrigin: VITE_OPEN_PROXY, // 是否修改请求头中的 Origin，解决跨域问题
			// 路径重写规则：移除前缀，将请求转发到目标服务器
			// 例如：/api/user -> /user
			// rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ''),
			// HTTPS 目标地址需要设置 secure: false 以忽略证书验证
			...(isHttps ? { secure: false } : {}),
		};
	}

	return ret;
}
