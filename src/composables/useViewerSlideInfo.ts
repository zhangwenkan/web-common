import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getSlideInfo, type SlideInfoResponse } from '@/api/modules/wsi';

export interface ViewerSlideInfoImageItem {
	type: 'image';
	label: string;
	src: string;
}

interface NormalizedSlideInfoPayload {
	title: string;
	items: ViewerSlideInfoItem[];
	buttonText: string;
	buttonBadgeText: string;
	buttonBadgeColor: string;
	buttonBadgeBackgroundColor: string;
}

function getPositiveInt(value: unknown) {
	const text = normalizeText(value);
	if (!text) {
		return 0;
	}
	const parsed = Number(text);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function formatSliceNumber(current: number, total: number) {
	return `${current} / ${total}`;
}

function buildSliceNumberText(data: Record<string, unknown>) {
	const current =
		getPositiveInt(data.currentIndex) ||
		getPositiveInt(data.sliceIndex) ||
		getPositiveInt(data.index) ||
		getPositiveInt(data.currentNo);
	const total =
		getPositiveInt(data.total) ||
		getPositiveInt(data.totalCount) ||
		getPositiveInt(data.sliceTotal) ||
		getPositiveInt(data.count);
	if (!current || !total) {
		return '';
	}
	return ` ｜ ${formatSliceNumber(current, total)}`;
}

function buildButtonText(data: Record<string, unknown>, fallbackTitle: string) {
	const sliceName = pickFirstString(data, ['sliceName', 'slideName', 'title', 'name']);
	const sliceNumberText = buildSliceNumberText(data);
	if (sliceName) {
		return `${sliceName}${sliceNumberText}`;
	}
	return fallbackTitle;
}

function getButtonBadgeStyle(data: Record<string, unknown>) {
	const buttonBadgeText = pickFirstString(data, ['analResCode', 'analysisResult', 'resultCode']);
	const abnormal = pickFirstString(data, ['abnormal']).toLowerCase();
	if (!buttonBadgeText) {
		return {
			buttonBadgeText: '',
			buttonBadgeColor: '',
			buttonBadgeBackgroundColor: '',
		};
	}
	if (abnormal === 'true' || abnormal === '1' || abnormal === 'yes') {
		return {
			buttonBadgeText,
			buttonBadgeColor: '#F56C6C',
			buttonBadgeBackgroundColor: 'rgba(245,108,108,0.16)',
		};
	}
	return {
		buttonBadgeText,
		buttonBadgeColor: '#67C23A',
		buttonBadgeBackgroundColor: 'rgba(103,194,58,0.16)',
	};
}

function hasSliceNumberSuffix(text: string) {
	return /\d+\s*\/\s*\d+/.test(text);
}

function buildSummaryTitle(title: string, currentIndex?: number, totalCount?: number) {
	if (!title) {
		return '切片信息';
	}
	if (hasSliceNumberSuffix(title)) {
		return title;
	}
	if (!currentIndex || !totalCount) {
		return title;
	}
	return `${title} ｜ ${formatSliceNumber(currentIndex, totalCount)}`;
}

export interface ViewerSlideInfoTextItem {
	type: 'text';
	label: string;
	value: string;
	color?: string;
}

export type ViewerSlideInfoItem = ViewerSlideInfoImageItem | ViewerSlideInfoTextItem;

interface SlideInfoPanelPosition {
	x: number;
	y: number;
}

interface UseViewerSlideInfoOptions {
	slideId: Ref<string>;
	cname: Ref<string>;
	currentIndex?: Ref<number>;
	totalCount?: Ref<number>;
	panelWidth?: number;
	topOffset?: number;
	rightOffset?: number;
	temporarySliceId?: string;
}

function normalizeText(value: unknown) {
	if (typeof value === 'string') {
		return value.trim();
	}
	if (typeof value === 'number' || typeof value === 'boolean') {
		return String(value);
	}
	return '';
}

function getRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return null;
	}
	return value as Record<string, unknown>;
}

function getArray(value: unknown) {
	return Array.isArray(value) ? value : [];
}

function getStringList(value: unknown) {
	return getArray(value)
		.map((item) => normalizeText(item))
		.filter(Boolean);
}

