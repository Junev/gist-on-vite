import { createApp } from "vue";
import App from "./components/App.vue";
import "~/styles/index.scss";
import "element-plus/theme-chalk/src/message.scss"
import 'uno.css'

const app = createApp(App);
app.mount("#app");