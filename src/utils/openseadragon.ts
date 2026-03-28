/**
 * OpenSeadragon 工具封装
 *
 * @description 在原生 OSD 基础上增加：
 *   1. 瓦片内存缓存 —— 相同 URL 的瓦片不重复请求
 *   2. 请求去重     —— 同一瓦片并发发起时只发一次请求，其余等待结果
 *   3. 缓存容量控制 —— LRU 淘汰，避免内存无限增长
 */
import OpenSeadragon from 'openseadragon';
import { OSD_MAX_IMAGE_CACHE_COUNT } from '@/config/openseadragon';

export default OpenSeadragon;
export type Viewer = InstanceType<typeof OpenSeadragon.Viewer>;

// ─── 瓦片缓存 ────────────────────────────────────────────────────────────────

/** 单条缓存项 */
interface CacheEntry {
	/** Blob URL，供 <img> src 直接使用 */
	objectUrl: string;
	/** 最近访问时间（用于 LRU 淘汰） */
	lastUsed: number;
}

/** 最大缓存瓦片数量（超出后按 LRU 淘汰最久未用的条目） */
const CACHE_MAX_SIZE = OSD_MAX_IMAGE_CACHE_COUNT;

/** key → 已完成的缓存 */
const tileCache = new Map<string, CacheEntry>();

/** key → 进行中的请求 Promise（请求去重：同一 key 只发一次请求） */
const inflight = new Map<string, Promise<string>>();

/**
 * LRU 淘汰：当缓存超出上限时，释放最久未访问的条目
 */
function evictIfNeeded(): void {
	if (tileCache.size <= CACHE_MAX_SIZE) return;

	let oldestKey = '';
	let oldestTime = Infinity;

	for (const [key, entry] of tileCache) {
		if (entry.lastUsed < oldestTime) {
			oldestTime = entry.lastUsed;
			oldestKey = key;
		}
	}

	if (oldestKey) {
		const entry = tileCache.get(oldestKey)!;
		URL.revokeObjectURL(entry.objectUrl);
		tileCache.delete(oldestKey);
	}
}

/**
 * 获取瓦片：优先从内存缓存中取，缓存未命中则发起请求并缓存结果。
 * 并发请求同一 URL 时只发一次 HTTP 请求（请求去重）。
 *
 * @returns Blob Object URL（由缓存管理生命周期，调用方无需 revokeObjectURL）
 */
export async function fetchTile(url: string): Promise<string> {
	// 1. 命中缓存
	const cached = tileCache.get(url);
	if (cached) {
		cached.lastUsed = Date.now();
		return cached.objectUrl;
	}

	// 2. 已有进行中的请求，直接复用
	const existing = inflight.get(url);
	if (existing) {
		return existing;
	}

	// 3. 发起新请求
	const promise = (async (): Promise<string> => {
		try {
			const resp = await fetch(url);
			if (!resp.ok) {
				throw new Error(`瓦片请求失败，HTTP ${resp.status}：${url}`);
			}
			const blob = await resp.blob();
			const objectUrl = URL.createObjectURL(blob);

			tileCache.set(url, { objectUrl, lastUsed: Date.now() });
			evictIfNeeded();
			return objectUrl;
		} finally {
			inflight.delete(url);
		}
	})();

	inflight.set(url, promise);
	return promise;
}

/**
 * 释放所有缓存（组件卸载时调用，防止内存泄漏）
 */
export function clearTileCache(): void {
	for (const entry of tileCache.values()) {
		URL.revokeObjectURL(entry.objectUrl);
	}
	tileCache.clear();
	inflight.clear();
	console.log('[OSD] 瓦片缓存已清空');
}
