/**
 * HTTP 请求相关枚举配置
 *
 * @description 请求配置、请求方法、Content-Type 类型定义
 */

/**
 * @description 请求响应状态码
 */
export enum ResultEnum {
	SUCCESS = '0',
	ERROR = '1',
	OVERDUE = '104',
	TIMEOUT = 500000,
	TYPE = 'success',
}

/**
 * @description 请求方法
 */
export enum RequestEnum {
	GET = 'GET',
	POST = 'POST',
	PATCH = 'PATCH',
	PUT = 'PUT',
	DELETE = 'DELETE',
}

/**
 * @description 常用的 Content-Type 类型
 */
export enum ContentTypeEnum {
	JSON = 'application/json;charset=UTF-8',
	TEXT = 'text/plain;charset=UTF-8',
	FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
	FORM_DATA = 'multipart/form-data;charset=UTF-8',
}
