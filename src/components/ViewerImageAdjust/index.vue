<template>
	<transition name="viewer-image-adjust-fade">
		<div
			v-if="visible"
			class="w-[360px] rounded-[16px] border border-slate-600 bg-slate-800 px-5 py-4 text-white shadow-[0_12px_32px_rgba(15,23,42,0.45)]"
		>
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-[18px] font-semibold">图像调节</h3>
				<button
					type="button"
					class="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
					@click="emit('close')"
				>
					<el-icon :size="22"><Close /></el-icon>
				</button>
			</div>

			<div class="rounded-[12px] bg-slate-600/90 px-5 py-4">
				<div v-for="item in primaryControls" :key="item.key" class="mb-5 last:mb-0">
					<div class="mb-2 flex items-center justify-between text-[14px] font-medium">
						<span>{{ item.label }}</span>
						<span class="rounded bg-white/10 px-3 py-1 text-[13px]">{{ item.displayValue }}</span>
					</div>
					<el-slider
						v-model="uiState[item.key]"
						:min="item.min"
						:max="item.max"
						:step="item.step"
						:show-tooltip="false"
						@change="emitApply"
					/>
				</div>

				<div class="mt-8">
					<div class="mb-3 text-[18px] font-semibold">颜色通道</div>
					<div class="mb-4 flex gap-2">
						<button
							v-for="channel in channelOptions"
							:key="channel.value"
							type="button"
							class="min-w-[56px] rounded-md px-4 py-2 text-[14px] font-medium transition"
							:class="
								activeChannel === channel.value
									? 'bg-sky-500 text-white'
									: 'bg-slate-500 text-slate-100 hover:bg-slate-400'
							"
							@click="selectChannel(channel.value)"
						>
							{{ channel.label }}
						</button>
					</div>

					<div v-show="activeChannel === 'all'">
						<div v-for="item in channelControls" :key="item.key" class="mb-5 last:mb-0">
							<div class="mb-2 flex items-center justify-between text-[14px] font-medium">
								<span>{{ item.label }}</span>
								<span class="rounded px-3 py-1 text-[13px] text-white" :style="{ backgroundColor: item.badgeColor }">
									{{ item.displayValue }}
								</span>
							</div>
							<el-slider
								v-model="uiState[item.key]"
								:min="0"
								:max="200"
								:show-tooltip="false"
								:class="item.sliderClass"
								@change="handleChannelSliderChange"
							/>
						</div>
					</div>
				</div>

				<div class="mt-6 flex justify-end">
					<button
						type="button"
						class="rounded-md bg-sky-500 px-5 py-2 text-[15px] font-semibold text-white transition hover:bg-sky-400"
						@click="resetAdjustments"
					>
						清除
					</button>
				</div>
			</div>
		</div>
	</transition>
</template>

