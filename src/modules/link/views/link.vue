<template>
	<cl-crud ref="Crud">
		<div class="iframe-container" ref="containerRef">
			<iframe
				:src="iframeSrc"
				width="100%"
				height="100%"
				frameborder="0"
				scrolling="no"
				style="border: 0px solid #ddd; margin: 0; padding: 0; overflow: hidden"
			>
			</iframe>

			<!-- 遮挡层 -->
			<div
				v-if="coverConfig.coverx > 0"
				class="cover-overlay cover-left"
				:style="leftCoverStyle"
			></div>
			<div
				v-if="coverConfig.coverx > 0"
				class="cover-overlay cover-right"
				:style="rightCoverStyle"
			></div>
			<div
				v-if="coverConfig.covery > 0"
				class="cover-overlay cover-top"
				:style="topCoverStyle"
			></div>
			<div
				v-if="coverConfig.covery > 0"
				class="cover-overlay cover-bottom"
				:style="bottomCoverStyle"
			></div>
		</div>
	</cl-crud>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useCrud } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

defineOptions({
	name: 'external-link'
});

const { service } = useCool();
const { t } = useI18n();

// cl-crud 配置
const Crud = useCrud(
	{
		service: service.link.link.getLink
	},
	app => {
		refresh();
	}
);

// 刷新
function refresh(params?: any) {
	console.log('Refreshing with params:', params);
	Crud.value?.refresh(params);
}

const route = useRoute();
const iframeSrc = ref('');
const containerRef = ref<HTMLElement>();

// 遮挡配置
const coverConfig = ref({
	coverx: 0, // X轴遮挡百分比 (左右各遮挡一半)
	covery: 0 // Y轴遮挡百分比 (上下各遮挡一半)
});

// 容器尺寸
const containerSize = ref({
	width: 0,
	height: 0
});

// 监听窗口大小变化
const resizeObserver = ref<ResizeObserver>();

// 计算遮挡层样式
const leftCoverStyle = computed(() => {
	const coverWidth = coverConfig.value.coverx / 2; // 左边遮挡一半
	return {
		left: '0',
		top: '0',
		width: `${coverWidth}%`,
		height: '100%',
		backgroundColor: '#fafafa', // 调试用半透明，后续改为 'white'
		zIndex: 10
	};
});

const rightCoverStyle = computed(() => {
	const coverWidth = coverConfig.value.coverx / 2; // 右边遮挡一半
	return {
		right: '0',
		top: '0',
		width: `${coverWidth}%`,
		height: '100%',
		backgroundColor: '#fafafa', // 调试用半透明，后续改为 'white'
		zIndex: 10
	};
});

const topCoverStyle = computed(() => {
	const coverHeight = coverConfig.value.covery / 2; // 上边遮挡一半
	return {
		left: '0',
		top: '0',
		width: '100%',
		height: `${coverHeight}%`,
		backgroundColor: '#fafafa', // 调试用半透明，后续改为 'white'
		zIndex: 10
	};
});

const bottomCoverStyle = computed(() => {
	const coverHeight = coverConfig.value.covery / 2; // 下边遮挡一半
	return {
		left: '0',
		bottom: '0',
		width: '100%',
		height: `${coverHeight}%`,
		backgroundColor: '#fafafa', // 调试用半透明，后续改为 'white'
		zIndex: 10
	};
});

// 解析 URL 参数
function parseUrlParams() {
	const coverx = parseFloat(route.query.coverx as string) || 0;
	const covery = parseFloat(route.query.covery as string) || 0;

	// 限制范围在 0-100 之间
	coverConfig.value.coverx = Math.max(0, Math.min(100, coverx));
	coverConfig.value.covery = Math.max(0, Math.min(100, covery));

	console.log('Cover config:', coverConfig.value);
}

// 更新容器尺寸
function updateContainerSize() {
	if (containerRef.value) {
		containerSize.value.width = containerRef.value.clientWidth;
		containerSize.value.height = containerRef.value.clientHeight;
		console.log('Container size updated:', containerSize.value);
	}
}

// 设置 ResizeObserver
function setupResizeObserver() {
	if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
		resizeObserver.value = new ResizeObserver(entries => {
			for (const entry of entries) {
				containerSize.value.width = entry.contentRect.width;
				containerSize.value.height = entry.contentRect.height;
				console.log('Container resized:', containerSize.value);
				// 强制 iframe 重新适配尺寸
				enforceIframeSize();
			}
		});

		resizeObserver.value.observe(containerRef.value);
	}
}

// 强制 iframe 尺寸与容器一致
function enforceIframeSize() {
	const iframe = containerRef.value?.querySelector('iframe');
	if (iframe && containerRef.value) {
		const { width, height } = containerRef.value.getBoundingClientRect();
		iframe.style.width = `${width}px`;
		iframe.style.height = `${height}px`;
		iframe.style.minWidth = `${width}px`;
		iframe.style.minHeight = `${height}px`;
		iframe.style.maxWidth = `${width}px`;
		iframe.style.maxHeight = `${height}px`;
	}
}

// 清理 ResizeObserver
function cleanupResizeObserver() {
	if (resizeObserver.value) {
		resizeObserver.value.disconnect();
		resizeObserver.value = undefined;
	}
}

onMounted(async () => {
	// 从 URL 参数中获取 src
	iframeSrc.value = (route.query.content as string) || 'https://www.baidu.com';
	console.log('iframeSrc:', iframeSrc.value);

	// 解析遮挡参数
	parseUrlParams();

	// 等待 DOM 更新
	await nextTick();

	// 初始化容器尺寸监听
	updateContainerSize();
	setupResizeObserver();

	// 强制 iframe 尺寸
	setTimeout(() => {
		enforceIframeSize();
	}, 100);

	// 监听窗口大小变化（备用方案）
	window.addEventListener('resize', () => {
		updateContainerSize();
		setTimeout(enforceIframeSize, 100);
	});
});

onUnmounted(() => {
	cleanupResizeObserver();
	window.removeEventListener('resize', updateContainerSize);
});
</script>

<style scoped>
.iframe-container {
	width: 100%;
	height: 100%;
	position: relative;
	overflow: hidden; /* 强制裁剪超出部分 */
	box-sizing: border-box;
}

.iframe-container iframe {
	position: absolute;
	top: 0;
	left: 0;
	width: 100% !important;
	height: 100% !important;
	overflow: hidden !important; /* 禁止iframe内部滚动 */
	box-sizing: border-box;
	/* 防止iframe内容超出边界 */
	clip-path: inset(0);
}

.cover-overlay {
	position: absolute;
	pointer-events: none; /* 允许点击穿透到 iframe */
	user-select: none;
	box-sizing: border-box;
}

/* 强制禁用iframe滚动的额外样式 */
.iframe-container :deep(iframe) {
	scrolling: no !important;
	overflow: hidden !important;
	pointer-events: auto;
}

/* 隐藏iframe内部的滚动条 */
.iframe-container :deep(iframe html) {
	overflow: hidden !important;
	height: 100% !important;
}

.iframe-container :deep(iframe body) {
	overflow: hidden !important;
	margin: 0 !important;
	padding: 0 !important;
	height: 100% !important;
}

/* 广告屏蔽样式 */
.iframe-container :deep([class*='ad']),
.iframe-container :deep([id*='ad']),
.iframe-container :deep([class*='banner']),
.iframe-container :deep([class*='popup']) {
	display: none !important;
}
</style>
