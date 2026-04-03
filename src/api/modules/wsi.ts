/**
 * WSI 切片相关 API
 */
import http from '@/api';
export interface SlideInfoRequest {
	sliceId: string;
	cname?: string;
}

export interface SlideInfoResponse {
	[key: string]: unknown;
}

export interface SlideListRequest {
	cname?: string;
	fileId?: string;
	sliceId?: string;
	source?: number;
	sort?: string;
	order?: string;
	analResCode?: string;
}

export interface SlideListResponse {
	[key: string]: unknown;
}

/**
 * 获取 DZI 元数据
 * @param slideId 切片文件 ID
 * @param params 查询参数
 */
export function getDziMetadata(fileId: string, params?: { cname?: string }) {
	return http.service.get<string>(`/wsi/api/dzi/${fileId}.dzi`, {
		params,
		responseType: 'text',
		headers: { noLoading: true },
	});
}

/**
 * 获取右上角切片信息
 */
export function getSlideInfo(params: SlideInfoRequest) {
	return http.get<SlideInfoResponse>('/wsi/api/ambitus/slideInfo', params, {
		headers: { noLoading: true },
	});
}

/**
 * 获取左侧切片列表
 */
export function getSlideList(params: SlideListRequest) {
	return http.get<SlideListResponse>('/wsi/api/ambitus/slideList', params, {
		headers: { noLoading: true },
	});
}