<script setup lang="ts" name="ViewerImageAdjust">
	import { Close } from '@element-plus/icons-vue';
	import { computed, reactive, watch } from 'vue';
	import type { TileParams } from '@/store/modules/wsi';

	type ChannelValue = 'all' | 'red' | 'green' | 'blue';

	interface ImageAdjustUiState {
		gamma: number;
		contrast: number;
		brightness: number;
		sharpen: number;
		redGain: number;
		greenGain: number;
		blueGain: number;
	}

	const props = defineProps<{
		modelValue: TileParams;
		defaultParams: TileParams;
		visible: boolean;
	}>();

	const emit = defineEmits<{
		apply: [params: TileParams];
		close: [];
	}>();

	const uiState = reactive<ImageAdjustUiState>(createUiState(props.modelValue));
	const savedChannelState = reactive({
		redGain: uiState.redGain,
		greenGain: uiState.greenGain,
		blueGain: uiState.blueGain,
	});
	const activeChannelState = reactive({
		value: 'all' as ChannelValue,
	});

	const primaryControls = computed(
		() =>
			[
				{
					key: 'gamma',
					label: '伽马',
					displayValue: formatGamma(uiState.gamma),
					min: 0.2,
					max: 5,
					step: 0.1,
				},
				{
					key: 'contrast',
					label: '对比度',
					displayValue: `${uiState.contrast}%`,
					min: 0,
					max: 200,
					step: 1,
				},
				{
					key: 'brightness',
					label: '亮度',
					displayValue: `${uiState.brightness}%`,
					min: 0,
					max: 200,
					step: 1,
				},
				{
					key: 'sharpen',
					label: '锐化',
					displayValue: `${uiState.sharpen}`,
					min: 0,
					max: 2,
					step: 1,
				},
			] as const
	);

	const channelControls = computed(
		() =>
			[
				{
					key: 'redGain',
					label: '红:',
					displayValue: `${uiState.redGain}%`,
					badgeColor: '#ef4444',
					sliderClass: 'slider-red',
				},
				{
					key: 'greenGain',
					label: '绿:',
					displayValue: `${uiState.greenGain}%`,
					badgeColor: '#22c55e',
					sliderClass: 'slider-green',
				},
				{
					key: 'blueGain',
					label: '蓝:',
					displayValue: `${uiState.blueGain}%`,
					badgeColor: '#38bdf8',
					sliderClass: 'slider-blue',
				},
			] as const
	);

	const channelOptions = computed(() => [
		{ value: 'all' as const, label: '全部' },
		{ value: 'red' as const, label: '红' },
		{ value: 'green' as const, label: '绿' },
		{ value: 'blue' as const, label: '蓝' },
	]);

	const visible = computed(() => props.visible);
	const activeChannel = computed(() => activeChannelState.value);

	watch(
		() => props.modelValue,
		(params) => {
			syncUiState(params);
		},
		{ deep: true }
	);

	function createUiState(params: TileParams): ImageAdjustUiState {
		return {
			gamma: roundOneDecimal(params.gamma),
			contrast: normalizePercent(params.contrast),
			brightness: normalizeBrightness(params.brightness),
			sharpen: params.sharpen,
			redGain: normalizePercent(params.redGain),
			greenGain: normalizePercent(params.greenGain),
			blueGain: normalizePercent(params.blueGain),
		};
	}

	function syncUiState(params: TileParams) {
		const nextState = createUiState(params);
		uiState.gamma = nextState.gamma;
		uiState.contrast = nextState.contrast;
		uiState.brightness = nextState.brightness;
		uiState.sharpen = nextState.sharpen;
		uiState.redGain = nextState.redGain;
		uiState.greenGain = nextState.greenGain;
		uiState.blueGain = nextState.blueGain;
		savedChannelState.redGain = nextState.redGain;
		savedChannelState.greenGain = nextState.greenGain;
		savedChannelState.blueGain = nextState.blueGain;
		activeChannelState.value = 'all';
	}

	function roundOneDecimal(value: number) {
		return Number.parseFloat(value.toFixed(1));
	}

	function formatGamma(value: number) {
		return Number.isInteger(value) ? `${value}` : value.toFixed(1);
	}

	function normalizePercent(value: number) {
		return Math.round(value * 100);
	}

	function normalizeBrightness(value: number) {
		return Math.round((value + 1) * 100);
	}

	function buildTileParams(): TileParams {
		return {
			...props.modelValue,
			gamma: roundOneDecimal(uiState.gamma),
			contrast: uiState.contrast / 100,
			brightness: uiState.brightness / 100 - 1,
			sharpen: uiState.sharpen,
			redGain: uiState.redGain / 100,
			greenGain: uiState.greenGain / 100,
			blueGain: uiState.blueGain / 100,
			colorStyle: 0,
			hue: 0,
			saturation: 1,
		};
	}

	function emitApply() {
		emit('apply', buildTileParams());
	}

	function rememberCurrentRgb() {
		savedChannelState.redGain = uiState.redGain;
		savedChannelState.greenGain = uiState.greenGain;
		savedChannelState.blueGain = uiState.blueGain;
	}

	function selectChannel(channel: ChannelValue) {
		if (channel === 'all') {
			activeChannelState.value = 'all';
			uiState.redGain = savedChannelState.redGain;
			uiState.greenGain = savedChannelState.greenGain;
			uiState.blueGain = savedChannelState.blueGain;
			emitApply();
			return;
		}

		if (activeChannelState.value === 'all') {
			rememberCurrentRgb();
		}

		activeChannelState.value = channel;
		uiState.redGain = channel === 'red' ? 200 : 0;
		uiState.greenGain = channel === 'green' ? 200 : 0;
		uiState.blueGain = channel === 'blue' ? 200 : 0;
		emitApply();
	}

	function handleChannelSliderChange() {
		rememberCurrentRgb();
		emitApply();
	}

	function resetAdjustments() {
		syncUiState(props.defaultParams);
		emit('apply', { ...props.defaultParams });
	}
</script>

<style scoped lang="scss">
	.viewer-image-adjust-fade-enter-active,
	.viewer-image-adjust-fade-leave-active {
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	.viewer-image-adjust-fade-enter-from,
	.viewer-image-adjust-fade-leave-to {
		opacity: 0;
		transform: translateY(-6px);
	}

	:deep(.el-slider__runway) {
		height: 6px;
		margin: 10px 0;
		background-color: rgb(226 232 240 / 90%);
	}

	:deep(.el-slider__bar) {
		height: 6px;
		background-color: #4ea8ff;
	}

	:deep(.el-slider__button) {
		width: 18px;
		height: 18px;
		border: 3px solid #4ea8ff;
	}

	:deep(.slider-red .el-slider__bar) {
		background-color: #ef4444;
	}

	:deep(.slider-red .el-slider__button) {
		border-color: #ef4444;
	}

	:deep(.slider-green .el-slider__bar) {
		background-color: #22c55e;
	}

	:deep(.slider-green .el-slider__button) {
		border-color: #22c55e;
	}

	:deep(.slider-blue .el-slider__bar) {
		background-color: #38bdf8;
	}

	:deep(.slider-blue .el-slider__button) {
		border-color: #38bdf8;
	}
</style>