function pickFirstString(record: Record<string, unknown>, keys: string[]) {
	for (const key of keys) {
		const text = normalizeText(record[key]);
		if (text) {
			return text;
		}
	}
	return '';
}

function normalizeImageUrl(src: string) {
	if (!src) {
		return '';
	}
	if (/^https?:\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
		return src;
	}
	if (src.startsWith('/')) {
		return `${window.location.origin}${src}`;
	}
	return src;
}

function normalizeImageItem(rawItem: unknown): ViewerSlideInfoImageItem[] {
	const record = getRecord(rawItem);
	if (!record) {
		return [];
	}

	const label = pickFirstString(record, ['label', 'name', 'title', 'key']) || '标签图';
	const directSrc = pickFirstString(record, ['src', 'url', 'image', 'imgUrl', 'img', 'value']);
	if (directSrc) {
		return [{ type: 'image', label, src: normalizeImageUrl(directSrc) }];
	}

	const candidates = [
		...getStringList(record.images),
		...getStringList(record.imageList),
		...getStringList(record.urls),
		...getStringList(record.values),
	];

	return candidates.map((src, index) => ({
		type: 'image' as const,
		label: candidates.length > 1 ? `${label} ${index + 1}` : label,
		src: normalizeImageUrl(src),
	}));
}

function normalizeTextItem(rawItem: unknown): ViewerSlideInfoTextItem | null {
	const record = getRecord(rawItem);
	if (!record) {
		return null;
	}

	const label = pickFirstString(record, ['label', 'name', 'title', 'key']);
	const value = pickFirstString(record, ['value', 'text', 'content']);
	if (!label || !value) {
		return null;
	}

	return {
		type: 'text',
		label,
		value,
		color: pickFirstString(record, ['color']),
	};
}

function normalizeGenericRecord(record: Record<string, unknown>, title: string) {
	const items: ViewerSlideInfoItem[] = [];

	for (const [key, value] of Object.entries(record)) {
		if (['title', 'slideName', 'sliceName', 'name', 'items', 'list', 'data', 'result'].includes(key)) {
			continue;
		}
		if (value == null) {
			continue;
		}
		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
			const normalized = normalizeText(value);
			if (!normalized || normalized === title) {
				continue;
			}
			items.push({ type: 'text', label: key, value: normalized });
		}
	}

	return items;
}

