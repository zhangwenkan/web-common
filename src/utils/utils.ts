/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay = 200): (...args: Parameters<T>) => void {
	let timer: ReturnType<typeof setTimeout> | null = null;
	return function (this: unknown, ...args: Parameters<T>) {
		timer && clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	};
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param delay 间隔时间（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, delay = 200): (...args: Parameters<T>) => void {
	let timer: ReturnType<typeof setTimeout> | null = null;
	return function (this: unknown, ...args: Parameters<T>) {
		if (!timer) {
			timer = setTimeout(() => {
				fn.apply(this, args);
				timer = null;
			}, delay);
		}
	};
}

/**
 * 格式化日期时间
 * @param date 日期对象或时间戳，默认当前时间
 * @returns 格式化后的字符串 "YYYY-MM-DD HH:mm:ss"
 */
export function formatDateTime(date: Date | number = new Date()): string {
	const d = typeof date === 'number' ? new Date(date) : date;
	return d.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * 格式化日期
 * @param date 日期对象或时间戳，默认当前时间
 * @returns 格式化后的字符串 "YYYY-MM-DD"
 */
export function formatDate(date: Date | number = new Date()): string {
	const d = typeof date === 'number' ? new Date(date) : date;
	return d.toISOString().slice(0, 10);
}

/**
 * 格式化时间
 * @param date 日期对象或时间戳，默认当前时间
 * @returns 格式化后的字符串 "HH:mm:ss"
 */
export function formatTime(date: Date | number = new Date()): string {
	const d = typeof date === 'number' ? new Date(date) : date;
	return d.toTimeString().slice(0, 8);
}

/**
 * 深拷贝（使用原生 structuredClone）
 * 适用于大多数场景，不支持函数、Symbol、DOM 节点
 * @param target 要拷贝的对象
 */
export function deepClone<T>(target: T): T {
	return structuredClone(target);
}

/**
 * 深拷贝（完整版）
 * 支持函数、Date、RegExp、Map、Set、循环引用等复杂场景
 * @param target 要拷贝的对象
 */
export function deepCloneFull<T>(target: T): T {
	const hashMap = new WeakMap();
	function isObject(obj: unknown): obj is object {
		return (typeof obj === 'object' && obj !== null) || typeof obj === 'function';
	}
	function clone(obj: unknown): unknown {
		if (!isObject(obj)) return obj;
		if (hashMap.has(obj)) return hashMap.get(obj);
		if (obj instanceof Date) return new Date(obj);
		if (obj instanceof RegExp) return new RegExp(obj);
		if (obj instanceof Function) {
			return new Function('return ' + obj.toString())();
		}
		if (obj instanceof Map) {
			const newMap = new Map();
			for (const [key, val] of obj) {
				newMap.set(key, isObject(val) ? clone(val) : val);
			}
			return newMap;
		}
		if (obj instanceof Set) {
			const newSet = new Set();
			for (const val of obj) {
				newSet.add(isObject(val) ? clone(val) : val);
			}
			return newSet;
		}
		if (Array.isArray(obj)) {
			const newArray = obj.map((item) => (isObject(item) ? clone(item) : item));
			hashMap.set(obj, newArray);
			return newArray;
		}
		const keys = Reflect.ownKeys(obj);
		const newObj: Record<string, unknown> = {};
		for (const key of keys) {
			const val = obj[key as keyof typeof obj];
			newObj[key as string] = isObject(val) ? clone(val) : val;
		}
		hashMap.set(obj, newObj);
		return newObj;
	}
	return clone(target) as T;
}
