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

/**
 * 获取 DZI 元数据
 * @param slideId 切片文件 ID
 * @param params 查询参数
 */
export function getDziMetadata(slideId: string, params?: { cname?: string }) {
	return http.service.get<string>(`/wsi/api/dzi/${slideId}.dzi`, {
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
