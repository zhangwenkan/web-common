/**
 * WSI 切片相关 API
 */
import http from '@/api';

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
