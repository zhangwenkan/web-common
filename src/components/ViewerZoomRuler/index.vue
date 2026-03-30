<template>
	<div
		class="absolute bottom-4 left-4 z-10 flex flex-col items-center gap-2 rounded-[20px] bg-slate-500/90 px-2 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.16)]"
	>
		<div class="flex min-w-11 justify-center rounded-full bg-white/10 px-2 py-1">
			<span class="text-[11px] font-semibold" :class="isWarning ? 'text-red-400' : 'text-white'">
				{{ currentMagnificationLabel }}
			</span>
		</div>

		<div class="relative flex flex-col items-center gap-1.5 py-1">
			<button
				v-for="preset in presetMagnifications"
				:key="String(preset.value)"
				type="button"
				:disabled="preset.value === 'fit' ? false : isPresetDisabled(preset.value)"
				:title="preset.title"
				class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[10px] cursor-pointer font-medium transition-all duration-300 ease-out"
				:class="getPresetButtonClasses(preset.value)"
				@click="handlePresetClick(preset.value)"
			>
				{{ preset.label }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts" name="ViewerZoomRuler">
	const props = defineProps<{
		currentMagnificationLabel: string;
		isWarning: boolean;
		isFitActive: boolean;
		presetMagnifications: readonly { value: number | 'fit'; label: string; title: string }[];
		isPresetDisabled: (preset: number) => boolean;
		isPresetActive: (preset: number) => boolean;
	}>();

	const emit = defineEmits<{
		selectMagnification: [magnification: number];
		fitToViewport: [];
	}>();

	function handlePresetClick(value: number | 'fit') {
		if (value === 'fit') {
			emit('fitToViewport');
			return;
		}

		emit('selectMagnification', value);
	}

	function getPresetButtonClasses(preset: number | 'fit') {
		if (preset === 'fit') {
			return getFitButtonClasses();
		}

		if (props.isPresetDisabled(preset)) {
			return 'cursor-not-allowed bg-white/10 text-white/45';
		}

		// if (props.isPresetActive(preset)) {
		// 	return 'scale-105 bg-white text-slate-600 shadow-sm';
		// }

		return 'bg-white/18 text-white hover:scale-105 hover:bg-white/28';
	}

	function getFitButtonClasses() {
		if (props.isFitActive) {
			return 'scale-105 bg-white text-slate-600 shadow-sm';
		}

		return 'bg-white/18 text-white hover:scale-105 hover:bg-white/28';
	}
</script>
