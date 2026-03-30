import type { Ref } from 'vue';
import type { Viewer } from '@/utils/openseadragon';
import { OSD_NAVIGATOR_STYLE } from '@/config/openseadragon';

interface NavigatorSize {
	width: number;
	height: number;
}

interface NavigatorInstance {
	element: HTMLElement;
	setWidth?: (width: string) => void;
	setHeight?: (height: string) => void;
}

export function getNavigatorSize(imageWidth: number, imageHeight: number, maxEdge = OSD_NAVIGATOR_STYLE.maxEdge): NavigatorSize {
	if (!imageWidth || !imageHeight) {
		return {
			width: maxEdge,
			height: maxEdge,
		};
	}

	if (imageWidth >= imageHeight) {
		return {
			width: maxEdge,
			height: Math.max(1, Math.round((maxEdge * imageHeight) / imageWidth)),
		};
	}

	return {
		width: Math.max(1, Math.round((maxEdge * imageWidth) / imageHeight)),
		height: maxEdge,
	};
}

export function useViewerNavigator(viewer: Ref<Viewer | null>) {
	let svgOverlay: SVGSVGElement | null = null;
	let horizontalLine: SVGLineElement | null = null;
	let verticalLine: SVGLineElement | null = null;
	let motionHandlersBound = false;
	let retryTimer: number | null = null;
	let rafId: number | null = null;
	let lastCenterX: number | null = null;
	let lastCenterY: number | null = null;
	let lastWidth: number | null = null;
	let lastHeight: number | null = null;
	const centerEpsilon = 0.5;

	const syncOverlayPosition = () => {
		const navigatorElement = getNavigatorElement();
		if (!navigatorElement || !horizontalLine || !verticalLine || !svgOverlay) {
			return false;
		}

		const displayRegion = navigatorElement.querySelector<HTMLElement>('.displayregion');
		if (!displayRegion || displayRegion.offsetWidth <= 0 || displayRegion.offsetHeight <= 0) {
			return false;
		}

		applyNavigatorStyles(navigatorElement);
		applyDisplayRegionStyles(displayRegion);

		const width = navigatorElement.clientWidth;
		const height = navigatorElement.clientHeight;
		const centerX = displayRegion.offsetLeft + displayRegion.offsetWidth / 2;
		const centerY = displayRegion.offsetTop + displayRegion.offsetHeight / 2;
		const canSkipUpdate =
			lastCenterX != null &&
			lastCenterY != null &&
			lastWidth != null &&
			lastHeight != null &&
			Math.abs(centerX - lastCenterX) < centerEpsilon &&
			Math.abs(centerY - lastCenterY) < centerEpsilon &&
			width === lastWidth &&
			height === lastHeight;
		if (canSkipUpdate) {
			return true;
		}

		lastCenterX = centerX;
		lastCenterY = centerY;
		lastWidth = width;
		lastHeight = height;

		svgOverlay.setAttribute('width', String(width));
		svgOverlay.setAttribute('height', String(height));
		svgOverlay.setAttribute('viewBox', `0 0 ${width} ${height}`);

		horizontalLine.setAttribute('x1', '0');
		horizontalLine.setAttribute('x2', String(width));
		horizontalLine.setAttribute('y1', String(centerY));
		horizontalLine.setAttribute('y2', String(centerY));

		verticalLine.setAttribute('x1', String(centerX));
		verticalLine.setAttribute('x2', String(centerX));
		verticalLine.setAttribute('y1', '0');
		verticalLine.setAttribute('y2', String(height));

		return true;
	};

	const handleNavigatorMotion = () => {
		if (rafId != null) {
			return;
		}

		rafId = window.requestAnimationFrame(() => {
			rafId = null;
			syncOverlayPosition();
		});
	};

	function getNavigator() {
		return viewer.value?.navigator as NavigatorInstance | undefined;
	}

	function getNavigatorElement() {
		return getNavigator()?.element ?? null;
	}

	function applyNavigatorStyles(navigatorElement: HTMLElement) {
		Object.assign(navigatorElement.style, {
			left: `${OSD_NAVIGATOR_STYLE.left}px`,
			top: `${OSD_NAVIGATOR_STYLE.top}px`,
			overflow: 'hidden',
			borderRadius: `${OSD_NAVIGATOR_STYLE.borderRadius}px`,
			border: `1px solid ${OSD_NAVIGATOR_STYLE.borderColor}`,
			backgroundColor: OSD_NAVIGATOR_STYLE.backgroundColor,
			boxShadow: OSD_NAVIGATOR_STYLE.boxShadow,
		});
	}

	function applyDisplayRegionStyles(displayRegion: HTMLElement) {
		Object.assign(displayRegion.style, {
			border: `${OSD_NAVIGATOR_STYLE.displayRegionBorderWidth}px solid ${OSD_NAVIGATOR_STYLE.displayRegionColor}`,
			backgroundColor: OSD_NAVIGATOR_STYLE.displayRegionFill,
			boxSizing: 'border-box',
		});
	}

	function clearRetryTimer() {
		if (retryTimer != null) {
			window.clearTimeout(retryTimer);
			retryTimer = null;
		}
	}

	function clearRaf() {
		if (rafId != null) {
			window.cancelAnimationFrame(rafId);
			rafId = null;
		}
	}

	function ensureOverlayReady(attempt = 0) {
		clearRetryTimer();
		if (syncOverlayPosition() || attempt >= 10) {
			return;
		}

		retryTimer = window.setTimeout(() => {
			ensureOverlayReady(attempt + 1);
		}, 32);
	}

	function detachMotionHandlers() {
		if (!viewer.value || !motionHandlersBound) {
			return;
		}

		viewer.value.removeHandler('animation', handleNavigatorMotion);
		viewer.value.removeHandler('animation-finish', handleNavigatorMotion);
		motionHandlersBound = false;
	}

	function attachMotionHandlers() {
		if (!viewer.value || motionHandlersBound) {
			return;
		}

		viewer.value.addHandler('animation', handleNavigatorMotion);
		viewer.value.addHandler('animation-finish', handleNavigatorMotion);
		motionHandlersBound = true;
	}

	function clearOverlayElements() {
		svgOverlay?.remove();
		svgOverlay = null;
		horizontalLine = null;
		verticalLine = null;
		lastCenterX = null;
		lastCenterY = null;
		lastWidth = null;
		lastHeight = null;
	}

	function createOverlay() {
		const navigatorElement = getNavigatorElement();
		if (!navigatorElement) {
			return;
		}

		clearOverlayElements();
		applyNavigatorStyles(navigatorElement);

		const svgNamespace = 'http://www.w3.org/2000/svg';
		svgOverlay = document.createElementNS(svgNamespace, 'svg');
		svgOverlay.dataset.osdNavigatorOverlay = 'crosshair';
		Object.assign(svgOverlay.style, {
			position: 'absolute',
			left: '0',
			top: '0',
			width: '100%',
			height: '100%',
			pointerEvents: 'none',
			zIndex: '10',
		});

		horizontalLine = document.createElementNS(svgNamespace, 'line');
		verticalLine = document.createElementNS(svgNamespace, 'line');

		for (const line of [horizontalLine, verticalLine]) {
			line.setAttribute('stroke', OSD_NAVIGATOR_STYLE.crosshairColor);
			line.setAttribute('stroke-width', String(OSD_NAVIGATOR_STYLE.crosshairWidth));
			line.setAttribute('opacity', '1');
			svgOverlay.appendChild(line);
		}

		navigatorElement.appendChild(svgOverlay);
		attachMotionHandlers();
		ensureOverlayReady();
	}

	function syncNavigatorSize() {
		const currentViewer = viewer.value;
		const navigatorInstance = getNavigator();
		if (!currentViewer || !navigatorInstance || !currentViewer.world.getItemCount()) {
			return;
		}

		const imageSize = currentViewer.world.getItemAt(0).getContentSize();
		const size = getNavigatorSize(imageSize.x, imageSize.y);
		const width = `${size.width}px`;
		const height = `${size.height}px`;

		navigatorInstance.setWidth?.(width);
		navigatorInstance.setHeight?.(height);

		Object.assign(navigatorInstance.element.style, {
			width,
			height,
			left: `${OSD_NAVIGATOR_STYLE.left}px`,
			top: `${OSD_NAVIGATOR_STYLE.top}px`,
		});
	}

	function handleViewerOpen() {
		syncNavigatorSize();
		createOverlay();
	}

	function handleViewportResize() {
		syncNavigatorSize();
		ensureOverlayReady();
	}

	function destroyNavigatorEnhancements() {
		clearRetryTimer();
		clearRaf();
		detachMotionHandlers();
		clearOverlayElements();
	}

	return {
		handleViewerOpen,
		handleViewportResize,
		destroyNavigatorEnhancements,
	};
}
