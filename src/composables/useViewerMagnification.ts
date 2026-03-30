import { computed, type Ref } from 'vue';
import type { Viewer } from '@/utils/openseadragon';
import type { useWsiStore } from '@/store/modules/wsi';
import { OSD_MAGNIFICATION_TOLERANCE, OSD_MIN_ZOOM_IMAGE_RATIO, OSD_ZOOM_ANIMATION } from '@/config/openseadragon';

interface ZoomActionOptions {
	immediately?: boolean;
}

interface ViewerCanvasScrollEvent {
	position: { x: number; y: number };
	scroll: number;
	pointerType?: string;
	preventDefaultAction: boolean;
}

interface WsiStoreRefs {
	scanMagnification: Ref<number>;
	currentMagnification: Ref<number>;
	maxMagnification: Ref<number>;
	fitMagnification: Ref<number>;
}

export function useViewerMagnification(
	viewer: Ref<Viewer | null>,
	wsiStore: ReturnType<typeof useWsiStore>,
	wsiStoreRefs: WsiStoreRefs
) {
	const { scanMagnification, currentMagnification, maxMagnification, fitMagnification } = wsiStoreRefs;
	let isApplyingClampedZoom = false;

	const displayMagnification = computed(() => currentMagnification.value);
	const isWarning = computed(() => displayMagnification.value > scanMagnification.value);
	const isFitActive = computed(
		() => Math.abs(displayMagnification.value - fitMagnification.value) <= OSD_MAGNIFICATION_TOLERANCE
	);
	const currentMagnificationLabel = computed(() => `${formatMagnification(displayMagnification.value)}x`);

	function formatMagnification(value: number) {
		return value.toFixed(1);
	}

	function normalizeMagnification(value: number) {
		return Number.parseFloat(value.toFixed(2));
	}

	function getContainerWidth() {
		if (!viewer.value) return 0;
		return viewer.value.viewport.getContainerSize().x;
	}

	function getImageWidth() {
		if (!viewer.value || !viewer.value.world.getItemCount()) return 0;
		return viewer.value.world.getItemAt(0).getContentSize().x;
	}

	function getMagnificationFactor() {
		const containerWidth = getContainerWidth();
		const imageWidth = getImageWidth();
		if (!containerWidth || !imageWidth || !scanMagnification.value) return 0;
		return (containerWidth / imageWidth) * scanMagnification.value;
	}

	function getViewportZoomByMagnification(targetMagnification: number) {
		const magnificationFactor = getMagnificationFactor();
		if (!magnificationFactor) return null;
		return targetMagnification / magnificationFactor;
	}

	function updateCurrentMagnification() {
		const fallbackMagnification = normalizeMagnification(0.1);
		if (!viewer.value) {
			wsiStore.setCurrentMagnification(fallbackMagnification);
			return fallbackMagnification;
		}

		const magnificationFactor = getMagnificationFactor();
		const magnification = normalizeMagnification(
			Math.max(magnificationFactor ? viewer.value.viewport.getZoom(true) * magnificationFactor : 0.1, 0.1)
		);
		wsiStore.setCurrentMagnification(magnification);
		return magnification;
	}

	function syncMaxZoomLevel() {
		if (!viewer.value) return;
		const maxViewportZoom = getViewportZoomByMagnification(maxMagnification.value);
		if (maxViewportZoom == null) return;
		viewer.value.viewport.maxZoomLevel = maxViewportZoom;
	}

	function applyZoomByMagnification(targetMagnification: number, options: ZoomActionOptions = {}) {
		if (!viewer.value) return;

		const clampedMagnification = Math.min(Math.max(targetMagnification, 0.1), maxMagnification.value);
		const viewportZoom = getViewportZoomByMagnification(clampedMagnification);
		if (viewportZoom == null) return;

		const currentCenter = viewer.value.viewport.getCenter(true);
		viewer.value.viewport.zoomTo(viewportZoom, currentCenter, options.immediately ?? false);
		viewer.value.viewport.applyConstraints(options.immediately ?? false);
	}

	function syncFitMagnification() {
		if (!viewer.value) return;
		const magnificationFactor = getMagnificationFactor();
		const homeZoom = viewer.value.viewport.getHomeZoom();
		wsiStore.setFitMagnification(Math.max(magnificationFactor ? homeZoom * magnificationFactor : 0.1, 0.1));
	}

	function syncMinZoomLevel() {
		if (!viewer.value) return;
		const homeZoom = viewer.value.viewport.getHomeZoom();
		viewer.value.viewport.minZoomLevel = Math.min(homeZoom * OSD_MIN_ZOOM_IMAGE_RATIO, homeZoom);
	}

	function syncViewportMetrics() {
		syncMaxZoomLevel();
		syncFitMagnification();
		syncMinZoomLevel();
		updateCurrentMagnification();
	}

	function handleViewerOpen() {
		syncViewportMetrics();
	}

	function handleViewerZoom() {
		if (!viewer.value || isApplyingClampedZoom) return;

		const magnification = normalizeMagnification(
			Math.max(getMagnificationFactor() ? viewer.value.viewport.getZoom(true) * getMagnificationFactor() : 0.1, 0.1)
		);
		if (magnification <= maxMagnification.value) return;

		isApplyingClampedZoom = true;
		applyZoomByMagnification(maxMagnification.value, { immediately: OSD_ZOOM_ANIMATION.clampImmediate });
		wsiStore.setCurrentMagnification(normalizeMagnification(maxMagnification.value));
		isApplyingClampedZoom = false;
	}

	function handleViewerAnimation() {
		if (!viewer.value || isApplyingClampedZoom) return;
		updateCurrentMagnification();
	}

	function handleCanvasScroll(event: ViewerCanvasScrollEvent) {
		if (!viewer.value) return;
		const currentZoom = viewer.value.viewport.getZoom(true);
		const homeZoom = viewer.value.viewport.getHomeZoom();
		if (currentZoom > homeZoom) return;

		event.preventDefaultAction = true;
		const factor = Math.pow(viewer.value.zoomPerScroll, event.scroll);
		const currentCenter = viewer.value.viewport.getCenter(true);
		viewer.value.viewport.zoomBy(factor, currentCenter, false);
		viewer.value.viewport.applyConstraints();
	}

	function handleAnimationFinish() {
		updateCurrentMagnification();
	}

	function zoomToMagnification(targetMagnification: number | 'fit', options: ZoomActionOptions = {}) {
		if (targetMagnification === 'fit') {
			fitToViewport(options);
			return;
		}

		applyZoomByMagnification(targetMagnification, {
			immediately: options.immediately ?? false,
		});
	}

	function fitToViewport(options: ZoomActionOptions = {}) {
		if (!viewer.value) return;
		syncFitMagnification();
		viewer.value.viewport.goHome(options.immediately ?? false);
	}

	function handleViewportResize() {
		syncViewportMetrics();
	}

	function isPresetDisabled(preset: number) {
		return preset > maxMagnification.value;
	}

	function isPresetActive(preset: number) {
		return Math.abs(displayMagnification.value - preset) <= OSD_MAGNIFICATION_TOLERANCE;
	}

	return {
		displayMagnification,
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
	};
}
