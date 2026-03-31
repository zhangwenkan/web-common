/** * 404 页面 * * @description 页面不存在时的提示页面 */
<template>
	<div class="error-container">
		<div class="error-content">
			<h1>404</h1>
			<p>页面不存在</p>
			<el-button type="primary" @click="goHome">返回首页</el-button>
		</div>
	</div>
</template>

<script setup lang="ts" name="NotFound">
	import { useRouter } from 'vue-router';

	const router = useRouter();

	const goHome = () => {
		router.push('/');
	};
</script>

<style scoped lang="scss">
	.error-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100vh;
		background: #f5f7fa;
	}

	.error-content {
		text-align: center;

		h1 {
			margin: 0;
			font-size: 120px;
			font-weight: 700;
			color: #409eff;
		}

		p {
			margin: 20px 0 40px;
			font-size: 20px;
			color: #666;
		}
	}
</style>
