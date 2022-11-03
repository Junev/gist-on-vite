import { createApp } from 'vue'
import App from './components/App.vue'
import "~/styles/index.scss";
import ElMessage from 'element-plus/es/components/message/index'
import "element-plus/theme-chalk/src/message.scss"

const app = createApp(App);
app.use(ElMessage)
app.mount("#mqttTopicCategory")

