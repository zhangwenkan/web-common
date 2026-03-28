/**
 * WSI 切片状态管理
 *
 * @description 管理切片查看器参数和状态
 */
import { defineStore } from 'pinia';

interface TileParams {
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

interface WsiState {
	// 当前切片文件 ID
	slideId: string;
	// DZI 元数据接口参数
	dziParams: {
		cname: string;
	};
	// 瓦片查询参数
	tileParams: TileParams;
}

export const useWsiStore = defineStore('wsi', {
	state: (): WsiState => ({
		slideId: '',
		dziParams: {
			cname: 'AI',
		},
		tileParams: {
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
		},
	}),

	getters: {
		// 获取瓦片参数查询字符串
		tileQueryString: (state) => {
			return Object.entries(state.tileParams)
				.map(([key, value]) => `${key}=${value}`)
				.join('&');
		},
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
			this.tileParams = {
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
		},
	},
});
