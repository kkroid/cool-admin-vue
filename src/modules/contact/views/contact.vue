<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-flex1 />
			<cl-search ref="Search" @search="onSearch" />
		</cl-row>

		<!-- 水印容器 -->
		<div class="watermark-container">
			<cl-row>
				<cl-table ref="Table" />
			</cl-row>
			<!-- 水印 -->
			<div class="watermark-overlay">
				<div
					v-for="rowIndex in watermarkRows"
					:key="`row-${rowIndex}`"
					class="watermark-row"
				>
					<div
						v-for="colIndex in watermarkCols"
						:key="`col-${colIndex}`"
						class="watermark-text"
						:style="{
							top: `${(rowIndex - 1) * watermarkSpacingY + watermarkOffsetY}px`,
							left: `${(colIndex - 1) * watermarkSpacingX}px`
						}"
					>
						{{ username }}
					</div>
				</div>
			</div>
		</div>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'contact-info'
});

import { ref, onMounted, nextTick, watch } from 'vue';
import { useCrud, useTable, useSearch } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { service } = useCool();
const { t } = useI18n();

// 从 localStorage 获取用户名
const username = (localStorage.getItem('username') || '匿名用户').replace(/['"]/g, ''); // 去掉引号

// 水印相关数据
const watermarkRows = ref<number>(0);
const watermarkCols = ref<number>(0);
const watermarkSpacingX = 250; // 水印水平间距
const watermarkSpacingY = 150; // 水印垂直间距
const watermarkOffsetY = 50; // 水印整体向下偏移，避免遮住表头

function calculateWatermark() {
	const container = document.querySelector('.watermark-container');
	if (container) {
		const containerWidth = container.clientWidth;
		const containerHeight = container.clientHeight;
		watermarkRows.value = Math.ceil(containerHeight / watermarkSpacingY);
		watermarkCols.value = Math.ceil(containerWidth / watermarkSpacingX);
	}
}

// cl-table
const Table = useTable({
	columns: [
		{ label: t('姓名'), prop: 'name', minWidth: 140 },
		{ label: t('公司'), prop: 'company', minWidth: 140 },
		{ label: t('职位'), prop: 'position', minWidth: 140 },
		{ label: t('电话'), prop: 'phone', minWidth: 140 },
		{ label: t('邮箱'), prop: 'email', minWidth: 140 },
		{
			label: t('其他信息'),
			prop: 'misc',
			showOverflowTooltip: true,
			minWidth: 200,
			component: { name: 'misc-render' }
		},
		{ label: t('路径'), prop: 'path', minWidth: 140 },
		{ label: t('备注'), prop: 'remark', showOverflowTooltip: true, minWidth: 200 },
		{
			label: t('更新时间'),
			prop: 'updateTime',
			minWidth: 170,
			sortable: 'custom',
			component: { name: 'cl-date-text' }
		}
	]
});

// cl-search
const Search = useSearch({
	items: [
		{
			prop: 'search',
			label: '关键字',
			component: {
				name: 'el-input',
				props: {
					placeholder: '请输入关键字，按空格隔开'
				}
			}
		}
	]
});

// cl-crud
const Crud = useCrud(
	{
		service: service.contact.info
	},
	app => {
		refresh();
	}
);

function onSearch(params: any) {
	if (!params) {
		return;
	}
	Crud.value?.refresh(params).then(() => {
		nextTick(() => {
			calculateWatermark();
		});
	});
}

// 刷新
function refresh(params?: any) {
	if (!params) {
		return;
	}
	Crud.value?.refresh(params).then(() => {
		nextTick(() => {
			calculateWatermark();
		});
	});
}

// 页面挂载后和窗口变化时都重新计算
onMounted(() => {
	nextTick(() => {
		calculateWatermark();
		window.addEventListener('resize', calculateWatermark);
	});
});

// 监听表格数据变化，数据变化后重新计算水印
watch(
	() => Table.value?.Table?.data?.length,
	() => {
		nextTick(() => {
			calculateWatermark();
		});
	}
);
</script>

<style scoped>
.watermark-container {
	position: relative;
}

.watermark-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	overflow: hidden;
	z-index: 10;
}

.watermark-text {
	position: absolute;
	color: rgba(0, 0, 0, 0.1);
	font-size: 56px; /* 更大字体 */
	transform: rotate(-30deg);
	white-space: nowrap;
	user-select: none;
	pointer-events: none;
}
</style>
