/**
 * 国际化配置
 *
 * @description 基于 vue-i18n 的多语言支持
 */
import { createI18n } from 'vue-i18n';
import zh from './lang/zh';
import en from './lang/en';
import { getLocal } from '@/utils/storage';

const i18n = createI18n({
	legacy: false,
	locale: getLocal<string>('lang') || 'zh',
	messages: {
		zh,
		en,
	},
});

export default i18n;
