/** * 语言切换组件 * * @description 用于切换系统语言 */
<template>
	<el-dropdown @command="handleLanguageChange">
		<el-button type="primary" link>
			<el-icon><Setting /></el-icon>
			<span class="ml-4px">{{ currentLangLabel }}</span>
		</el-button>
		<template #dropdown>
			<el-dropdown-menu>
				<el-dropdown-item command="zh" :disabled="i18n.locale.value === 'zh'">简体中文</el-dropdown-item>
				<el-dropdown-item command="en" :disabled="i18n.locale.value === 'en'">English</el-dropdown-item>
			</el-dropdown-menu>
		</template>
	</el-dropdown>
</template>

<script setup lang="ts" name="LanguageSwitch">
	import { computed } from 'vue';
	import { useI18n } from 'vue-i18n';
	import { Setting } from '@element-plus/icons-vue';
	import { setLocal } from '@/utils/storage';

	const i18n = useI18n();

	const currentLangLabel = computed(() => {
		return i18n.locale.value === 'zh' ? '简体中文' : 'English';
	});

	const handleLanguageChange = (lang: string) => {
		i18n.locale.value = lang;
		setLocal('lang', lang);
		window.location.reload();
	};
</script>

<style scoped lang="scss">
	.ml-4px {
		margin-left: 4px;
	}
</style>
