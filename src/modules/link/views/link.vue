<template>
	<cl-crud ref="Crud">
		<div class="iframe-container">
			<iframe
				:src="iframeSrc"
				width="100%"
				height="100%"
				frameborder="0"
				style="border: 0px solid #ddd; margin-top: 0px"
			>
			</iframe>
		</div>
	</cl-crud>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCrud, useTable, useSearch } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

defineOptions({
	name: 'external-link'
});

const { service } = useCool();
const { t } = useI18n();

console.log('External link view initialized:', service);
// service.base.open.eps().then(data => {
// 	console.log('EPS updated:', data);
// 	location.reload();
// });
// console.log('Service EPS:', service);

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
	// 打印服务器返回结果
	console.log('Refreshing with params:', params);
	Crud.value?.refresh(params);
}

const route = useRoute();
const iframeSrc = ref('');

onMounted(() => {
	// 从 URL 参数中获取 src
	iframeSrc.value = (route.query.content as string) || 'https://www.baidu.com';
	console.log('iframeSrc:', iframeSrc.value);
	if (!iframeSrc.value) {
		console.error('No src provided in the URL query parameters.');
	}
});
</script>

<style scoped>
.iframe-container {
	width: 100%;
	height: 100%;
	position: relative;
}

/* 隐藏常见的广告元素 */
.iframe-container ::deep iframe {
	/* 阻止弹窗 */
	pointer-events: auto;
}

/* 如果需要更强的广告屏蔽，可以考虑以下CSS */
.iframe-container ::deep [class*='ad'],
.iframe-container ::deep [id*='ad'],
.iframe-container ::deep [class*='banner'],
.iframe-container ::deep [class*='popup'] {
	display: none !important;
}
</style>
