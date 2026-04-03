import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getSlideList, type SlideListResponse } from '@/api/modules/wsi';

export interface ViewerSlideListMetaLine {
	text: string;
	color?: string;
}

export interface ViewerSlideListItem {
	sliceId: string;
	fileId: string;
	title: string;
	subtitle: string;
	thumbnailUrl: string;
	metaLines: ViewerSlideListMetaLine[];
	badgeText: string;
	badgeColor: string;
	badgeBackgroundColor: string;
	analResCode: string;
}

interface SlideListPanelPosition {
	x: number;
	y: number;
}

interface UseViewerSlideListOptions {
	slideId: Ref<string>;
	fileId: Ref<string>;
	cname: Ref<string>;
	onResolveSelectedItem?: (item: ViewerSlideListItem) => void;
	panelWidth?: number;
	panelHeight?: number;
	leftOffset?: number;
	topOffset?: number;
	triggerWidth?: number;
	triggerGap?: number;
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

function buildBadgeStyle(record: Record<string, unknown>) {
	const badgeText =
		pickFirstString(record, ['analResCode', 'analysisResult', 'resultCode', 'badgeText']) ||
		findAttributeValue(record, ['AI分析结果', '分析结果'], 'text');
	const abnormal = pickFirstString(record, ['abnormal']).toLowerCase();
	if (!badgeText) {
		return {
			badgeText: '',
			badgeColor: '',
			badgeBackgroundColor: '',
		};
	}
	if (abnormal === 'true' || abnormal === '1' || abnormal === 'yes') {
		return {
			badgeText,
			badgeColor: '#F56C6C',
			badgeBackgroundColor: 'rgba(245,108,108,0.16)',
		};
	}
	return {
		badgeText,
		badgeColor: '#67C23A',
		badgeBackgroundColor: 'rgba(103,194,58,0.16)',
	};
}

function getAttributeRecords(record: Record<string, unknown>) {
	return [...getArray(record.attributes), ...getArray(record.items)]
		.map((item) => getRecord(item))
		.filter((item): item is Record<string, unknown> => Boolean(item));
}

function findAttributeValue(record: Record<string, unknown>, labels: string[], type?: string) {
	for (const itemRecord of getAttributeRecords(record)) {
		const label = pickFirstString(itemRecord, ['label', 'name', 'title']);
		const itemType = pickFirstString(itemRecord, ['type', 'itemType']).toLowerCase();
		if (type && itemType !== type) {
			continue;
		}
		if (labels.includes(label)) {
			const value = pickFirstString(itemRecord, ['value', 'src', 'url', 'image', 'imgUrl']);
			if (value) {
				return value;
			}
		}
	}
	return '';
}

function extractThumbnail(record: Record<string, unknown>) {
	const directImage = pickFirstString(record, [
		'thumPath',
		'thumbPath',
		'thumbnail',
		'thumbnailUrl',
		'coverUrl',
		'image',
		'imgUrl',
	]);
	if (directImage) {
		return normalizeImageUrl(directImage);
	}
	const thumbnailFromAttributes = findAttributeValue(record, ['缩略图', 'thumbnail', '缩略图地址'], 'image');
	if (thumbnailFromAttributes) {
		return normalizeImageUrl(thumbnailFromAttributes);
	}
	for (const itemRecord of getAttributeRecords(record)) {
		const value = pickFirstString(itemRecord, ['value', 'src', 'url', 'image', 'imgUrl']);
		if (value) {
			return normalizeImageUrl(value);
		}
	}
	return '';
}

function extractMetaLines(record: Record<string, unknown>, title: string, subtitle: string, badgeText: string) {
	const lines: ViewerSlideListMetaLine[] = [];
	for (const itemRecord of getAttributeRecords(record)) {
		const label = pickFirstString(itemRecord, ['label', 'name', 'title']);
		const textValue = pickFirstString(itemRecord, ['value', 'text', 'content']);
		const itemType = pickFirstString(itemRecord, ['type', 'itemType']).toLowerCase();
		if (itemType === 'image') {
			continue;
		}
		if (!textValue || textValue === title || textValue === subtitle || textValue === badgeText) {
			continue;
		}
		lines.push({
			text: label ? `${label}：${textValue}` : textValue,
			color: pickFirstString(itemRecord, ['color']) || undefined,
		});
	}
	if (lines.length) {
		return lines;
	}
	const candidates = [
		['adoptedPart', '取材部位'],
		['partName', '部位'],
		['sampleType', '样本类型'],
		['statusText', '状态'],
		['scanTime', '扫描时间'],
	] as const;
	for (const [key, label] of candidates) {
		const value = normalizeText(record[key]);
		if (!value || value === title || value === subtitle) {
			continue;
		}
		lines.push({ text: `${label}：${value}` });
	}
	return lines;
}

function normalizeListItem(rawItem: unknown): ViewerSlideListItem | null {
	const record = getRecord(rawItem);
	if (!record) {
		return null;
	}
	const sliceId = pickFirstString(record, ['sliceId', 'fileId', 'id']);
	if (!sliceId) {
		return null;
	}
	const fileId = pickFirstString(record, ['fileId', 'sliceId', 'id']) || sliceId;
	const title =
		pickFirstString(record, ['abbrSlideName', 'sliceName', 'slideName', 'title', 'name']) ||
		findAttributeValue(record, ['切片号', 'sliceName', '切片名称'], 'text') ||
		'未命名切片';
	const subtitle =
		pickFirstString(record, ['adoptedPart', 'partName', 'subtitle', 'subTitle']) ||
		findAttributeValue(record, ['切片状态', '状态'], 'text');
	const { badgeText, badgeColor, badgeBackgroundColor } = buildBadgeStyle(record);
	return {
		sliceId,
		fileId,
		title,
		subtitle,
		thumbnailUrl: extractThumbnail(record),
		metaLines: extractMetaLines(record, title, subtitle, badgeText),
		badgeText,
		badgeColor,
		badgeBackgroundColor,
		analResCode: pickFirstString(record, ['analResCode', 'analysisResult', 'resultCode']),
	};
}

function normalizeSlideListResponse(payload: SlideListResponse | null | undefined) {
	const data = getRecord(payload) ?? {};
	const nestedData = getRecord(data) ?? {};
	const rawItems = getArray(nestedData.slideList);
	const itemMap = new Map<string, ViewerSlideListItem>();
	for (const rawItem of rawItems) {
		const item = normalizeListItem(rawItem);
		if (!item || itemMap.has(item.sliceId)) {
			continue;
		}
		itemMap.set(item.sliceId, item);
	}
	return Array.from(itemMap.values());
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function useViewerSlideList(options: UseViewerSlideListOptions) {
	const panelWidth = options.panelWidth ?? 320;
	const panelHeight = options.panelHeight ?? 540;
	const leftOffset = options.leftOffset ?? 16;
	const topOffset = options.topOffset ?? 16;
	const triggerWidth = options.triggerWidth ?? 46;
	const triggerGap = options.triggerGap ?? 12;
	const loading = ref(false);
	const error = ref('');
	const items = ref<ViewerSlideListItem[]>([]);
	const hasLoaded = ref(false);
	const selectedRowId = ref('');
	const listContainerRef = ref<HTMLElement | null>(null);
	const panelElementRef = ref<HTMLElement | null>(null);
	const panelPosition = ref<SlideListPanelPosition>({
		x: leftOffset + triggerWidth + triggerGap,
		y: Math.max(topOffset, Math.round((window.innerHeight - panelHeight) / 2)),
	});
	const dragging = ref(false);
	const hasMoved = ref(false);

	let scrollTimer: number | null = null;
	let dragOffsetX = 0;
	let dragOffsetY = 0;

	const selectedIndex = computed(() => {
		const activeSliceId = options.slideId.value || selectedRowId.value;
		return items.value.findIndex((item) => item.sliceId === activeSliceId);
	});
	const selectedItem = computed(() => items.value[selectedIndex.value] ?? null);
	const hasPrev = computed(() => selectedIndex.value > 0);
	const hasNext = computed(() => selectedIndex.value >= 0 && selectedIndex.value < items.value.length - 1);
	const total = computed(() => items.value.length);
	const current = computed(() => (selectedIndex.value >= 0 ? selectedIndex.value + 1 : 0));

	function getPanelSize() {
		return {
			width: panelElementRef.value?.offsetWidth ?? panelWidth,
			height: panelElementRef.value?.offsetHeight ?? panelHeight,
		};
	}

	function getDefaultPosition() {
		const { width, height } = getPanelSize();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const maxX = Math.max(leftOffset, viewportWidth - width - leftOffset);
		const maxY = Math.max(topOffset, viewportHeight - height - topOffset);
		return {
			x: clamp(leftOffset + triggerWidth + triggerGap, leftOffset, maxX),
			y: clamp(Math.round((viewportHeight - height) / 2), topOffset, maxY),
		};
	}

	function clampPanelPosition(nextPosition: SlideListPanelPosition) {
		const { width, height } = getPanelSize();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const maxX = Math.max(leftOffset, viewportWidth - width - leftOffset);
		const maxY = Math.max(topOffset, viewportHeight - height - topOffset);
		return {
			x: clamp(nextPosition.x, leftOffset, maxX),
			y: clamp(nextPosition.y, topOffset, maxY),
		};
	}

	function stopScrollTimer() {
		if (scrollTimer != null) {
			window.clearTimeout(scrollTimer);
			scrollTimer = null;
		}
	}

	function setListContainer(element: HTMLElement | null) {
		listContainerRef.value = element;
	}

	function setPanelElement(element: HTMLElement | null) {
		panelElementRef.value = element;
		if (!element) {
			return;
		}
		window.requestAnimationFrame(() => {
			if (panelElementRef.value !== element) {
				return;
			}
			panelPosition.value = hasMoved.value ? clampPanelPosition(panelPosition.value) : getDefaultPosition();
		});
	}

	async function scrollSelectedIntoView() {
		stopScrollTimer();
		await nextTick();
		const container = listContainerRef.value;
		const targetId = selectedRowId.value || options.slideId.value;
		if (!container || !targetId) {
			return;
		}
		const selectedElement = container.querySelector<HTMLElement>(`[data-slice-id="${CSS.escape(targetId)}"]`);
		if (!selectedElement) {
			scrollTimer = window.setTimeout(() => {
				void scrollSelectedIntoView();
			}, 80);
			return;
		}
		selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
	}

	function resetPanelPosition() {
		const startPosition = { ...panelPosition.value };
		const targetPosition = getDefaultPosition();
		if (startPosition.x === targetPosition.x && startPosition.y === targetPosition.y) {
			hasMoved.value = false;
			return;
		}
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
			hasMoved.value = false;
		};
		window.requestAnimationFrame(animate);
	}

	async function fetchList(force = false) {
		const requestSeedId = options.fileId.value || options.slideId.value || selectedRowId.value || 'placeholder-file-id';
		if (loading.value) {
			return;
		}
		if (hasLoaded.value && !force) {
			return;
		}
		loading.value = true;
		error.value = '';
		try {
			const response = await getSlideList({
				cname: options.cname.value || 'AI',
				fileId: options.fileId.value || requestSeedId,
				sliceId: options.slideId.value || requestSeedId,
				source: 1073741824,
			});
			const normalized = normalizeSlideListResponse(
				(response as unknown as { data?: SlideListResponse }).data ?? (response as unknown as SlideListResponse)
			);
			items.value = normalized;
			hasLoaded.value = true;
			const resolvedItem = normalized.find((item) => item.sliceId === options.slideId.value) || normalized[0] || null;
			const resolvedSliceId = resolvedItem?.sliceId || '';
			selectedRowId.value = resolvedSliceId;
			if (resolvedItem && (resolvedItem.sliceId !== options.slideId.value || resolvedItem.fileId !== options.fileId.value)) {
				options.onResolveSelectedItem?.(resolvedItem);
			}
			if (normalized.length) {
				void scrollSelectedIntoView();
			}
		} catch (requestError) {
			console.error('[ViewerSlideList] 切片列表加载失败：', requestError);
			error.value = '切片列表加载失败';
			items.value = [];
			if (hasLoaded.value) {
				ElMessage.error(error.value);
			}
		} finally {
			loading.value = false;
		}
	}

	function retry() {
		hasLoaded.value = false;
		void fetchList(true);
	}

	function selectSlice(sliceId: string) {
		selectedRowId.value = sliceId;
	}

	function selectPrev() {
		if (!hasPrev.value) {
			return;
		}
		const previousItem = items.value[selectedIndex.value - 1];
		if (previousItem) {
			selectedRowId.value = previousItem.sliceId;
		}
	}

	function selectNext() {
		if (!hasNext.value) {
			return;
		}
		const nextItem = items.value[selectedIndex.value + 1];
		if (nextItem) {
			selectedRowId.value = nextItem.sliceId;
		}
	}

	function handleWindowResize() {
		panelPosition.value = hasMoved.value ? clampPanelPosition(panelPosition.value) : getDefaultPosition();
	}

	function stopDragging() {
		dragging.value = false;
		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerup', stopDragging);
		window.removeEventListener('pointercancel', stopDragging);
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
		event.preventDefault();
		dragging.value = true;
		dragOffsetX = event.clientX - panelPosition.value.x;

		dragOffsetY = event.clientY - panelPosition.value.y;
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', stopDragging);
		window.addEventListener('pointercancel', stopDragging);
	}

	watch(
		() => options.cname.value,
		() => {
			hasLoaded.value = false;
			error.value = '';
			panelPosition.value = getDefaultPosition();
			hasMoved.value = false;
			void fetchList(true);
		},
		{ immediate: true }
	);

	watch(
		() => options.slideId.value,
		(sliceId) => {
			selectedRowId.value = sliceId;
			if (!sliceId) {
				return;
			}
			if (!items.value.length) {
				return;
			}
			void scrollSelectedIntoView();
		}
	);

	window.addEventListener('resize', handleWindowResize);

	onBeforeUnmount(() => {
		stopScrollTimer();
		stopDragging();
		window.removeEventListener('resize', handleWindowResize);
	});

	return {
		list: {
			loading,
			error,
			items,
			selectedItem,
			selectedIndex,
			total,
			current,
			hasPrev,
			hasNext,
			selectedRowId,
		},
		panel: {
			position: panelPosition,
			hasMoved,
		},
		actions: {
			fetch: fetchList,
			retry,
			selectSlice,
			selectPrev,
			selectNext,
			setListContainer,
			setPanelElement,
			scrollSelectedIntoView,
			startDragging,
			resetPosition: resetPanelPosition,
		},
	};
}
