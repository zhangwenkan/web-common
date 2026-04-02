<template>
	<div class="w-[300px] rounded-md bg-[rgba(40,49,66,0.92)] text-white shadow-[0_12px_32px_rgba(15,23,42,0.42)]">
		<div class="flex cursor-move items-center justify-between px-4 py-3" @pointerdown="emit('drag-start', $event)">
			<div class="truncate text-sm font-semibold text-white">切片信息</div>
			<button
				type="button"
				class="flex h-6 w-6 items-center justify-center text-slate-300 transition hover:text-white"
				@click="emit('close')"
			>
				×
			</button>
		</div>

		<div class="max-h-[70vh] overflow-y-auto px-[13px] pb-[10px]">
			<div
				v-if="loading"
				class="mt-[10px] flex h-24 items-center justify-center rounded bg-[#4b5c71] text-sm text-slate-200"
			>
				加载中...
			</div>

			<div v-else-if="error" class="mt-[10px] space-y-3 rounded bg-[#4b5c71] p-3">
				<div class="text-sm text-rose-100">{{ error }}</div>
				<button
					type="button"
					class="w-full rounded bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
					@click="emit('retry')"
				>
					重试
				</button>
			</div>

			<div
				v-else-if="!imageItems.length && !textItems.length"
				class="mt-[10px] flex h-24 items-center justify-center rounded bg-[#4b5c71] text-sm text-slate-200"
			>
				暂无切片信息
			</div>

			<div v-else class="mt-[10px] rounded bg-[#4b5c71] px-[13px] py-[10px]">
				<div v-if="activeImage" class="w-full">
					<div class="relative h-24 w-full">
						<img :src="activeImage.src" :alt="activeImage.label" class="h-full w-full object-contain" />
						<button
							v-if="imageItems.length > 1"
							type="button"
							class="absolute top-1/2 left-0 -translate-y-1/2 text-lg text-white/80 transition hover:text-white"
							@click="emit('prev-image')"
						>
							‹
						</button>
						<button
							v-if="imageItems.length > 1"
							type="button"
							class="absolute top-1/2 right-0 -translate-y-1/2 text-lg text-white/80 transition hover:text-white"
							@click="emit('next-image')"
						>
							›
						</button>
					</div>
				</div>

				<div class="mt-[10px] flex flex-col items-start">
					<p
						v-for="item in textItems"
						:key="`${item.label}-${item.value}`"
						class="mb-[6px] flex items-start text-[14px] text-white last:mb-0"
					>
						<span>{{ item.label }}：</span>
						<span
							class="ml-[5px] inline-block max-w-[180px] break-all whitespace-normal"
							:style="{ color: item.color || '#ccc' }"
							>{{ item.value }}</span
						>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { ViewerSlideInfoImageItem, ViewerSlideInfoTextItem } from '@/composables/useViewerSlideInfo';

	defineProps<{
		imageItems: ViewerSlideInfoImageItem[];
		textItems: ViewerSlideInfoTextItem[];
		activeImage: ViewerSlideInfoImageItem | null;
		loading: boolean;
		error: string;
	}>();

	const emit = defineEmits<{
		(e: 'close'): void;
		(e: 'retry'): void;
		(e: 'prev-image'): void;
		(e: 'next-image'): void;
		(e: 'drag-start', event: PointerEvent): void;
	}>();
</script>
