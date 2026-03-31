/**
 * 应用入口文件
 *
 * 功能说明：
 * 1. 创建 Vue 应用实例
 * 2. 注册全局插件（路由、状态管理）
 * 3. 导入全局样式和 SVG 图标
 * 4. 挂载应用到 DOM
 */
import router from '@/router';
import pinia from '@/store';
import { createApp } from 'vue';
import App from './App.vue';

// SVG 图标注册（必须在组件使用前导入）
// 这会加载 vite-plugin-svg-icons 生成的 SVG Sprite
import 'virtual:svg-icons-register';

// 全局样式（包含 Tailwind CSS、Element Plus 样式覆盖等）
import '@/styles/index.scss';

// 创建 Vue 应用实例
const app = createApp(App);

// 注册路由插件
app.use(router);

// 注册状态管理插件（Pinia）
app.use(pinia);

// 挂载应用到 #app 元素
app.mount('#app');
