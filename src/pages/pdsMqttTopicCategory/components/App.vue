<template>
  <div>
    <el-row>
      <el-col :span="8">
        <el-card style="box-sizing: border-box; height: 100vh" body-style="box-sizing: border-box; height: 100%;">
          <div class="page">
            <h3 class="title">
              <span class="iconfont icon-lvzhou_fenzhichangsuo comSTIcon25"></span>
              事件节点
            </h3>
            <div class="sLine"></div>
            <div ref="leftScroll" style="flex: 1 0 auto">
              <el-scrollbar :height="leftTreeHeight">
                <category-tree
                  v-if="leftTreeHeight"
                  v-model:selectedNode="selectedNode"
                  v-model:formDisable="formDisable"
                  v-model:treeForm="treeForm"
                />
              </el-scrollbar>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card style="box-sizing: border-box; height: 100vh" body-style="box-sizing: border-box; height: 100%;">
          <div class="page">
            <h3 class="title">
              <span class="comSTIcon25 iconfont icon-fangzi"></span>
              MQTT主题消息分类配置
            </h3>
            <div class="sLine"></div>
            <div ref="rightScroll" style="flex: 1 0 auto">
              <el-scrollbar :height="rightFormHeight">
                <category-form
                  v-if="rightFormHeight"
                  :selectedNode="selectedNode"
                  :formDisable="formDisable"
                  :treeFormProp="treeForm"
                />
              </el-scrollbar>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import CategoryForm from "./CategoryForm.vue";
import CategoryTree from "./CategoryTree.vue";
export default {
  components: { CategoryTree, CategoryForm },
  data() {
    return {
      leftTreeHeight: 0,
      rightFormHeight: 0,
      selectedNode: {},
      formDisable: {
        parentId: true,
        categoryId: true,
      },
      treeForm: {
        parentId: "",
        categoryId: "",
      },
    };
  },
  mounted() {
    this.leftTreeHeight = this.$refs.leftScroll.getBoundingClientRect().height;
    this.rightFormHeight = this.$refs.rightScroll.getBoundingClientRect().height;
  },
  methods: {
    removeCondition(item) {
      var index = this.treeForm.conditions.indexOf(item);
      if (index !== -1) {
        this.treeForm.conditions.splice(index, 1);
      }
    },
    addCondition() {
      this.treeForm.conditions.push({
        fieldname: "",
        operation: "",
        value: "",
        id: Date.now(),
      });
    },
  },
};
</script>

<style scoped>
.title {
  margin-top: 0;
  margin-bottom: 6px;
}
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
</style>
