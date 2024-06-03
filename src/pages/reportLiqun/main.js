import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'dayjs/locale/zh-cn';
import App from './components/app.vue'
import ElMessage from 'element-plus/es/components/message/index'
import ElLoading from 'element-plus/es/components/loading/index';
import "~/styles/index.scss";
import "element-plus/theme-chalk/src/message.scss"
import "element-plus/theme-chalk/src/message-box.scss"

const app = createApp(App);
app.use(ElementPlus, { locale: zhCn})
app.use(ElMessage)
app.mount("#app")

