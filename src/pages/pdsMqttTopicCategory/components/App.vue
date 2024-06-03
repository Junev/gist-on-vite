<template>
  <Layout8t16>
    <template #leftTitle>
      <span class="iconfont icon-lvzhou_fenzhichangsuo comSTIcon25"></span>
      事件节点
    </template>
    <template #leftContent>
      <!-- <category-tree
        v-model:selectedNode="selectedNode"
        v-model:formDisable="formDisable"
        v-model:treeForm="treeForm"
      /> -->
    </template>

    <template #rightTitle>
      <span class="comSTIcon25 iconfont icon-fangzi"></span>
      MQTT主题消息分类配置
    </template>
    <template #rightContent>
      <category-form :selectedNode="selectedNode" :formDisable="formDisable" :treeFormProp="treeForm" />
    </template>
  </Layout8t16>
</template>
<script>
import Layout8t16 from "~/components/layouts/Layout8t16.vue";
import CategoryForm from "./CategoryForm.vue";
import CategoryTree from "./CategoryTree.vue";
export default {
  components: { Layout8t16, CategoryTree, CategoryForm },
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
  // mounted() {
  //   this.leftTreeHeight = this.$refs.leftScroll.getBoundingClientRect().height;
  //   this.rightFormHeight = this.$refs.rightScroll.getBoundingClientRect().height;
  // },
};
</script>

<style scoped>
</style>