function normalizeSlideInfoResponse(payload: SlideInfoResponse | null | undefined): NormalizedSlideInfoPayload {
	const data = getRecord(payload) ?? {};
	const title = pickFirstString(data, ['title', 'slideName', 'sliceName', 'name']) || '切片信息';
	const rawItems = [
		...getArray(data.attributes),
		...getArray(data.items),
		...getArray(data.list),
		...getArray(data.slideInfo),
		...getArray(data.result),
	];

	const items: ViewerSlideInfoItem[] = [];
	for (const rawItem of rawItems) {
		const record = getRecord(rawItem);
		if (!record) {
			continue;
		}
		const itemType = pickFirstString(record, ['type', 'itemType']).toLowerCase();
		if (itemType === 'image') {
			items.push(...normalizeImageItem(record));
			continue;
		}
		if (itemType === 'text') {
			const textItem = normalizeTextItem(record);
			if (textItem) {
				items.push(textItem);
			}
			continue;
		}
		items.push(...normalizeImageItem(record));
		const textItem = normalizeTextItem(record);
		if (textItem) {
			items.push(textItem);
		}
	}

	if (!items.length) {
		items.push(...normalizeGenericRecord(data, title));
	}

	return {
		title,
		items,
		buttonText: buildButtonText(data, title),
		...getButtonBadgeStyle(data),
	};
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function useViewerSlideInfo(options: UseViewerSlideInfoOptions) {
	const panelWidth = options.panelWidth ?? 360;
	const topOffset = options.topOffset ?? 16;
	const rightOffset = options.rightOffset ?? 16;
	const toolbarHeight = options.topOffset != null ? options.topOffset + 46 : 62;
	const isOpen = ref(false);
	const isClosing = ref(false);
	const loading = ref(false);
	const error = ref('');
	const title = ref('切片信息');
	const items = ref<ViewerSlideInfoItem[]>([]);
	const buttonText = ref('切片信息');
	const buttonBadgeText = ref('');
	const buttonBadgeColor = ref('');
	const buttonBadgeBackgroundColor = ref('');
	const hasLoaded = ref(false);
	const activeImageIndex = ref(0);
	const panelPosition = ref<SlideInfoPanelPosition>({
		x: Math.max(rightOffset, window.innerWidth - panelWidth - rightOffset),
		y: toolbarHeight + 12,
	});
	const dragging = ref(false);
	const isResetAnimating = ref(false);
	const hasMoved = ref(false);
	let dragOffsetX = 0;
	let dragOffsetY = 0;

	const imageItems = computed(() => items.value.filter((item): item is ViewerSlideInfoImageItem => item.type === 'image'));
	const textItems = computed(() => items.value.filter((item): item is ViewerSlideInfoTextItem => item.type === 'text'));
	const requestSliceId = computed(() => options.temporarySliceId || options.slideId.value);
	const summaryTitle = computed(() =>
		buildSummaryTitle(buttonText.value || title.value || '切片信息', options.currentIndex?.value, options.totalCount?.value)
	);
	const summaryBadgeText = computed(() => buttonBadgeText.value);

	const summaryBadgeColor = computed(() => buttonBadgeColor.value);
	const summaryBadgeBackgroundColor = computed(() => buttonBadgeBackgroundColor.value);
	const activeImage = computed(() => {
		if (!imageItems.value.length) {
			return null;
		}
		return imageItems.value[activeImageIndex.value] ?? imageItems.value[0];
	});

	function getDefaultPosition() {
		const viewportWidth = window.innerWidth;
		const maxX = Math.max(rightOffset, viewportWidth - panelWidth - rightOffset);
		return {
			x: clamp(viewportWidth - panelWidth - rightOffset, rightOffset, maxX),
			y: toolbarHeight + 12,
		};
	}

	function clampPanelPosition(nextPosition: SlideInfoPanelPosition) {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const maxX = Math.max(rightOffset, viewportWidth - panelWidth - rightOffset);
		const maxY = Math.max(topOffset, viewportHeight - 220);
		return {
			x: clamp(nextPosition.x, rightOffset, maxX),
			y: clamp(nextPosition.y, topOffset, maxY),
		};
	}

	function resetPanelPosition() {
		const startPosition = { ...panelPosition.value };
		const targetPosition = getDefaultPosition();
		if (startPosition.x === targetPosition.x && startPosition.y === targetPosition.y) {
			hasMoved.value = false;
			return;
		}
		isResetAnimating.value = true;
		const startTime = performance.now();
		const duration = 320;
		const animate = (now: number) => {
			const progress = Math.min(1, (now - startTime) / duration);
			const eased = 1 - Math.pow(1 - progress, 3);
			panelPosition.value = {
				x: startPosition.x + (targetPosition.x - startPosition.x) * eased,
				y: startPosition.y + (targetPosition.y - startPosition.y) * eased,
			};
			if (progress < 1) {
				window.requestAnimationFrame(animate);
				return;
			}
			panelPosition.value = targetPosition;
			isResetAnimating.value = false;
			hasMoved.value = false;
		};
		window.requestAnimationFrame(animate);
	}

	async function fetchPanelData(force = false) {
		if (!requestSliceId.value) {
			error.value = '';
			items.value = [];
			title.value = '切片信息';
			buttonText.value = '切片信息';
			buttonBadgeText.value = '';
			buttonBadgeColor.value = '';
			buttonBadgeBackgroundColor.value = '';
			return;
		}
		if (loading.value) {
			return;
		}
		if (hasLoaded.value && !force) {
			return;
		}

		loading.value = true;
		error.value = '';
		try {
			const response = await getSlideInfo({
				sliceId: requestSliceId.value,
				cname: options.cname.value || undefined,
			});
			const normalized = normalizeSlideInfoResponse(
				(response as unknown as { data?: SlideInfoResponse }).data ?? (response as unknown as SlideInfoResponse)
			);
			title.value = normalized.title;
			items.value = normalized.items;
			buttonText.value = normalized.buttonText;
			buttonBadgeText.value = normalized.buttonBadgeText;
			buttonBadgeColor.value = normalized.buttonBadgeColor;
			buttonBadgeBackgroundColor.value = normalized.buttonBadgeBackgroundColor;
			activeImageIndex.value = 0;
			hasLoaded.value = true;
			hasMoved.value = false;
		} catch (requestError) {
			console.error('[ViewerSlideInfo] 切片信息加载失败：', requestError);
			error.value = '切片信息加载失败';
			items.value = [];
			buttonBadgeText.value = '';
			buttonBadgeColor.value = '';
			buttonBadgeBackgroundColor.value = '';
			if (isOpen.value) {
				ElMessage.error(error.value);
			}
		} finally {
			loading.value = false;
		}
	}

	async function openPanel() {
		isClosing.value = false;
		isOpen.value = true;
		if (!hasLoaded.value) {
			await fetchPanelData();
		}
	}

	function finishClosePanel() {
		isOpen.value = false;
		isClosing.value = false;
		resetPanelPosition();
	}

	function closePanel() {
		if (!isOpen.value || isClosing.value) {
			return;
		}
		isClosing.value = true;
		window.setTimeout(finishClosePanel, 500);
	}

	async function togglePanel() {
		if (isOpen.value) {
			closePanel();
			return;
		}
		await openPanel();
	}

	function retry() {
		hasLoaded.value = false;
		void fetchPanelData(true);
	}

	function showPrevImage() {
		if (imageItems.value.length <= 1) {
			return;
		}
		activeImageIndex.value = (activeImageIndex.value - 1 + imageItems.value.length) % imageItems.value.length;
	}

	function showNextImage() {
		if (imageItems.value.length <= 1) {
			return;
		}
		activeImageIndex.value = (activeImageIndex.value + 1) % imageItems.value.length;
	}

	function handleWindowResize() {
		panelPosition.value = clampPanelPosition(panelPosition.value);
	}

	function stopDragging() {
		dragging.value = false;
		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerup', stopDragging);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dragging.value) {
			return;
		}
		hasMoved.value = true;
		panelPosition.value = clampPanelPosition({
			x: event.clientX - dragOffsetX,
			y: event.clientY - dragOffsetY,
		});
	}

	function startDragging(event: PointerEvent) {
		const target = event.currentTarget as HTMLElement | null;
		if (!target) {
			return;
		}
		dragging.value = true;
		dragOffsetX = event.clientX - panelPosition.value.x;
		dragOffsetY = event.clientY - panelPosition.value.y;
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', stopDragging);
	}

	watch(
		[options.slideId, options.cname],
		() => {
			hasLoaded.value = false;
			items.value = [];
			error.value = '';
			panelPosition.value = getDefaultPosition();
			hasMoved.value = false;
			title.value = '切片信息';
			buttonText.value = '切片信息';
			buttonBadgeText.value = '';
			buttonBadgeColor.value = '';
			buttonBadgeBackgroundColor.value = '';
			activeImageIndex.value = 0;
			isClosing.value = false;
			isOpen.value = true;
			void fetchPanelData(true);
		},
		{ immediate: true }
	);

	resetPanelPosition();
	window.addEventListener('resize', handleWindowResize);

	onBeforeUnmount(() => {
		stopDragging();
		window.removeEventListener('resize', handleWindowResize);
	});

	return {
		summary: {
			title: summaryTitle,
			badgeText: summaryBadgeText,
			badgeColor: summaryBadgeColor,
			badgeBackgroundColor: summaryBadgeBackgroundColor,
		},
		panel: {
			isOpen,
			isClosing,
			position: panelPosition,
			hasMoved,
		},
		content: {
			loading,
			error,
			items,
			imageItems,
			textItems,
			activeImage,
			activeImageIndex,
		},
		actions: {
			open: openPanel,
			close: closePanel,
			toggle: togglePanel,
			refresh: fetchPanelData,
			retry,
			prevImage: showPrevImage,
			nextImage: showNextImage,
			startDragging,
			resetPosition: resetPanelPosition,
		},
	};
}
