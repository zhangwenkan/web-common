import { computed, ref, type Ref } from 'vue';
import type { Viewer } from '@/utils/openseadragon';
import type { useWsiStore } from '@/store/modules/wsi';

interface WsiScaleBarRefs {
	scanMagnification: Ref<number>;
	physicalResolution: Ref<number>;
}

interface ScaleBarState {
	widthPx: number;
	displayText: string;
	unit: 'μm' | 'mm';
}

const TARGET_BAR_WIDTH_PX = 108;
const MIN_BAR_WIDTH_PX = 64;
const MAX_BAR_WIDTH_PX = 148;

export function useViewerScaleBar(
	viewer: Ref<Viewer | null>,
	_wsiStore: ReturnType<typeof useWsiStore>,
	wsiStoreRefs: WsiScaleBarRefs
) {
	const { scanMagnification, physicalResolution } = wsiStoreRefs;
	const widthPx = ref(0);
	const displayText = ref('');
	const unit = ref<'μm' | 'mm'>('μm');

	const isVisible = computed(() => widthPx.value > 0 && physicalResolution.value > 0 && scanMagnification.value > 0);

	function getContainerWidth() {
		if (!viewer.value) return 0;
		return viewer.value.viewport.getContainerSize().x;
	}

	function getImageWidth() {
		if (!viewer.value || !viewer.value.world.getItemCount()) return 0;
		return viewer.value.world.getItemAt(0).getContentSize().x;
	}

	function getScreenPixelsPerImagePixel() {
		const containerWidth = getContainerWidth();
		const imageWidth = getImageWidth();
		if (!containerWidth || !imageWidth || !viewer.value) return 0;
		return (containerWidth * viewer.value.viewport.getZoom(true)) / imageWidth;
	}

	function formatPhysicalLength(lengthUm: number) {
		if (lengthUm >= 1000) {
			return {
				displayText: trimTrailingZeros((lengthUm / 1000).toFixed(lengthUm >= 10000 ? 0 : lengthUm >= 2000 ? 1 : 2)),
				unit: 'mm' as const,
			};
		}

		return {
			displayText: trimTrailingZeros(
				lengthUm >= 100 ? lengthUm.toFixed(0) : lengthUm >= 10 ? lengthUm.toFixed(1) : lengthUm.toFixed(2)
			),
			unit: 'μm' as const,
		};
	}

	function trimTrailingZeros(value: string) {
		return value.replace(/\.0+$|(?<=\.[0-9]*[1-9])0+$/u, '');
	}

	function buildCandidatePhysicalLengths(targetLengthUm: number) {
		if (targetLengthUm <= 0) {
			return [];
		}

		const exponent = Math.floor(Math.log10(targetLengthUm));
		const candidates = new Set<number>();
		for (let power = exponent - 2; power <= exponent + 2; power += 1) {
			const base = 10 ** power;
			for (const step of [1, 2, 5]) {
				candidates.add(step * base);
			}
		}

		return Array.from(candidates)
			.filter((value) => value > 0)
			.sort((a, b) => a - b);
	}

	function pickScaleBarState(): ScaleBarState | null {
		const resolutionUmPerPixel = physicalResolution.value;
		const screenPixelsPerImagePixel = getScreenPixelsPerImagePixel();
		if (!resolutionUmPerPixel || !screenPixelsPerImagePixel) {
			return null;
		}

		const targetLengthUm = (TARGET_BAR_WIDTH_PX * resolutionUmPerPixel) / screenPixelsPerImagePixel;
		const candidates = buildCandidatePhysicalLengths(targetLengthUm);
		let bestCandidate: ScaleBarState | null = null;
		let bestScore = Number.POSITIVE_INFINITY;

		for (const candidateLengthUm of candidates) {
			const candidateWidthPx = (candidateLengthUm * screenPixelsPerImagePixel) / resolutionUmPerPixel;
			const distancePenalty = Math.abs(candidateWidthPx - TARGET_BAR_WIDTH_PX);
			const boundsPenalty =
				candidateWidthPx < MIN_BAR_WIDTH_PX
					? (MIN_BAR_WIDTH_PX - candidateWidthPx) * 4
					: candidateWidthPx > MAX_BAR_WIDTH_PX
						? (candidateWidthPx - MAX_BAR_WIDTH_PX) * 4
						: 0;
			const score = distancePenalty + boundsPenalty;
			if (score >= bestScore) {
				continue;
			}
			const formatted = formatPhysicalLength(candidateLengthUm);
			bestScore = score;
			bestCandidate = {
				widthPx: Math.max(0, Math.round(candidateWidthPx)),
				displayText: formatted.displayText,
				unit: formatted.unit,
			};
		}

		return bestCandidate;
	}

	function syncScaleBar() {
		const nextState = pickScaleBarState();
		if (!nextState) {
			widthPx.value = 0;
			displayText.value = '';
			unit.value = 'μm';
			return;
		}

		widthPx.value = nextState.widthPx;
		displayText.value = nextState.displayText;
		unit.value = nextState.unit;
	}

	function handleViewerOpen() {
		syncScaleBar();
	}

	function handleViewerAnimation() {
		syncScaleBar();
	}

	function handleAnimationFinish() {
		syncScaleBar();
	}

	function handleViewportResize() {
		syncScaleBar();
	}

	return {
		widthPx,
		displayText,
		unit,
		isVisible,
		handleViewerOpen,
		handleViewerAnimation,
		handleAnimationFinish,
		handleViewportResize,
	};
}
