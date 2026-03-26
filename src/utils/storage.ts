/**
 * 本地存储工具函数
 *
 * @description 封装 localStorage 和 sessionStorage 操作
 */

/**
 * localStorage 存储
 */
export function setLocal(key: string, value: any) {
	localStorage.setItem(key, JSON.stringify(value));
}

export function getLocal<T = any>(key: string): T | null {
	const value = localStorage.getItem(key);
	return value ? JSON.parse(value) : null;
}

export function removeLocal(key: string) {
	localStorage.removeItem(key);
}

export function clearLocal() {
	localStorage.clear();
}

/**
 * sessionStorage 存储
 */
export function setSession(key: string, value: any) {
	sessionStorage.setItem(key, JSON.stringify(value));
}

export function getSession<T = any>(key: string): T | null {
	const value = sessionStorage.getItem(key);
	return value ? JSON.parse(value) : null;
}

export function removeSession(key: string) {
	sessionStorage.removeItem(key);
}

export function clearSession() {
	sessionStorage.clear();
}
