/** * 默认布局组件 * * 功能说明： * - 作为应用的基础布局容器 * - 配合 vite-plugin-vue-meta-layouts 使用 * - 可通过路由
meta.layout 指定使用的布局 * * 使用示例： * // 路由配置 * { * path: '/dashboard', * component: () =>
import('@/views/dashboard.vue'), * meta: { layout: 'index' } // 使用此布局 * } * * 扩展建议： * - 可添加
Header、Sidebar、Footer 等布局组件 * - 可添加布局切换逻辑（如侧边栏折叠） */
<template>
	<div class="layout">
		<!-- 路由视图出口 -->
		<router-view />
	</div>
</template>

<script setup lang="ts">
	defineOptions({
		name: 'LayoutIndex',
	});
</script>

<style scoped lang="scss">
	.layout {
		width: 100%;
		height: 100%;
	}
</style>
