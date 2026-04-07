<template>
	<div
		v-if="visible"
		class="pointer-events-none flex flex-col gap-2 overflow-hidden rounded-[22px] bg-[rgba(40,49,66,0.72)] px-4 py-3 text-white shadow-[0_8px_20px_rgba(15,23,42,0.35)] backdrop-blur-sm transition-[width] duration-200 ease-out"
		:style="{ width: `${containerWidthPx}px` }"
	>
		<div class="flex items-end justify-between text-[11px] leading-none text-white/88">
			<span>0</span>
			<span>{{ label }}{{ unit }}</span>
		</div>

		<div class="relative h-3">
			<div class="absolute bottom-0 left-0 h-3 w-px bg-white/92"></div>
			<div
				class="absolute bottom-0 left-0 h-px bg-white/92 transition-[width] duration-200 ease-out"
				:style="{ width: `${widthPx}px` }"
			></div>
			<div
				class="absolute bottom-0 h-3 w-px bg-white/92 transition-[left] duration-200 ease-out"
				:style="{ left: `${widthPx}px` }"
			></div>
		</div>
	</div>
</template>

<script setup lang="ts" name="ViewerScaleBar">
	import { computed } from 'vue';

	const props = defineProps<{
		visible: boolean;
		widthPx: number;
		label: string;
		unit: 'μm' | 'mm';
	}>();

	const containerWidthPx = computed(() => Math.max(props.widthPx + 32, 116));
</script>
