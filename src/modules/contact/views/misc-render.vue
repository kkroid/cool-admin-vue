<template>
	<div v-if="miscValue">
		<ul style="padding-left: 0; margin: 0; list-style: none">
			<li
				v-for="item in items"
				:key="item"
				style="margin-bottom: 2px; display: flex; align-items: flex-start"
			>
				<span style="color: #333; margin-right: 4px">
					{{ item.split(':')[0] ? item.split(':')[0] + ':' : '' }}
				</span>
				<span style="color: #444">{{ item.split(':')[1] || '' }}</span>
			</li>
		</ul>
	</div>
	<span v-else style="color: #999">-</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ value?: string; row?: any; record?: any }>();

const miscValue = computed(() => {
	return props.value ?? props.row?.misc ?? props.record?.misc ?? '';
});

const items = computed(() => {
	return miscValue.value ? miscValue.value.split('@@@').filter(Boolean) : [];
});
</script>
