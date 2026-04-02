<template>
	<div class="relative h-screen w-full bg-white">
		<div ref="viewerRef" class="h-full w-full"></div>

		<div class="viewer-toolbar-root absolute top-4 right-4 z-20 flex items-start gap-4">
			<transition name="viewer-image-adjust-fade">
				<button
					v-if="slideInfo.panel.hasMoved.value"
					type="button"
					class="mt-[14px] mr-[14px] flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(40,49,66,0.3)] text-white shadow-[0_8px_20px_rgba(15,23,42,0.25)] transition hover:bg-[rgba(40,49,66,0.8)]"
					title="复位弹窗位置"
					@click="slideInfo.actions.resetPosition"
				>
					↺
				</button>
			</transition>

			<button
				type="button"
				class="flex h-[46px] max-w-[420px] items-center gap-3 rounded-full bg-[rgba(40,49,66,0.6)] px-[18px] text-left text-white shadow-[0_8px_20px_rgba(15,23,42,0.35)] backdrop-blur transition hover:bg-[rgba(40,49,66,0.78)]"
				title="切片信息(I)"
				@click="handleSlideInfoToggle"
			>
				<div class="min-w-0 text-sm leading-none font-medium">
					<span class="block truncate">{{ slideInfo.summary.title.value }}</span>
				</div>
				<span
					v-if="slideInfo.summary.badgeText.value"
					class="shrink-0 rounded-full px-[10px] py-[4px] text-xs leading-none"
					:style="{
						color: slideInfo.summary.badgeColor.value,
						backgroundColor: slideInfo.summary.badgeBackgroundColor.value,
					}"
				>
					{{ slideInfo.summary.badgeText.value }}
				</span>
			</button>

			<div class="relative">
				<button
					type="button"
					class="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/10 bg-[rgba(40,49,66,0.6)] text-white shadow-[0_8px_20px_rgba(15,23,42,0.35)] transition hover:bg-[rgba(40,49,66,0.78)]"
					@click="toggleViewerMoreMenu"
				>
					<el-icon :size="24"><MoreFilled /></el-icon>
				</button>

				<transition name="viewer-image-adjust-fade">
					<div
						v-if="isViewerMoreMenuOpen"
						class="absolute top-[56px] right-0 z-30 flex min-w-[64px] flex-col gap-2 rounded-[18px] border border-white/10 bg-[rgba(40,49,66,0.92)] px-2 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.38)]"
					>
						<button
							type="button"
							class="flex h-10 w-10 items-center justify-center self-end rounded-[14px] transition"
							:class="isImageAdjustOpen ? 'bg-sky-500 text-white' : 'bg-white/8 text-slate-200 hover:bg-white/14'"
							@click="toggleImageAdjustPanel"
						>
							<el-icon :size="24"><Sunny /></el-icon>
						</button>
					</div>
				</transition>
			</div>
		</div>

		<div
			v-if="slideInfo.panel.isOpen.value || slideInfo.panel.isClosing.value"
			class="animatedsliceNews-div fixed z-30 overflow-hidden whitespace-nowrap"
			:class="{ collapsed1: slideInfo.panel.isClosing.value, expanded1: !slideInfo.panel.isClosing.value }"
			:style="{
				top: `${slideInfo.panel.position.value.y}px`,
				left: `${slideInfo.panel.position.value.x}px`,
			}"
		>
			<ViewerSlideInfo
				:image-items="slideInfo.content.imageItems.value"
				:text-items="slideInfo.content.textItems.value"
				:active-image="slideInfo.content.activeImage.value"
				:loading="slideInfo.content.loading.value"
				:error="slideInfo.content.error.value"
				@close="slideInfo.actions.close"
				@retry="slideInfo.actions.retry"
				@prev-image="slideInfo.actions.prevImage"
				@next-image="slideInfo.actions.nextImage"
				@drag-start="slideInfo.actions.startDragging"
			/>
		</div>

		<div class="absolute bottom-4 left-24 z-20">
			<button
				type="button"
				class="flex h-11 w-11 items-center justify-center rounded-full bg-slate-500/90 text-white shadow-[0_4px_12px_rgba(0,0,0,0.16)] transition hover:scale-105 hover:bg-slate-500"
				:title="isAutoPlaying ? '暂停播放 (P)' : '开始播放 (P)'"
				@click="toggleAutoPlay"
			>
				<el-icon :size="22">
					<VideoPause v-if="isAutoPlaying" />
					<VideoPlay v-else />
				</el-icon>
			</button>
		</div>

		<div v-if="isAutoPlaying" class="absolute right-4 bottom-4 z-20 h-28 w-28">
			<button
				type="button"
				class="absolute top-0 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-slate-500/90 text-[18px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.16)] transition hover:scale-105 hover:bg-slate-500"
				:class="autoPlayDirection === 'up' ? 'ring-2 ring-white/70' : ''"
				title="向上播放 (↑)"
				@click="setAutoPlayDirection('up')"
			>
				↑
			</button>
			<button
				type="button"
				class="absolute top-1/2 left-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-500/90 text-[18px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.16)] transition hover:scale-105 hover:bg-slate-500"
				:class="autoPlayDirection === 'left' ? 'ring-2 ring-white/70' : ''"
				title="向左播放 (←)"
				@click="setAutoPlayDirection('left')"
			>
				←
			</button>
			<button
				type="button"
				class="absolute top-1/2 right-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-500/90 text-[18px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.16)] transition hover:scale-105 hover:bg-slate-500"
				:class="autoPlayDirection === 'right' ? 'ring-2 ring-white/70' : ''"
				title="向右播放 (→)"
				@click="setAutoPlayDirection('right')"
			>
				→
			</button>
			<button
				type="button"
				class="absolute bottom-0 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-slate-500/90 text-[18px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.16)] transition hover:scale-105 hover:bg-slate-500"
				:class="autoPlayDirection === 'down' ? 'ring-2 ring-white/70' : ''"
				title="向下播放 (↓)"
				@click="setAutoPlayDirection('down')"
			>
				↓
			</button>
		</div>

		<div class="absolute top-[72px] right-4 z-30">
			<ViewerImageAdjust
				:model-value="wsiStore.tileParams"
				:default-params="DEFAULT_TILE_PARAMS"
				:visible="isImageAdjustOpen"
				@close="closeImageAdjustPanel"
				@apply="applyImageAdjust"
			/>
		</div>

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
	import { MoreFilled, Sunny, VideoPause, VideoPlay } from '@element-plus/icons-vue';
	import { ElMessage } from 'element-plus';
	import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
	import {
		OSD_DEFAULT_OPTIONS,
		OSD_IMAGE_LOADER_LIMIT,
		OSD_MAGNIFICATION_PRESETS,
		OSD_MAX_IMAGE_CACHE_COUNT,
		OSD_TILE_LOAD_TIMEOUT,
	} from '@/config/openseadragon';
	import { getDziMetadata } from '@/api/modules/wsi';
	import ViewerImageAdjust from '@/components/ViewerImageAdjust/index.vue';
	import ViewerSlideInfo from '@/components/ViewerSlideInfo/index.vue';
	import { DEFAULT_TILE_PARAMS, type TileParams, useWsiStore } from '@/store/modules/wsi';
	import { storeToRefs } from 'pinia';
	import ViewerZoomRuler from '@/components/ViewerZoomRuler/index.vue';
	import { useViewerMagnification } from '@/composables/useViewerMagnification';
	import { useViewerShortcuts } from '@/composables/useViewerShortcuts';
	import { useViewerNavigator } from '@/composables/useViewerNavigator';
	import { useViewerSlideInfo } from '@/composables/useViewerSlideInfo';
	import { buildWsiTileSource, parseDziMetadata, type DziMetadata } from '@/utils/wsiTileSource';

	type AutoPlayDirection = import('@/composables/useViewerShortcuts').ViewerShortcutDirection;

	const DEMO_DZI_URL = 'https://openseadragon.github.io/example-images/highsmith/highsmith.dzi';
	const viewerRef = useTemplateRef('viewerRef');
	const viewer = ref<Viewer | null>(null);
	const dziMetadata = ref<DziMetadata | null>(null);
	const isApplyingImageAdjust = ref(false);
	const pendingTileParams = ref<TileParams | null>(null);
	const adjustDebounceTimer = ref<number | null>(null);
	const latestAdjustParams = ref<TileParams | null>(null);
	const autoPlayFrameId = ref<number | null>(null);
	const autoPlayLastFrameTime = ref<number | null>(null);
	const autoPlayLastVelocity = ref(new OpenSeadragon.Point(0, 0));
	const autoPlayStopStartTime = ref<number | null>(null);
	const autoPlayPendingNudge = ref(new OpenSeadragon.Point(0, 0));
	const isAutoPlayStopping = ref(false);
	const isAutoPlaying = ref(false);
	const autoPlayDirection = ref<AutoPlayDirection>('right');
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
	const AUTO_PLAY_SPEED_LEVEL = 0.5;
	const AUTO_PLAY_VIEWPORT_RATIO_PER_SECOND = 1 / AUTO_PLAY_SPEED_LEVEL / 3;
	const AUTO_PLAY_NUDGE_RATIO = 2;
	const AUTO_PLAY_NUDGE_CONSUME_RATIO = 0.28;
	const AUTO_PLAY_STOP_EASING_MS = 220;
	const AUTO_PLAY_EPSILON = 0.0005;

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
	const { slideId, dziParams } = wsiStoreRefs;
	const slideInfo = useViewerSlideInfo({
		slideId,
		cname: computed(() => dziParams.value.cname),
		temporarySliceId: '01KM1TV95FWK723F5C6F76782N',
	});
	const isViewerMoreMenuOpen = ref(false);
	const isImageAdjustOpen = ref(false);

	function handleSlideInfoToggle() {
		isViewerMoreMenuOpen.value = false;
		void slideInfo.actions.toggle();
	}

	function toggleViewerMoreMenu() {
		isViewerMoreMenuOpen.value = !isViewerMoreMenuOpen.value;
	}

	function toggleImageAdjustPanel() {
		isImageAdjustOpen.value = !isImageAdjustOpen.value;
		isViewerMoreMenuOpen.value = false;
	}

	function closeImageAdjustPanel() {
		isImageAdjustOpen.value = false;
		isViewerMoreMenuOpen.value = false;
	}

	function handleWindowClick(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		if (!target?.closest('.viewer-toolbar-root')) {
			isViewerMoreMenuOpen.value = false;
		}
	}

	function handleViewerOpened() {
		handleViewerOpen();
		handleNavigatorOpen();
	}

	function handleWindowResize() {
		handleViewportResize();
		handleNavigatorResize();
	}

	function getAutoPlayVelocity(direction: AutoPlayDirection) {
		if (!viewer.value) {
			return new OpenSeadragon.Point(0, 0);
		}
		const bounds = viewer.value.viewport.getBounds(true);
		const baseX = bounds.width * AUTO_PLAY_VIEWPORT_RATIO_PER_SECOND;
		const baseY = bounds.height * AUTO_PLAY_VIEWPORT_RATIO_PER_SECOND;
		if (direction === 'right') {
			return new OpenSeadragon.Point(baseX, 0);
		}
		if (direction === 'left') {
			return new OpenSeadragon.Point(-baseX, 0);
		}
		if (direction === 'down') {
			return new OpenSeadragon.Point(0, baseY);
		}
		return new OpenSeadragon.Point(0, -baseY);
	}

	function getAutoPlaySafeCenterRange() {
		if (!viewer.value || !viewer.value.world.getItemCount()) {
			return null;
		}
		const viewportBounds = viewer.value.viewport.getBounds(true);
		const imageBounds = viewer.value.world.getItemAt(0).getBounds();
		return {
			minX: imageBounds.x + viewportBounds.width / 2,
			maxX: imageBounds.x + imageBounds.width - viewportBounds.width / 2,
			minY: imageBounds.y + viewportBounds.height / 2,
			maxY: imageBounds.y + imageBounds.height - viewportBounds.height / 2,
		};
	}

	function stopAutoPlayFrame() {
		if (autoPlayFrameId.value != null) {
			window.cancelAnimationFrame(autoPlayFrameId.value);
			autoPlayFrameId.value = null;
		}
	}

	function finishAutoPlay() {
		stopAutoPlayFrame();
		autoPlayLastFrameTime.value = null;
		autoPlayStopStartTime.value = null;
		autoPlayPendingNudge.value = new OpenSeadragon.Point(0, 0);
		isAutoPlayStopping.value = false;
		autoPlayLastVelocity.value = new OpenSeadragon.Point(0, 0);
		isAutoPlaying.value = false;
	}

	function stopAutoPlay(showBoundaryMessage = false) {
		if (!isAutoPlaying.value && autoPlayFrameId.value == null) {
			return;
		}
		if (showBoundaryMessage) {
			ElMessage.warning('当前播放方向已到边界');
		}
		if (autoPlayFrameId.value == null || isAutoPlayStopping.value) {
			finishAutoPlay();
			return;
		}
		isAutoPlaying.value = false;
		isAutoPlayStopping.value = true;
		autoPlayStopStartTime.value = performance.now();
	}

	function startAutoPlay() {
		if (!viewer.value) {
			return;
		}
		finishAutoPlay();
		isAutoPlaying.value = true;
		const animate = (now: number) => {
			if (!viewer.value) {
				finishAutoPlay();
				return;
			}
			if (autoPlayLastFrameTime.value == null) {
				autoPlayLastFrameTime.value = now;
				autoPlayFrameId.value = window.requestAnimationFrame(animate);
				return;
			}
			const elapsed = Math.min((now - autoPlayLastFrameTime.value) / 1000, 0.05);
			autoPlayLastFrameTime.value = now;
			const currentViewer = viewer.value;
			const currentCenter = currentViewer.viewport.getCenter(true);
			let velocity = getAutoPlayVelocity(autoPlayDirection.value);
			if (isAutoPlayStopping.value) {
				const stopStartedAt = autoPlayStopStartTime.value ?? now;
				const progress = Math.min((now - stopStartedAt) / AUTO_PLAY_STOP_EASING_MS, 1);
				const factor = 1 - Math.pow(progress, 3);
				velocity = new OpenSeadragon.Point(
					autoPlayLastVelocity.value.x * factor,
					autoPlayLastVelocity.value.y * factor
				);
				if (progress >= 1) {
					finishAutoPlay();
					return;
				}
			} else {
				autoPlayLastVelocity.value = velocity;
			}
			const range = getAutoPlaySafeCenterRange();
			if (!range) {
				finishAutoPlay();
				return;
			}
			const isOutsideLeft = currentCenter.x < range.minX - AUTO_PLAY_EPSILON;
			const isOutsideRight = currentCenter.x > range.maxX + AUTO_PLAY_EPSILON;
			const isOutsideTop = currentCenter.y < range.minY - AUTO_PLAY_EPSILON;
			const isOutsideBottom = currentCenter.y > range.maxY + AUTO_PLAY_EPSILON;
			if (
				(autoPlayDirection.value === 'left' && isOutsideLeft) ||
				(autoPlayDirection.value === 'right' && isOutsideRight) ||
				(autoPlayDirection.value === 'up' && isOutsideTop) ||
				(autoPlayDirection.value === 'down' && isOutsideBottom)
			) {
				stopAutoPlay(true);
				return;
			}
			const consumedNudge = new OpenSeadragon.Point(
				autoPlayPendingNudge.value.x * AUTO_PLAY_NUDGE_CONSUME_RATIO,
				autoPlayPendingNudge.value.y * AUTO_PLAY_NUDGE_CONSUME_RATIO
			);
			autoPlayPendingNudge.value = new OpenSeadragon.Point(
				autoPlayPendingNudge.value.x - consumedNudge.x,
				autoPlayPendingNudge.value.y - consumedNudge.y
			);
			const targetCenter = new OpenSeadragon.Point(
				currentCenter.x + velocity.x * elapsed + consumedNudge.x,
				currentCenter.y + velocity.y * elapsed + consumedNudge.y
			);
			let nextX = Math.max(range.minX, Math.min(range.maxX, targetCenter.x));
			let nextY = Math.max(range.minY, Math.min(range.maxY, targetCenter.y));
			if (
				autoPlayDirection.value === 'right' &&
				currentCenter.x < range.minX - AUTO_PLAY_EPSILON &&
				targetCenter.x < range.minX
			) {
				nextX = targetCenter.x;
			}
			if (
				autoPlayDirection.value === 'left' &&
				currentCenter.x > range.maxX + AUTO_PLAY_EPSILON &&
				targetCenter.x > range.maxX
			) {
				nextX = targetCenter.x;
			}
			if (
				autoPlayDirection.value === 'down' &&
				currentCenter.y < range.minY - AUTO_PLAY_EPSILON &&
				targetCenter.y < range.minY
			) {
				nextY = targetCenter.y;
			}
			if (
				autoPlayDirection.value === 'up' &&
				currentCenter.y > range.maxY + AUTO_PLAY_EPSILON &&
				targetCenter.y > range.maxY
			) {
				nextY = targetCenter.y;
			}
			const safeCenter = new OpenSeadragon.Point(nextX, nextY);
			currentViewer.viewport.panTo(safeCenter, false);
			const reachedBoundary =
				(autoPlayDirection.value === 'left' && safeCenter.x <= range.minX + AUTO_PLAY_EPSILON) ||
				(autoPlayDirection.value === 'right' && safeCenter.x >= range.maxX - AUTO_PLAY_EPSILON) ||
				(autoPlayDirection.value === 'up' && safeCenter.y <= range.minY + AUTO_PLAY_EPSILON) ||
				(autoPlayDirection.value === 'down' && safeCenter.y >= range.maxY - AUTO_PLAY_EPSILON);
			if (reachedBoundary && !isAutoPlayStopping.value) {
				stopAutoPlay(true);
			}
			autoPlayFrameId.value = window.requestAnimationFrame(animate);
		};
		autoPlayFrameId.value = window.requestAnimationFrame(animate);
	}

	function toggleAutoPlay() {
		if (isAutoPlaying.value) {
			stopAutoPlay();
			return;
		}
		startAutoPlay();
	}

	function setAutoPlayDirection(direction: AutoPlayDirection) {
		autoPlayDirection.value = direction;
		autoPlayPendingNudge.value = new OpenSeadragon.Point(0, 0);
		if (isAutoPlaying.value) {
			startAutoPlay();
		}
	}

	function nudgeAutoPlay(direction: AutoPlayDirection) {
		if (!viewer.value) {
			return;
		}
		const bounds = viewer.value.viewport.getBounds(true);
		const moveX = bounds.width * AUTO_PLAY_NUDGE_RATIO;
		const moveY = bounds.height * AUTO_PLAY_NUDGE_RATIO;
		if (direction === 'right') {
			autoPlayPendingNudge.value = new OpenSeadragon.Point(
				autoPlayPendingNudge.value.x + moveX,
				autoPlayPendingNudge.value.y
			);
			return;
		}
		if (direction === 'left') {
			autoPlayPendingNudge.value = new OpenSeadragon.Point(
				autoPlayPendingNudge.value.x - moveX,
				autoPlayPendingNudge.value.y
			);
			return;
		}
		if (direction === 'down') {
			autoPlayPendingNudge.value = new OpenSeadragon.Point(
				autoPlayPendingNudge.value.x,
				autoPlayPendingNudge.value.y + moveY
			);
			return;
		}
		autoPlayPendingNudge.value = new OpenSeadragon.Point(
			autoPlayPendingNudge.value.x,
			autoPlayPendingNudge.value.y - moveY
		);
	}

	function handleAutoPlayDirectionShortcut(direction: AutoPlayDirection) {
		if (isAutoPlayStopping.value || !isAutoPlaying.value) {
			setAutoPlayDirection(direction);
			if (isAutoPlayStopping.value) {
				startAutoPlay();
			}
			return;
		}
		if (autoPlayDirection.value === direction) {
			nudgeAutoPlay(direction);
			return;
		}
		setAutoPlayDirection(direction);
	}

	function buildViewerTileSource() {
		if (!wsiStore.slideId || !dziMetadata.value) {
			return ACTIVE_DZI_URL;
		}

		return buildWsiTileSource(wsiStore.slideId, dziMetadata.value, wsiStore.dziParams.cname, wsiStore.tileParams);
	}

	async function loadDziMetadata() {
		if (!wsiStore.slideId) {
			return;
		}

		const response = await getDziMetadata(wsiStore.slideId, {
			cname: wsiStore.dziParams.cname,
		});
		const dziText = typeof response === 'string' ? response : String((response as { data?: unknown })?.data ?? '');
		dziMetadata.value = parseDziMetadata(dziText);
	}

	const IMAGE_ADJUST_DEBOUNCE_MS = 100;

	async function runImageAdjust(tileParams: TileParams) {
		if (isAutoPlaying.value) {
			stopAutoPlay();
		}
		if (isApplyingImageAdjust.value) {
			pendingTileParams.value = tileParams;
			return;
		}

		isApplyingImageAdjust.value = true;
		wsiStore.setTileParams(tileParams);

		if (!viewer.value || !dziMetadata.value || !wsiStore.slideId) {
			isApplyingImageAdjust.value = false;
			return;
		}

		const currentZoom = viewer.value.viewport.getZoom(true);
		const currentCenter = viewer.value.viewport.getCenter(true);
		const nextTileSource = buildViewerTileSource();
		const oldItem = viewer.value.world.getItemAt(0);
		if (!oldItem) {
			viewer.value.addOnceHandler('open', () => {
				if (!viewer.value) {
					return;
				}
				viewer.value.viewport.zoomTo(currentZoom, currentCenter, true);
				viewer.value.viewport.panTo(currentCenter, true);
				viewer.value.viewport.applyConstraints(true);
				isApplyingImageAdjust.value = false;
				const nextParams = pendingTileParams.value;
				pendingTileParams.value = null;
				if (nextParams) {
					void runImageAdjust(nextParams);
				}
			});
			viewer.value.open(nextTileSource);
			return;
		}

		const fadeDurationMs = 220;
		const oldBlendTime = viewer.value.blendTime;
		const oldBounds = oldItem.getBounds();
		viewer.value.blendTime = 0;

		viewer.value.addTiledImage({
			tileSource: nextTileSource,
			opacity: 0,
			x: oldBounds.x,
			y: oldBounds.y,
			width: oldBounds.width,
			success: ({ item }: { item: any }) => {
				if (!viewer.value) {
					isApplyingImageAdjust.value = false;
					return;
				}

				let started = false;
				let fallbackTimer: number | null = null;
				const currentViewer = viewer.value;
				const startFade = () => {
					if (!viewer.value || started) {
						return;
					}
					started = true;
					if (fallbackTimer != null) {
						window.clearTimeout(fallbackTimer);
						fallbackTimer = null;
					}
					currentViewer.removeHandler('tile-drawn', onTileDrawn);
					const start = performance.now();
					const step = () => {
						if (!viewer.value) {
							return;
						}
						const progress = Math.min(1, (performance.now() - start) / fadeDurationMs);
						const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
						item.setOpacity(eased);
						oldItem.setOpacity(1 - eased);
						if (progress < 1) {
							window.requestAnimationFrame(step);
							return;
						}

						try {
							currentViewer.world.removeItem(oldItem);
						} catch (error) {
							console.warn('[OSD] 图像调节旧图层移除失败：', error);
						}
						currentViewer.blendTime = oldBlendTime;
						currentViewer.viewport.zoomTo(currentZoom, currentCenter, true);
						currentViewer.viewport.panTo(currentCenter, true);
						currentViewer.viewport.applyConstraints(true);
						isApplyingImageAdjust.value = false;
						const nextParams = pendingTileParams.value;
						pendingTileParams.value = null;
						if (nextParams) {
							void runImageAdjust(nextParams);
						}
					};
					window.requestAnimationFrame(step);
				};

				const onTileDrawn = (event: any) => {
					if (event?.tiledImage !== item) {
						return;
					}
					startFade();
				};

				currentViewer.addHandler('tile-drawn', onTileDrawn);
				fallbackTimer = window.setTimeout(() => {
					startFade();
				}, 700);
			},
		} as any);
	}

	function applyImageAdjust(tileParams: TileParams) {
		latestAdjustParams.value = tileParams;
		if (adjustDebounceTimer.value != null) {
			window.clearTimeout(adjustDebounceTimer.value);
		}
		adjustDebounceTimer.value = window.setTimeout(() => {
			adjustDebounceTimer.value = null;
			const params = latestAdjustParams.value;
			if (!params) {
				return;
			}
			void runImageAdjust(params);
		}, IMAGE_ADJUST_DEBOUNCE_MS);
	}

	useViewerShortcuts({
		onSelectMagnification: zoomToMagnification,
		onFitToViewport: fitToViewport,
		onToggleAutoPlay: toggleAutoPlay,
		onAutoPlayDirection: handleAutoPlayDirectionShortcut,
	});

	onMounted(async () => {
		window.addEventListener('click', handleWindowClick);
		if (!viewerRef.value) {
			console.error('[OSD] 查看器容器元素未找到，无法初始化');
			return;
		}

		try {
			await loadDziMetadata();
		} catch (error) {
			console.error('[OSD] DZI 元数据加载失败，回退到默认 tile source：', error);
		}

		viewer.value = OpenSeadragon({
			...OSD_DEFAULT_OPTIONS,
			element: viewerRef.value,
			maxImageCacheCount: OSD_MAX_IMAGE_CACHE_COUNT,
			imageLoaderLimit: OSD_IMAGE_LOADER_LIMIT,
			timeout: OSD_TILE_LOAD_TIMEOUT,
			tileSources: buildViewerTileSource(),
		});

		viewer.value.addHandler('open', handleViewerOpened);
		viewer.value.addHandler('zoom', handleViewerZoom);
		viewer.value.addHandler('animation', handleViewerAnimation);
		viewer.value.addHandler('canvas-scroll', handleCanvasScroll);
		viewer.value.addHandler('animation-finish', handleAnimationFinish);
		viewer.value.addHandler('canvas-drag', stopAutoPlay);
		viewer.value.addHandler('zoom', stopAutoPlay);
		viewer.value.addHandler('open', stopAutoPlay);
		viewer.value.addHandler('open-failed', (event: unknown) => {
			console.error('[OSD] 演示 DZI 图像打开失败：', event);
		});
		viewer.value.addHandler('tile-load-failed', (event: unknown) => {
			console.warn('[OSD] 演示 DZI 瓦片加载失败：', event);
		});

		window.addEventListener('resize', handleWindowResize);
	});

	onBeforeUnmount(() => {
		stopAutoPlay();
		window.removeEventListener('click', handleWindowClick);
		window.removeEventListener('resize', handleWindowResize);
		if (adjustDebounceTimer.value != null) {
			window.clearTimeout(adjustDebounceTimer.value);
			adjustDebounceTimer.value = null;
		}
		destroyNavigatorEnhancements();
		viewer.value?.destroy();
		viewer.value = null;
		clearTileCache();
	});
</script>

<style scoped>
	.animatedsliceNews-div {
		width: 300px;
		display: flex;
		height: 346px;
	}

	.expanded1 {
		animation: expand1 0.5s forwards;
	}

	.collapsed1 {
		animation: collapse1 0.5s forwards;
	}

	@keyframes expand1 {
		from {
			height: 0;
		}

		to {
			height: 346px;
		}
	}

	@keyframes collapse1 {
		from {
			height: 346px;
		}

		to {
			height: 0;
		}
	}
</style>
