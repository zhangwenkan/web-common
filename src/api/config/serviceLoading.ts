/**
 * 全局 Loading 配置
 *
 * @description 请求时显示全局加载动画，支持并发请求合并
 */
import { ElLoading } from 'element-plus';

let loadingInstance: ReturnType<typeof ElLoading.service>;
let needLoadingRequestCount = 0;

/**
 * 开始 Loading
 */
function startLoading() {
	loadingInstance = ElLoading.service({
		fullscreen: true,
		lock: true,
		text: '数据加载中，请稍候...',
		background: 'rgba(0, 0, 0, 0.5)',
	});
}

/**
 * 结束 Loading
 */
function endLoading() {
	loadingInstance.close();
}

/**
 * 显示全屏 Loading
 *
 * 功能：
 * - 支持并发请求合并，多个请求只显示一个 Loading
 * - 每次调用计数器 +1
 */
export function showFullScreenLoading() {
	if (needLoadingRequestCount === 0) {
		startLoading();
	}
	needLoadingRequestCount++;
}

/**
 * 隐藏全屏 Loading
 *
 * 功能：
 * - 计数器 -1，当计数器为 0 时关闭 Loading
 * - 防止多次关闭
 */
export function tryHideFullScreenLoading() {
	if (needLoadingRequestCount <= 0) {
		return;
	}
	needLoadingRequestCount--;
	if (needLoadingRequestCount === 0) {
		endLoading();
	}
}
