import { onBeforeUnmount, onMounted } from 'vue';
import { OSD_MAGNIFICATION_PRESETS } from '@/config/openseadragon';

export type ViewerShortcutDirection = 'left' | 'right' | 'up' | 'down';
type ViewerShortcutMagnification = 2 | 4 | 10 | 20 | 40;

interface ShortcutHandlers {
	onSelectMagnification: (magnification: ViewerShortcutMagnification) => void;
	onFitToViewport: () => void;
	onToggleAutoPlay?: () => void;
	onAutoPlayDirection?: (direction: ViewerShortcutDirection) => void;
}

const MAGNIFICATION_SHORTCUT_MAP = OSD_MAGNIFICATION_PRESETS.reduce<Record<string, ViewerShortcutMagnification | 'fit'>>(
	(map, preset) => {
		if (preset.shortcut) {
			map[preset.shortcut.toLowerCase()] = preset.value as ViewerShortcutMagnification | 'fit';
		}
		return map;
	},
	{}
);

function isEditableTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) return false;
	const tagName = target.tagName.toLowerCase();
	return target.isContentEditable || ['input', 'textarea', 'select'].includes(tagName);
}

function getArrowDirection(code: string): ViewerShortcutDirection | null {
	if (code === 'ArrowLeft') return 'left';
	if (code === 'ArrowRight') return 'right';
	if (code === 'ArrowUp') return 'up';
	if (code === 'ArrowDown') return 'down';
	return null;
}

export function useViewerShortcuts({
	onSelectMagnification,
	onFitToViewport,
	onToggleAutoPlay,
	onAutoPlayDirection,
}: ShortcutHandlers) {
	function handleKeydown(event: KeyboardEvent) {
		if (event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || isEditableTarget(event.target))
			return;

		if (event.code === 'KeyP') {
			if (!onToggleAutoPlay) return;
			event.preventDefault();
			onToggleAutoPlay();
			return;
		}

		const direction = getArrowDirection(event.code);
		if (direction) {
			if (!onAutoPlayDirection) return;
			event.preventDefault();
			onAutoPlayDirection(direction);
			return;
		}

		const preset = MAGNIFICATION_SHORTCUT_MAP[event.key.toLowerCase()];
		if (!preset) return;

		event.preventDefault();
		if (preset === 'fit') {
			onFitToViewport();
			return;
		}

		onSelectMagnification(preset);
	}

	onMounted(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onBeforeUnmount(() => {
		window.removeEventListener('keydown', handleKeydown);
	});
}
