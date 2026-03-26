/**
 * Axios 请求取消器
 *
 * @description 用于取消重复请求，避免并发问题
 */
import type { AxiosRequestConfig, Canceler } from 'axios';
import axios from 'axios';
import qs from 'qs';

let pendingMap = new Map<string, Canceler>();

/**
 * 序列化请求参数
 */
export function getPendingUrl(config: AxiosRequestConfig) {
	return [config.method, config.url, qs.stringify(config.data), qs.stringify(config.params)].join('&');
}

export class AxiosCanceler {
	/**
	 * 添加请求到 pending 列表
	 */
	addPending(config: AxiosRequestConfig) {
		this.removePending(config);
		const url = getPendingUrl(config);
		config.cancelToken =
			config.cancelToken ||
			new axios.CancelToken((cancel) => {
				if (!pendingMap.has(url)) {
					pendingMap.set(url, cancel);
				}
			});
	}

	/**
	 * 移除 pending 列表中的请求
	 */
	removePending(config: AxiosRequestConfig) {
		const url = getPendingUrl(config);

		if (pendingMap.has(url)) {
			const cancel = pendingMap.get(url);
			cancel && cancel();
			pendingMap.delete(url);
		}
	}

	/**
	 * 清空所有 pending 请求
	 */
	removeAllPending() {
		pendingMap.forEach((cancel) => {
			cancel && typeof cancel === 'function' && cancel();
		});
		pendingMap.clear();
	}

	/**
	 * 重置 pending 列表
	 */
	reset(): void {
		pendingMap = new Map<string, Canceler>();
	}
}
