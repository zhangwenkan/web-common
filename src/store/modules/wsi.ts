/**
 * WSI 切片状态管理
 *
 * @description 管理切片查看器参数和状态
 */
import { defineStore } from 'pinia';

const MAX_MAGNIFICATION_RATIO = 4;
const DEFAULT_SCAN_MAGNIFICATION = 20;

export interface TileParams {
	brightness: number;
	contrast: number;
	gamma: number;
	sharpen: number;
	redGain: number;
	greenGain: number;
	blueGain: number;
	colorStyle: number;
	hue: number;
	saturation: number;
}

export const DEFAULT_TILE_PARAMS: TileParams = {
	brightness: 0,
	contrast: 1,
	gamma: 1,
	sharpen: 0,
	redGain: 1,
	greenGain: 1,
	blueGain: 1,
	colorStyle: 0,
	hue: 0,
	saturation: 1,
};

interface WsiState {
	// 当前切片文件 ID
	slideId: string;
	// DZI 元数据接口参数
	dziParams: {
		cname: string;
	};
	// 瓦片查询参数
	tileParams: TileParams;
	// 扫描倍率
	scanMagnification: number;
	// 当前显示倍率
	currentMagnification: number;
	// 最大允许倍率
	maxMagnification: number;
	// 全图完整显示对应倍率
	fitMagnification: number;
}

export const useWsiStore = defineStore('wsi', {
	state: (): WsiState => ({
		slideId: '01KMCRDD4RG9E6JMA6R4X0SCXJ1',
		dziParams: {
			cname: 'AI',
		},
		tileParams: { ...DEFAULT_TILE_PARAMS },
		scanMagnification: DEFAULT_SCAN_MAGNIFICATION,
		currentMagnification: 1,
		maxMagnification: DEFAULT_SCAN_MAGNIFICATION * MAX_MAGNIFICATION_RATIO,
		fitMagnification: 1,
	}),

	getters: {
		// 获取瓦片参数查询字符串
		tileQueryString: (state) => {
			return Object.entries(state.tileParams)
				.map(([key, value]) => `${key}=${value}`)
				.join('&');
		},
		// 是否超过扫描倍率
		isOverScanMagnification: (state) => state.currentMagnification > state.scanMagnification,
	},

	actions: {
		/**
		 * 设置切片文件 ID
		 */
		setSlideId(slideId: string) {
			this.slideId = slideId;
		},

		/**
		 * 设置 DZI 参数
		 */
		setDziParams(params: Partial<WsiState['dziParams']>) {
			this.dziParams = { ...this.dziParams, ...params };
		},

		/**
		 * 设置瓦片参数
		 */
		setTileParams(params: Partial<TileParams>) {
			this.tileParams = { ...this.tileParams, ...params };
		},

		/**
		 * 重置瓦片参数为默认值
		 */
		resetTileParams() {
			this.tileParams = { ...DEFAULT_TILE_PARAMS };
		},

		/**
		 * 设置扫描倍率
		 */
		setScanMagnification(magnification: number) {
			this.scanMagnification = magnification;
			this.maxMagnification = magnification * MAX_MAGNIFICATION_RATIO;
		},

		/**
		 * 设置当前倍率
		 */
		setCurrentMagnification(magnification: number) {
			this.currentMagnification = magnification;
		},

		/**
		 * 设置最大允许倍率
		 */
		setMaxMagnification(magnification: number) {
			this.maxMagnification = magnification;
		},

		/**
		 * 设置全图完整显示对应倍率
		 */
		setFitMagnification(magnification: number) {
			this.fitMagnification = magnification;
		},
	},
});
