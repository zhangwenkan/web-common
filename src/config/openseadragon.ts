/**
 * OpenSeadragon 公共配置
 *
 * @description 所有 OSD 初始化参数集中在此管理，避免写死在业务组件中
 */

/** 查看器默认参数 */
export const OSD_DEFAULT_OPTIONS = {
	// 动画时长（秒）
	animationTime: 0.5,
	// 最大缩放像素比
	maxZoomPixelRatio: 2,
	// 最小缩放级别
	minZoomLevel: 0.5,
	// 视口可见比例，1 表示图像始终填满视口
	visibilityRatio: 1,
	// 拖动时约束图像不超出视口
	constrainDuringPan: true,
	// 图像混合时间（秒），减少瓦片闪烁
	blendTime: 0.1,
	// 图像平滑（双线性插值）
	imageSmoothingEnabled: true,
	// 立即渲染已缓存瓦片，不等待全部加载完
	alwaysBlend: false,
	// 默认显示导航缩略图
	showNavigator: true,
	navigatorPosition: 'TOP_LEFT' as const,
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
	springStiffness: 10,
};

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
