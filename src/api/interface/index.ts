/**
 * API 接口类型定义
 *
 * @description 请求响应参数类型
 */

/**
 * @description 请求响应参数（不包含 data）
 */
export interface Result {
	code: number;
	message: string;
}

/**
 * @description 请求响应参数（包含 data）
 */
export interface ResultData<T = any> extends Result {
	data: T;
}

/**
 * @description 分页响应参数
 */
export interface ResPage<T> {
	records: T[];
	pageNum: number;
	pageSize: number;
	total: number;
}

/**
 * @description 列表响应参数
 */
export interface ResList<T> {
	list: T[];
	total: number;
}

/**
 * @description 分页请求参数
 */
export interface ReqPage {
	pageNum: number;
	pageSize: number;
}
