<template>
	<div ref="viewerRef" class="w-full h-screen"></div>
</template>

<script setup lang="ts" name="Home">
	import OpenSeadragon, { type Viewer, clearTileCache, fetchTile } from '@/utils/openseadragon';
	import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
	import { getDziMetadata } from '@/api/modules/wsi';
	import { useWsiStore } from '@/store/modules/wsi';
	import {
		OSD_DEFAULT_OPTIONS,
		OSD_MAX_IMAGE_CACHE_COUNT,
		OSD_IMAGE_LOADER_LIMIT,
		OSD_TILE_LOAD_TIMEOUT,
	} from '@/config/openseadragon';

	const wsiStore = useWsiStore();
	const viewerRef = useTemplateRef('viewerRef');
	let viewer: Viewer | null = null;

	// 解析 DZI XML
	function parseDziXml(text: string) {
		const parser = new DOMParser();
		const xml = parser.parseFromString(text, 'application/xml');

		const imageElement = xml.getElementsByTagName('Image')[0];
		const sizeElement = xml.getElementsByTagName('Size')[0];

		if (!imageElement || !sizeElement) {
			throw new Error('DZI XML 格式无效，缺少 Image 或 Size 节点');
		}

		const width = parseInt(sizeElement.getAttribute('Width') || '0', 10);
		const height = parseInt(sizeElement.getAttribute('Height') || '0', 10);
		if (!width || !height) {
			throw new Error('DZI XML 中图像尺寸为 0，数据异常');
		}

		return {
			tileSize: parseInt(imageElement.getAttribute('TileSize') || '256', 10),
			overlap: parseInt(imageElement.getAttribute('Overlap') || '0', 10),
			format: imageElement.getAttribute('Format') || 'jpg',
			width,
			height,
		};
	}

	// 构建瓦片原始 URL
	function buildTileUrl(level: number, x: number, y: number, format: string) {
		return `/wsi/api/dzi/${wsiStore.slideId}_files/${level}/${x}_${y}.${format}?${wsiStore.tileQueryString}`;
	}

	interface TileDownloadContext {
		src: string;
		finish: (data: HTMLImageElement | null, request?: unknown, errorMessage?: string) => void;
		userData: {
			aborted?: boolean;
			image?: HTMLImageElement;
		};
	}

	async function downloadTileWithCache(context: TileDownloadContext) {
		try {
			const objectUrl = await fetchTile(context.src);
			if (context.userData.aborted) {
				context.finish(null, undefined, 'Tile load aborted');
				return;
			}

			const image = new Image();
			context.userData.image = image;

			image.onload = () => {
				image.onload = null;
				image.onerror = null;
				context.finish(image);
			};

			image.onerror = () => {
				image.onload = null;
				image.onerror = null;
				context.finish(null, undefined, `Tile image decode failed: ${context.src}`);
			};

			image.src = objectUrl;
		} catch (error) {
			const message = error instanceof Error ? error.message : `Tile load failed: ${context.src}`;
			context.finish(null, undefined, message);
		}
	}

	function abortTileDownload(context: TileDownloadContext) {
		context.userData.aborted = true;
		if (context.userData.image) {
			context.userData.image.onload = null;
			context.userData.image.onerror = null;
		}
	}

	onMounted(async () => {
		if (!viewerRef.value) {
			console.error('[OSD] 查看器容器元素未找到，无法初始化');
			return;
		}

		// 设置测试用的切片 ID
		wsiStore.setSlideId('01KMCRDD4RG9E6JMA6R4X0SCXJ1');

		try {
			console.log('[OSD] 正在获取 DZI 元数据...');
			const response = await getDziMetadata(wsiStore.slideId, wsiStore.dziParams);
			const text = response as unknown as string;

			if (!text || !text.trim()) {
				throw new Error('DZI 元数据接口返回内容为空');
			}

			const dzi = parseDziXml(text);
			console.log('[OSD] DZI 元数据解析成功：', dzi);

			viewer = OpenSeadragon({
				...OSD_DEFAULT_OPTIONS,
				element: viewerRef.value,
				maxImageCacheCount: OSD_MAX_IMAGE_CACHE_COUNT,
				imageLoaderLimit: OSD_IMAGE_LOADER_LIMIT,
				timeout: OSD_TILE_LOAD_TIMEOUT,
				tileSources: {
					width: dzi.width,
					height: dzi.height,
					tileSize: dzi.tileSize,
					tileOverlap: dzi.overlap,
					getTileUrl: (level: number, x: number, y: number) => {
						return buildTileUrl(level, x, y, dzi.format);
					},
					downloadTileStart: (context: TileDownloadContext) => {
						void downloadTileWithCache(context);
					},
					downloadTileAbort: (context: TileDownloadContext) => {
						abortTileDownload(context);
					},
				},
			});

			viewer.addHandler('open', () => {
				console.log('[OSD] 图像加载成功，查看器已就绪');
			});

			viewer.addHandler('open-failed', (event: unknown) => {
				console.error('[OSD] 图像打开失败，请检查瓦片源配置或网络连接：', event);
			});

			viewer.addHandler('tile-load-failed', (event: unknown) => {
				console.warn('[OSD] 瓦片加载失败，OSD 将自动重试：', event);
			});

			viewer.addHandler('tile-loaded', () => {
				// 静默处理，避免高频打印干扰控制台
			});
		} catch (error) {
			if (error instanceof Error) {
				console.error('[OSD] 初始化失败：', error.message);
			} else {
				console.error('[OSD] 初始化失败，未知错误：', error);
			}
		}
	});

	onBeforeUnmount(() => {
		viewer?.destroy();
		viewer = null;
		clearTileCache();
	});
</script>
