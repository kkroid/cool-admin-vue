<template>
	<div class="feishu-auth-wrapper">
		<div class="header">
			<p class="title">飞书登录</p>
		</div>

		<!-- 加载状态 -->
		<div v-if="status === 'loading'" class="auth-loading">
			<div class="spinner"></div>
			<p>正在连接飞书账号...</p>
		</div>

		<!-- 成功状态 -->
		<div v-else-if="status === 'success'" class="auth-success">
			<img :src="userInfo.avatar" class="user-avatar" v-if="userInfo.avatar" />
			<h3>{{ userInfo.name }}</h3>
			<p class="desc">登录成功</p>
		</div>

		<!-- 错误状态 -->
		<div v-else-if="status === 'error'" class="auth-error">
			<p class="error-message">{{ error }}</p>
			<button @click="retry" class="retry-btn">重试</button>
		</div>
		<!-- 调试信息独立显示 -->
		<pre v-if="showDebugInfo" class="debug-info">{{ debugInfo }}</pre>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useCool } from '/@/cool';
import { useBase } from '/$/base';
import { storage } from '/@/cool/utils';

type AuthStatus = 'init' | 'loading' | 'success' | 'error';
const showDebugInfo = false;

interface UserInfo {
	name: string;
	avatar?: string;
	email?: string;
}

declare global {
	interface Window {
		h5sdk?: { ready: (callback: () => void) => void };
		tt?: {
			requestAccess: (options: {
				appID: string;
				scopeList: string[];
				success: (res: { code: string }) => void;
				fail: (err: { errno: number; errString: string }) => void;
			}) => void;
		};
	}
}

export default defineComponent({
	name: 'feishu-auth',
	setup() {
		const status = ref<AuthStatus>('init');
		const userInfo = ref<UserInfo>({ name: '' });
		const error = ref<string>('');
		const debugInfo = ref<string>('');

		const { service, router } = useCool();
		const { user, app } = useBase();

		const loadSDK = (): Promise<void> => {
			return new Promise((resolve, reject) => {
				if (window.h5sdk && window.tt) {
					resolve();
					return;
				}
				const script = document.createElement('script');
				script.src = 'https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.26.js';
				script.async = true;
				script.onload = () => resolve();
				script.onerror = () => reject(new Error('加载飞书SDK失败'));
				document.head.appendChild(script);
			});
		};

		const getAuthCode = (): Promise<string> => {
			return new Promise((resolve, reject) => {
				if (!window.h5sdk || !window.tt) {
					reject(new Error('请在飞书客户端内打开'));
					return;
				}
				window.h5sdk.ready(() => {
					window.tt?.requestAccess({
						appID: import.meta.env.VITE_APP_ID,
						scopeList: [],
						success: res => resolve(res.code),
						fail: err => {
							debugInfo.value += '获取授权失败: ' + JSON.stringify(err, null, 2);
							reject(new Error(err.errString || `授权失败(错误码: ${err.errno})`));
						}
					});
				});
			});
		};

		const authenticate = async () => {
			try {
				status.value = 'loading';
				error.value = '';
				await loadSDK();
				const code = await getAuthCode();
				debugInfo.value += '\n获取到的授权码: ' + code;
				// 先获取完整的登录响应
				const result = await service.base.open.feishuLogin({ code });
				// 手动设置 token
				user.setToken(result);
				// 触发 token 事件
				await Promise.all(app.events.hasToken.map(e => e()));
				// 打印完整的用户信息用于调试
				debugInfo.value += '\n登录成功:' + JSON.stringify(result, null, 2);
				storage.set('username', result.username || '匿名用户');
				router.push('/');
				status.value = 'success';
			} catch (err: any) {
				status.value = 'error';
				error.value = err?.message || '认证过程中发生错误';
				debugInfo.value += '\n错误信息: ' + JSON.stringify(err, null, 2);
			}
		};

		const retry = () => {
			authenticate();
		};

		onMounted(() => {
			authenticate();
		});

		return { status, userInfo, error, retry, debugInfo, showDebugInfo };
	}
});
</script>

<style scoped>
.feishu-auth-wrapper {
	max-width: 420px;
	margin: 80px auto;
	padding: 20px;
	text-align: center;
	border: 1px solid #ebebeb;
	border-radius: 6px;
	background: #fff;
	box-shadow: 0 0 6px rgba(0, 0, 0, 0.08);
}

.header .title {
	font-size: 22px;
	font-weight: 600;
	margin-bottom: 16px;
}

.auth-loading,
.auth-success,
.auth-error {
	margin: 20px 0;
}

.user-avatar {
	width: 72px;
	height: 72px;
	border-radius: 50%;
	margin-bottom: 15px;
}

.desc {
	color: #666;
	margin-top: 8px;
}

.spinner {
	border: 3px solid rgba(0, 0, 0, 0.1);
	border-top-color: #409eff;
	border-radius: 50%;
	width: 48px;
	height: 48px;
	animation: spin 1s infinite linear;
	margin: 0 auto 12px;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.error-message {
	color: #f56c6c;
	font-size: 14px;
	margin-bottom: 16px;
}

.retry-btn {
	padding: 6px 14px;
	background: #f56c6c;
	color: #fff;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 14px;
}

.retry-btn:hover {
	opacity: 0.9;
}

.debug-info {
	text-align: left;
	background: #f8f8f8;
	padding: 10px;
	border-radius: 6px;
	margin-top: 16px;
	overflow-x: auto;
	font-size: 13px;
}
</style>
