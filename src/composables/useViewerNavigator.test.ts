import { describe, expect, it } from 'vitest';
import { getNavigatorSize } from '@/composables/useViewerNavigator';

describe('getNavigatorSize', () => {
	it('uses max edge as width for landscape slides', () => {
		expect(getNavigatorSize(4000, 2000)).toEqual({
			width: 150,
			height: 75,
		});
	});

	it('uses max edge as height for portrait slides', () => {
		expect(getNavigatorSize(1200, 3600)).toEqual({
			width: 50,
			height: 150,
		});
	});

	it('falls back to a square when image size is unavailable', () => {
		expect(getNavigatorSize(0, 0)).toEqual({
			width: 150,
			height: 150,
		});
	});
});
