/**
 * 路由配置
 *
 * @description 路由定义
 */
import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: () => import('@/views/home/index.vue'),
		meta: {
			title: '首页',
		},
	},
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: () => import('@/views/error/404.vue'),
		meta: {
			title: '页面不存在',
		},
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

/**
 * 路由守卫
 */
router.beforeEach((to, _from, next) => {
	document.title = (to.meta.title as string) || 'Web Wsi';
	next();
});

export default router;
