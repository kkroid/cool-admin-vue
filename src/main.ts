import { createApp } from 'vue';
import App from './App.vue';
import { bootstrap } from './cool';
import MiscRender from './modules/contact/views/misc-render.vue';

const app = createApp(App);
app.component('misc-render', MiscRender);

// 启动
bootstrap(app)
	.then(() => {
		app.mount('#app');
	})
	.catch(err => {
		console.error('COOL-ADMIN 启动失败', err);
	});
