/**
 * 用户状态管理
 *
 * @description 管理用户信息
 */
import { defineStore } from 'pinia';

interface UserInfo {
	id: number;
	username: string;
	name: string;
	avatar: string;
	roles: string[];
}

interface UserState {
	userInfo: UserInfo | null;
}

export const useUserStore = defineStore('user', {
	state: (): UserState => ({
		userInfo: null,
	}),

	getters: {
		username: (state) => state.userInfo?.username || '',
		roles: (state) => state.userInfo?.roles || [],
	},

	actions: {
		/**
		 * 设置用户信息
		 */
		setUserInfo(userInfo: UserInfo) {
			this.userInfo = userInfo;
		},

		/**
		 * 清除用户信息
		 */
		clearUserInfo() {
			this.userInfo = null;
		},
	},
});
