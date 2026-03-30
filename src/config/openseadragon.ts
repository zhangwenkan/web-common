/**
 * OpenSeadragon 公共配置
 *
 * @description 所有 OSD 初始化参数集中在此管理，避免写死在业务组件中
 */

export interface OsdMagnificationPreset {
	value: number | 'fit';
	label: string;
	shortcut: '' | 'Q' | 'W' | 'E' | 'R' | 'T' | 'Y';
	title: string;
}

/** 查看器默认参数 */
export const OSD_DEFAULT_OPTIONS = {
	// 动画时长（秒）
	animationTime: 0.8,
	// 最大缩放像素比
	maxZoomPixelRatio: 2,
	// 最小缩放级别
	minZoomLevel: 0.5,
	minZoomImageRatio: 0.1,
	// 视口可见比例，允许一定留白，和参考项目一致
	visibilityRatio: 0.8,
	// 拖动时约束图像不超出视口
	constrainDuringPan: true,
	// 图像混合时间（秒），减少瓦片闪烁
	blendTime: 0.1,
	// 图像平滑（双线性插值）
	imageSmoothingEnabled: true,
	// 立即渲染已缓存瓦片，不等待全部加载完
	alwaysBlend: false,
	gestureSettingsMouse: {
		scrollToZoom: true,
		clickToZoom: true,
		dblClickToZoom: false,
		pinchToZoom: false,
		zoomToRefPoint: true,
		flickEnabled: false,
		flickMinSpeed: 120,
		flickMomentum: 0.25,
		pinchRotate: false,
	},
	gestureSettingsTouch: {
		scrollToZoom: false,
		clickToZoom: false,
		dblClickToZoom: true,
		pinchToZoom: true,
		zoomToRefPoint: true,
		flickEnabled: true,
		flickMinSpeed: 120,
		flickMomentum: 0.25,
		pinchRotate: false,
	},
	gestureSettingsPen: {
		scrollToZoom: false,
		clickToZoom: true,
		dblClickToZoom: false,
		pinchToZoom: false,
		zoomToRefPoint: true,
		flickEnabled: false,
		flickMinSpeed: 120,
		flickMomentum: 0.25,
		pinchRotate: false,
	},
	gestureSettingsUnknown: {
		scrollToZoom: false,
		clickToZoom: false,
		dblClickToZoom: true,
		pinchToZoom: true,
		zoomToRefPoint: true,
		flickEnabled: true,
		flickMinSpeed: 120,
		flickMomentum: 0.25,
		pinchRotate: false,
	},
	// 默认显示导航缩略图
	showNavigator: true,
	navigatorAutoFade: false,
	navigatorPosition: 'ABSOLUTE' as const,
	navigatorLeft: '20px',
	navigatorTop: '20px',
	navigatorWidth: '150px',
	navigatorHeight: '150px',
	navigatorBackground: '#ffffff',
	navigatorBorderColor: '#25b0e5',
	navigatorDisplayRegionColor: '#ff0000',
	navigatorAutoResize: false,
	navigatorMaintainSizeRatio: true,
	navigatorMinPixelRatio: 0.2,
	// 隐藏默认控件
	showZoomControl: false,
	showHomeControl: false,
	showFullPageControl: false,
	showRotationControl: false,
	// 鼠标滚轮缩放
	zoomPerScroll: 1.3,
	// 按钮点击缩放倍率
	zoomPerClick: 1.0,
	// 惯性拖动（弹动效果），关闭后移动更直接
	springStiffness: 6,
};

export const OSD_MAGNIFICATION_PRESETS: readonly OsdMagnificationPreset[] = [
	{ value: 'fit', label: '1:1', shortcut: 'Y', title: '适配屏幕 (Y)' },
	{ value: 40, label: '40', shortcut: 'T', title: '40x (T)' },
	{ value: 20, label: '20', shortcut: 'R', title: '20x (R)' },
	{ value: 10, label: '10', shortcut: 'E', title: '10x (E)' },
	{ value: 4, label: '4', shortcut: 'W', title: '4x (W)' },
	{ value: 2, label: '2', shortcut: 'Q', title: '2x (Q)' },
	{ value: 1, label: '1', shortcut: '', title: '1x' },
] as const;

export const OSD_MAGNIFICATION_TOLERANCE = 0.15;

export const OSD_MIN_ZOOM_IMAGE_RATIO = 0.1;

export const OSD_ZOOM_ANIMATION = {
	clampImmediate: true,
} as const;

export const OSD_NAVIGATOR_STYLE = {
	top: 20,
	left: 20,
	maxEdge: 150,
	borderRadius: 4,
	boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
	borderColor: '#25b0e5',
	backgroundColor: '#ffffff',
	displayRegionColor: '#ff0000',
	displayRegionFill: 'rgba(255, 255, 255, 0.18)',
	displayRegionBorderWidth: 1,
	crosshairColor: '#ff0000',
	crosshairWidth: 1,
} as const;

/** 瓦片源默认参数 */
export const OSD_TILE_SOURCE_DEFAULTS = {
	// 最少同时请求的瓦片数
	minLevel: 0,
};

/** 瓦片请求并发上限（控制同时发出的 HTTP 请求数，减少服务器压力） */
export const OSD_MAX_IMAGE_CACHE_COUNT = 200;

/** 同时进行的瓦片下载线程数上限 */
export const OSD_IMAGE_LOADER_LIMIT = 6;

/** 瓦片加载超时（毫秒） */
export const OSD_TILE_LOAD_TIMEOUT = 15000;
