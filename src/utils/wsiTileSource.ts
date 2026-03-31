import type { TileParams } from '@/store/modules/wsi';

export interface DziMetadata {
	width: number;
	height: number;
	tileSize: number;
	overlap: number;
	format: string;
	minLevel: number;
	maxLevel: number;
}

export function parseDziMetadata(dziXml: string): DziMetadata {
	const parser = new DOMParser();
	const xml = parser.parseFromString(dziXml, 'text/xml');
	const imageElement = xml.getElementsByTagName('Image')[0];
	const sizeElement = xml.getElementsByTagName('Size')[0];

	if (!imageElement || !sizeElement) {
		throw new Error('DZI 元数据解析失败');
	}

	const width = Number.parseInt(sizeElement.getAttribute('Width') || '0', 10);
	const height = Number.parseInt(sizeElement.getAttribute('Height') || '0', 10);
	const tileSize = Number.parseInt(imageElement.getAttribute('TileSize') || '256', 10);
	const overlap = Number.parseInt(imageElement.getAttribute('Overlap') || '0', 10);
	const format = imageElement.getAttribute('Format') || 'jpg';

	if (!width || !height) {
		throw new Error('DZI 元数据缺少图像尺寸');
	}

	return {
		width,
		height,
		tileSize,
		overlap,
		format,
		minLevel: 0,
		maxLevel: Math.ceil(Math.log2(Math.max(width, height))),
	};
}

export function buildTileRequestQuery(cname: string | undefined, tileParams: TileParams): string {
	const query = new URLSearchParams();

	if (cname) {
		query.set('cname', cname);
	}

	for (const [key, value] of Object.entries(tileParams)) {
		query.set(key, String(value));
	}

	return query.toString();
}

export function buildWsiTileSource(slideId: string, dziMetadata: DziMetadata, cname: string | undefined, tileParams: TileParams) {
	const query = buildTileRequestQuery(cname, tileParams);

	return {
		width: dziMetadata.width,
		height: dziMetadata.height,
		tileSize: dziMetadata.tileSize,
		overlap: dziMetadata.overlap,
		tileOverlap: dziMetadata.overlap,
		minLevel: dziMetadata.minLevel,
		maxLevel: dziMetadata.maxLevel,
		getTileUrl(level: number, x: number, y: number) {
			return `/wsi/api/dzi/${slideId}_files/${level}/${x}_${y}.${dziMetadata.format}?${query}`;
		},
	};
}
