import { createApp } from 'vue';
import App from './App.vue';
//导入element-plus
import eleMent from './plugins/element.js';
// 导入路由模块
import router from './router';
//app.vue样式
import './app.css';
// 导入全局样式
import './assets/css/global.css';
//axios模块
import axios from 'axios';

const app = createApp(App);

//路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
//全局挂载
app.config.globalProperties.$http = axios;
// 挂载路由模块
app.use(router);
//element-plus
app.use(eleMent.ElButton);
app.use(eleMent.ElForm);
app.use(eleMent.ElInput);
app.use(eleMent.ElFormItem);
app.config.globalProperties.$message = eleMent.ElMessage;
//添加icon-vue组件
for (const [key, component] of Object.entries(eleMent.ElementPlusIconsVue)) {
    app.component(key, component);
}
app.mount('#app');
