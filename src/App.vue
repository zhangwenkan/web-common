<template>
	<el-config-provider :locale="elementLocale">
		<router-view></router-view>
	</el-config-provider>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import { useI18n } from 'vue-i18n';
	import zhCn from 'element-plus/es/locale/lang/zh-cn';
	import en from 'element-plus/es/locale/lang/en';

	const i18n = useI18n();

	const elementLocale = computed(() => {
		return i18n.locale.value === 'zh' ? zhCn : en;
	});
</script>
