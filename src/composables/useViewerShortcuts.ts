import { onBeforeUnmount, onMounted } from 'vue';
import { OSD_MAGNIFICATION_PRESETS } from '@/config/openseadragon';

interface ShortcutHandlers {
	onSelectMagnification: (magnification: 2 | 4 | 10 | 20 | 40) => void;
	onFitToViewport: () => void;
}

const MAGNIFICATION_SHORTCUT_MAP = OSD_MAGNIFICATION_PRESETS.reduce<Record<string, number | 'fit'>>((map, preset) => {
	if (preset.shortcut) {
		map[preset.shortcut.toLowerCase()] = preset.value;
	}
	return map;
}, {});

function isEditableTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) return false;
	const tagName = target.tagName.toLowerCase();
	return target.isContentEditable || ['input', 'textarea', 'select'].includes(tagName);
}

export function useViewerShortcuts({ onSelectMagnification, onFitToViewport }: ShortcutHandlers) {
	function handleKeydown(event: KeyboardEvent) {
		if (event.repeat || isEditableTarget(event.target)) return;

		const preset = MAGNIFICATION_SHORTCUT_MAP[event.key.toLowerCase()];
		if (!preset) return;

		event.preventDefault();
		if (preset === 'fit') {
			onFitToViewport();
			return;
		}

		onSelectMagnification(preset as 2 | 4 | 10 | 20 | 40);
	}

	onMounted(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onBeforeUnmount(() => {
		window.removeEventListener('keydown', handleKeydown);
	});
}
