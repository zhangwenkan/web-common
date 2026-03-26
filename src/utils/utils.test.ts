import { describe, expect, it } from 'vitest';
import { formatDateTime } from '@/utils/utils';

describe('formatDateTime', () => {
	it('formats timestamp into ISO-like local string', () => {
		const result = formatDateTime(new Date('2024-01-02T03:04:05.000Z'));

		expect(result).toBe('2024-01-02 03:04:05');
	});
});
