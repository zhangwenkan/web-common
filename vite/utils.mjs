/**
 * 环境变量处理工具
 *
 * 功能说明：
 * 1. 处理环境变量中的换行符（将 \n 字符串转换为真正的换行符）
 * 2. 将字符串类型的布尔值转换为真正的布尔类型（'true' -> true, 'false' -> false）
 * 3. 解析 JSON 格式的代理配置字符串
 * 4. 将处理后的环境变量注入到 process.env 中
 *
 * @description 环境变量包装处理工具
 * @param envConf - 从 .env 文件加载的原始环境变量对象
 * @returns 处理后的环境变量对象
 *
 * @example
 * // .env 文件内容
 * VITE_OPEN_PROXY = 'true'
 * VITE_PROXY = [["/api","http://localhost:3000"]]
 *
 * // 处理后
 * wrapperEnv(env) => {
 *   VITE_OPEN_PROXY: true,  // 字符串转为布尔值
 *   VITE_PROXY: [["/api","http://localhost:3000"]]  // JSON 字符串转为数组
 * }
 */
import process from 'node:process';

export function wrapperEnv(envConf) {
	const ret = {};

	// 遍历所有环境变量进行类型转换处理
	for (const envName of Object.keys(envConf)) {
		// 1. 处理换行符：将字符串中的 \n 替换为真正的换行符
		let realName = envConf[envName].replace(/\\n/g, '\n');

		// 2. 处理布尔值：将字符串 'true'/'false' 转换为布尔类型
		realName = realName === 'true' ? true : realName === 'false' ? false : realName;

		// 3. 特殊处理代理配置：将 JSON 字符串解析为数组/对象
		// 环境变量中的 JSON 需要使用单引号包裹，这里将单引号替换为双引号后解析
		if (envName === 'VITE_PROXY' && realName) {
			try {
				realName = JSON.parse(realName.replace(/'/g, '"'));
			} catch {
				// JSON 解析失败时返回空字符串
				realName = '';
			}
		}

		// 4. 存储处理后的值
		ret[envName] = realName;

		// 5. 同步注入到 process.env（仅支持字符串类型）
		if (typeof realName === 'string') {
			process.env[envName] = realName;
		} else if (typeof realName === 'object') {
			// 对象类型需要序列化为 JSON 字符串
			process.env[envName] = JSON.stringify(realName);
		}
	}

	return ret;
}
