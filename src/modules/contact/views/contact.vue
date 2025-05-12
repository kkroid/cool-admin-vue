<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-flex1 />
			<cl-search ref="Search" @search="onSearch" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

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

import { useCrud, useTable, useSearch } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { service } = useCool();
const { t } = useI18n();

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
		// 刷新后打印当前表格数据
		// nextTick(() => {
		// 	console.log('搜索结果:', Table.value?.Table?.data);
		// });
	});
}

// 刷新
function refresh(params?: any) {
	if (!params) {
		return;
	}
	Crud.value?.refresh(params);
}
</script>
