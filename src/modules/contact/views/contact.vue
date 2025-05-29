<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-flex1 />
			<cl-search
				ref="Search"
				@search="onSearch"
				@keyup.enter="() => onSearch(Search.Form.form)"
			/>
		</cl-row>

		<!-- 水印容器 -->
		<div class="watermark-container">
			<!-- 表格可滚动区域：高度由tableMaxHeight计算决定 -->
			<div class="table-scrollable" :style="{ maxHeight: tableMaxHeight + 'px' }">
				<cl-table ref="Table" />
			</div>
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

		<!-- 分页单独放置 -->
		<div class="pagination-area">
			<cl-pagination />
		</div>
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

// 表格最大高度
const tableMaxHeight = ref(600); // 初始高度，可随意指定

function updateTableHeight() {
	// 设一个大概思路：获取 window.innerHeight - 头部搜索区域的占用 - 分页和其他UI的占用
	// 实际项目中，可根据页面布局动态计算
	const headerHeight = 100; // 顶部搜索/操作区占用
	const footerHeight = 100; // 分页/底部区域占用
	const padding = 20; // 上下内边距或间隙等

	const availableHeight = window.innerHeight - headerHeight - footerHeight - padding;
	tableMaxHeight.value = availableHeight > 200 ? availableHeight : 200; // 给个最小值，避免太小
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
		console.warn('Search params is empty');
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
		updateTableHeight();
		window.addEventListener('resize', calculateWatermark);
		window.addEventListener('resize', updateTableHeight);
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

/* 让表格区域可滚动，防止撑开页面 */
.table-scrollable {
	overflow-y: auto;
	margin-top: 12px;
	border: 1px solid #ebebeb; /* 仅作示例 */

	/* 隐藏滚动条 - 兼容多种浏览器 */
	/* Webkit browsers (Chrome, Safari, Edge) */
	&::-webkit-scrollbar {
		display: none;
	}

	/* Firefox */
	scrollbar-width: none;

	/* IE 10+ */
	-ms-overflow-style: none;
}

/* 全局隐藏所有滚动条 - 如果需要的话可以取消注释 */
:global(*) {
	&::-webkit-scrollbar {
		display: none;
	}
	scrollbar-width: none;
	-ms-overflow-style: none;
}

/* 水印样式保持不变 */
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

/* 分页区域可以独立一行，避免被挤压 */
.pagination-area {
	margin-top: 12px;
	border-top: 1px solid #ebebeb; /* 仅作示例 */
	padding-top: 10px;
	text-align: right;
}
</style>
