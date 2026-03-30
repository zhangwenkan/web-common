<template>
	<div class="relative h-screen w-full bg-white">
		<div ref="viewerRef" class="h-full w-full"></div>

		<ViewerZoomRuler
			:current-magnification-label="currentMagnificationLabel"
			:is-warning="isWarning"
			:is-fit-active="isFitActive"
			:preset-magnifications="OSD_MAGNIFICATION_PRESETS"
			:is-preset-disabled="isPresetDisabled"
			:is-preset-active="isPresetActive"
			@select-magnification="zoomToMagnification"
			@fit-to-viewport="fitToViewport"
		/>
	</div>
</template>

<script setup lang="ts" name="Home">
	import OpenSeadragon, { type Viewer, clearTileCache } from '@/utils/openseadragon';
	import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
	import {
		OSD_DEFAULT_OPTIONS,
		OSD_IMAGE_LOADER_LIMIT,
		OSD_MAGNIFICATION_PRESETS,
		OSD_MAX_IMAGE_CACHE_COUNT,
		OSD_TILE_LOAD_TIMEOUT,
	} from '@/config/openseadragon';
	import { useWsiStore } from '@/store/modules/wsi';
	import { storeToRefs } from 'pinia';
	import ViewerZoomRuler from '@/components/ViewerZoomRuler/index.vue';
	import { useViewerMagnification } from '@/composables/useViewerMagnification';
	import { useViewerShortcuts } from '@/composables/useViewerShortcuts';
	import { useViewerNavigator } from '@/composables/useViewerNavigator';

	const DEMO_DZI_URL = 'https://openseadragon.github.io/example-images/highsmith/highsmith.dzi';
	const viewerRef = useTemplateRef('viewerRef');
	const viewer = ref<Viewer | null>(null);
	const wsiStore = useWsiStore();
	const wsiStoreRefs = storeToRefs(wsiStore);
	const API_DZI_URL = wsiStore.slideId
		? `/wsi/api/dzi/${wsiStore.slideId}.dzi?cname=${encodeURIComponent(wsiStore.dziParams.cname)}`
		: null;
	const DZI_SOURCES = {
		api: API_DZI_URL,
		demo: DEMO_DZI_URL,
	} as const;
	const ACTIVE_DZI_SOURCE: keyof typeof DZI_SOURCES = 'api';
	const ACTIVE_DZI_URL = DZI_SOURCES[ACTIVE_DZI_SOURCE] ?? DZI_SOURCES.demo;

	const {
		currentMagnificationLabel,
		isWarning,
		isFitActive,
		handleViewerOpen,
		handleViewerZoom,
		handleViewerAnimation,
		handleCanvasScroll,
		handleAnimationFinish,
		handleViewportResize,
		zoomToMagnification,
		fitToViewport,
		isPresetDisabled,
		isPresetActive,
	} = useViewerMagnification(viewer, wsiStore, wsiStoreRefs);
	const {
		handleViewerOpen: handleNavigatorOpen,
		handleViewportResize: handleNavigatorResize,
		destroyNavigatorEnhancements,
	} = useViewerNavigator(viewer);

	function handleViewerOpened() {
		handleViewerOpen();
		handleNavigatorOpen();
	}

	function handleWindowResize() {
		handleViewportResize();
		handleNavigatorResize();
	}

	useViewerShortcuts({
		onSelectMagnification: zoomToMagnification,
		onFitToViewport: fitToViewport,
	});

	onMounted(() => {
		if (!viewerRef.value) {
			console.error('[OSD] 查看器容器元素未找到，无法初始化');
			return;
		}

		viewer.value = OpenSeadragon({
			...OSD_DEFAULT_OPTIONS,
			element: viewerRef.value,
			maxImageCacheCount: OSD_MAX_IMAGE_CACHE_COUNT,
			imageLoaderLimit: OSD_IMAGE_LOADER_LIMIT,
			timeout: OSD_TILE_LOAD_TIMEOUT,
			tileSources: ACTIVE_DZI_URL,
		});

		viewer.value.addHandler('open', handleViewerOpened);
		viewer.value.addHandler('zoom', handleViewerZoom);
		viewer.value.addHandler('animation', handleViewerAnimation);
		viewer.value.addHandler('canvas-scroll', handleCanvasScroll);
		viewer.value.addHandler('animation-finish', handleAnimationFinish);
		viewer.value.addHandler('open-failed', (event: unknown) => {
			console.error('[OSD] 演示 DZI 图像打开失败：', event);
		});
		viewer.value.addHandler('tile-load-failed', (event: unknown) => {
			console.warn('[OSD] 演示 DZI 瓦片加载失败：', event);
		});

		window.addEventListener('resize', handleWindowResize);
	});

	onBeforeUnmount(() => {
		window.removeEventListener('resize', handleWindowResize);
		destroyNavigatorEnhancements();
		viewer.value?.destroy();
		viewer.value = null;
		clearTileCache();
	});
</script>
