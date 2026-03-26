/**
 * Axios 请求封装
 *
 * 功能说明：
 * 1. 请求拦截器：显示 Loading
 * 2. 响应拦截器：处理错误状态码
 * 3. 封装常用请求方法：GET、POST、PUT、DELETE
 *
 * @description 基于 Axios 的 HTTP 请求封装
 */
import { ResultEnum } from '@/enums/httpEnum';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { showFullScreenLoading, tryHideFullScreenLoading } from './config/serviceLoading';
import { checkStatus } from './helper/checkStatus';
import type { ResultData } from './interface';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	silent?: boolean;
}

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
	silent?: boolean;
}

const config: AxiosRequestConfig = {
	timeout: ResultEnum.TIMEOUT as number,
	withCredentials: true,
};

class RequestHttp {
	service: AxiosInstance;

	public constructor(config: AxiosRequestConfig) {
		this.service = axios.create(config);

		/**
		 * 请求拦截器
		 */
		this.service.interceptors.request.use(
			(config: CustomInternalAxiosRequestConfig) => {
				config.headers!.noLoading || showFullScreenLoading();
				return config;
			},
			(error: AxiosError) => {
				return Promise.reject(error);
			}
		);

		/**
		 * 响应拦截器
		 */
		this.service.interceptors.response.use(
			(response: AxiosResponse) => {
				const { data } = response;
				const config = response.config as CustomInternalAxiosRequestConfig;

				tryHideFullScreenLoading();

				// 全局错误信息拦截（静默请求不弹出错误）
				if (data.code && data.code !== ResultEnum.SUCCESS && !config.silent) {
					ElMessage.error(data.message);
					return Promise.reject(data);
				}

				return data;
			},
			async (error: AxiosError) => {
				const { response } = error;
				const config = error.config as CustomInternalAxiosRequestConfig;

				tryHideFullScreenLoading();

				// 静默请求不弹出错误
				if (config?.silent) {
					return Promise.reject(error);
				}

				if (error.message.includes('timeout')) {
					ElMessage.error('请求超时！请您稍后重试');
				}

				if (response) {
					checkStatus(response.status);
				}

				if (!window.navigator.onLine) {
					ElMessage.error('网络连接失败，请检查网络');
				}

				return Promise.reject(error);
			}
		);
	}

	/**
	 * GET 请求
	 */
	get<T>(url: string, params?: object, _object: CustomAxiosRequestConfig = {}): Promise<ResultData<T>> {
		return this.service.get(url, { params, ..._object });
	}

	/**
	 * POST 请求
	 */
	post<T>(url: string, params?: object, _object: CustomAxiosRequestConfig = {}): Promise<ResultData<T>> {
		return this.service.post(url, params, _object);
	}

	/**
	 * PUT 请求
	 */
	put<T>(url: string, params?: object, _object: CustomAxiosRequestConfig = {}): Promise<ResultData<T>> {
		return this.service.put(url, params, _object);
	}

	/**
	 * DELETE 请求
	 */
	delete<T>(url: string, params?: any, _object: CustomAxiosRequestConfig = {}): Promise<ResultData<T>> {
		return this.service.delete(url, { params, data: params, ..._object });
	}
}

export default new RequestHttp(config);
