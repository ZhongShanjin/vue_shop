import { createApp } from 'vue'
import App from './App.vue'
//导入element-plus
import eleMent from './plugins/element.js'
// 导入路由模块
import router from './router'
//app.vue样式
import './app.css'
// 导入全局样式
import './assets/css/global.css'
//axios模块
import axios from 'axios'

const app = createApp(App)

//路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//axios请求拦截
axios.interceptors.request.use((config) => {
  //请求头对象添加token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
//全局挂载
app.config.globalProperties.$http = axios
// 挂载路由模块
app.use(router)
//element-plus
app.use(eleMent.ElButton)
app.use(eleMent.ElForm)
app.use(eleMent.ElInput)
app.use(eleMent.ElFormItem)
app.use(eleMent.ElHeader)
app.use(eleMent.ElAside)
app.use(eleMent.ElMain)
app.use(eleMent.ElContainer)
app.use(eleMent.ElMenu)
app.use(eleMent.ElSubMenu)
app.use(eleMent.ElMenuItem)
app.use(eleMent.ElIcon)
app.use(eleMent.ElBreadcrumb)
app.use(eleMent.ElBreadcrumbItem)
app.use(eleMent.ElCard)
app.use(eleMent.ElRow)
app.use(eleMent.ElCol)
app.use(eleMent.ElTable)
app.use(eleMent.ElTableColumn)
app.use(eleMent.ElSwitch)
app.use(eleMent.ElTooltip)
app.use(eleMent.ElPagination)
app.use(eleMent.ElDialog)
app.use(eleMent.ElTag)
app.use(eleMent.ElTree)
app.use(eleMent.ElSelect)
app.use(eleMent.ElOption)
app.config.globalProperties.$message = eleMent.ElMessage
app.config.globalProperties.$confirm = eleMent.ElMessageBox
//添加icon-vue组件
for (const [key, component] of Object.entries(eleMent.ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')
