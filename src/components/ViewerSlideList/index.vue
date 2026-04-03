<template>
	<div
		ref="panelRef"
		class="w-[320px] rounded-[16px] border border-white/10 bg-[rgba(40,49,66,0.92)] text-white shadow-[0_12px_32px_rgba(15,23,42,0.42)]"
	>
		<div class="flex cursor-move items-center justify-between px-4 py-3" @pointerdown="emit('drag-start', $event)">
			<div>
				<div class="text-sm font-semibold text-white">切片列表</div>
				<div class="mt-1 text-xs text-slate-300">{{ currentText }}</div>
			</div>
			<button
				type="button"
				class="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
				@pointerdown.stop
				@click="emit('close')"
			>
				×
			</button>
		</div>

		<div ref="listContainerRef" class="max-h-[58vh] overflow-y-auto px-3 pb-3">
			<div
				v-if="loading"
				class="flex h-24 items-center justify-center rounded-[12px] bg-[#4b5c71] text-sm text-slate-200"
			>
				加载中...
			</div>

			<div v-else-if="error" class="space-y-3 rounded-[12px] bg-[#4b5c71] p-3">
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
				v-else-if="!items.length"
				class="flex h-24 items-center justify-center rounded-[12px] bg-[#4b5c71] text-sm text-slate-200"
			>
				暂无切片
			</div>

			<div v-else class="space-y-2">
				<button
					v-for="item in items"
					:key="item.sliceId"
					type="button"
					class="flex w-full items-start gap-3 rounded-[14px] px-3 py-3 text-left transition"
					:class="
						item.sliceId === selectedSliceId ? 'bg-sky-500/18 ring-1 ring-sky-400/65' : 'bg-white/6 hover:bg-white/10'
					"
					:data-slice-id="item.sliceId"
					@click="emit('select', item.sliceId)"
				>
					<div class="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px] bg-slate-700/90">
						<img
							v-if="item.thumbnailUrl"
							:src="item.thumbnailUrl"
							:alt="item.title"
							class="h-full w-full object-cover"
						/>
						<div v-else class="flex h-full w-full items-center justify-center text-xs text-slate-300">暂无缩略图</div>
					</div>

					<div class="min-w-0 flex-1">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0">
								<div class="truncate text-sm font-semibold text-white">{{ item.title }}</div>
								<div v-if="item.subtitle" class="mt-1 truncate text-xs text-slate-300">{{ item.subtitle }}</div>
							</div>
							<span
								v-if="item.badgeText"
								class="shrink-0 rounded-full px-2 py-1 text-[11px] leading-none"
								:style="{
									color: item.badgeColor,
									backgroundColor: item.badgeBackgroundColor,
								}"
							>
								{{ item.badgeText }}
							</span>
						</div>

						<div v-if="item.metaLines.length" class="mt-2 space-y-1">
							<p
								v-for="meta in item.metaLines"
								:key="`${item.sliceId}-${meta.text}`"
								class="line-clamp-2 text-xs leading-5 text-slate-300"
								:style="{ color: meta.color || '' }"
							>
								{{ meta.text }}
							</p>
						</div>
					</div>
				</button>
			</div>
		</div>

		<div class="flex items-center justify-between border-t border-white/10 px-4 py-3">
			<button
				type="button"
				class="rounded-full px-3 py-1 text-sm transition"
				:class="hasPrev ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-white/5 text-slate-500 cursor-not-allowed'"
				:disabled="!hasPrev"
				@click="emit('prev')"
			>
				上一张
			</button>
			<button
				type="button"
				class="rounded-full px-3 py-1 text-sm transition"
				:class="hasNext ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-white/5 text-slate-500 cursor-not-allowed'"
				:disabled="!hasNext"
				@click="emit('next')"
			>
				下一张
			</button>
		</div>
	</div>
</template>

<script setup lang="ts" name="ViewerSlideList">
	import { computed, useTemplateRef, watch } from 'vue';
	import type { ViewerSlideListItem } from '@/composables/useViewerSlideList';

	const props = defineProps<{
		items: ViewerSlideListItem[];
		selectedSliceId: string;
		loading: boolean;
		error: string;
		current: number;
		total: number;
		hasPrev: boolean;
		hasNext: boolean;
	}>();

	const emit = defineEmits<{
		(e: 'retry'): void;
		(e: 'select', sliceId: string): void;
		(e: 'prev'): void;
		(e: 'next'): void;
		(e: 'close'): void;
		(e: 'drag-start', event: PointerEvent): void;
		(e: 'container-change', element: HTMLElement | null): void;
		(e: 'panel-change', element: HTMLElement | null): void;
	}>();

	const panelRef = useTemplateRef('panelRef');
	const listContainerRef = useTemplateRef('listContainerRef');
	const currentText = computed(() => {
		if (!props.total) {
			return '共 0 张';
		}
		if (!props.current) {
			return `共 ${props.total} 张`;
		}
		return `${props.current} / ${props.total}`;
	});

	watch(
		panelRef,
		(element) => {
			emit('panel-change', element ?? null);
		},
		{ immediate: true }
	);

	watch(
		listContainerRef,
		(element) => {
			emit('container-change', element ?? null);
		},
		{ immediate: true }
	);
</script>
