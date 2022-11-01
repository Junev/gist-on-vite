<template>
  <el-tree
    default-expand-all
    :data="treedata"
    :props="treeprops"
    ref="equtree"
    @node-click="handleNodeClick"
    current-node-key
    highlight-current
    style="width: 100%"
    >
    <span slot-scope="{ node, data }">
      <span :class="data.nodeicon"></span>
      <span v-cloak :class="data.nodeclass">
        {{ node.label }}
      </span>
    </span>
  </el-tree>
</template>

<script>
export default {
   props: {
    selectedNode: Object
   },
  data() {
    return {
      treedata: [], //左边树
      treeprops: {
        children: "children", //treedata中子节点的对象名
        label: "nlabel", //treedata中用于label显示的项
      },
    };
  },
  mounted() {
    this.initTreeData();
  },
  methods: {
    initTreeData() {
      const triggerNodes = loaddata("PDS_MQTTTOPIC_CATEGORY", [
        {
          cn: "PARENT_ID",
          cp: "=",
          v1: 0,
          v2: null,
        },
      ]).d;

      if (triggerNodes?.length > 0) {
        triggerNodes.forEach((node) => {
          node.nid = node.CATEGORY_ID;
          node.nlabel = node.CATEGORY_NAME;
          node.nodeicon = "iconpr iconfont icon-yewudanyuan";
          node.children = $.Enumerable.From(
            getTreeNodedata(
              "PDS_MQTTTOPIC_CATEGORY",
              "PARENT_ID",
              node.CATEGORY_ID,
              true,
              null,
              "CATEGORY_ID",
              "CATEGORY_NAME"
            )
          )
            .OrderBy("$.CATEOGRY_ID")
            .OrderBy("$.SHOWINDEX")
            .ToArray();
          node.children.forEach((c) => (c.parent = node));
        });
        this.treedata = triggerNodes;
        this.isRootLoad = true;
      }
    },
    handleNodeClick(data, node) {
      // this.selectedNode = data;
      this.$emit("update:selectedNode", data);
      this.$emit("update:formDisable", {
        parentId: true,
        categoryId: true,
      })
      //获取子分类
      if (data.CATEGORY_ID && data.children.length === 0) {
        data.children = $.Enumerable.From(
          getTreeNodedata(
            "PDS_MQTTTOPIC_CATEGORY",
            "PARENT_ID",
            data.CATEGORY_ID,
            true,
            null,
            "CATEGORY_ID",
            "CATEGORY_NAME"
          )
        )
          .OrderBy("$.CATEGORY_ID")
          .OrderBy("$.SHOWINDEX")
          .ToArray();
        data.children.forEach((c) => (c.parent = data));
      }

      const {
        CATEGORY_CODE: categoryCode,
        CATEGORY_DESC: categoryDescription,
        PARENT_ID: parentId,
        CATEGORY_ID: categoryId,
        CATEGORY_NAME: categoryName,
        CATEGORY_TYPE: categoryType,
        HAS_TRIGGER: hasTrigger,
        MQ_LEVEL: level,
        SHOWINDEX: showIndex,
      } = data;
      this.$emit("update:treeForm", {
        categoryCode,
        categoryDescription,
        parentId,
        categoryId,
        categoryName,
        categoryType: categoryType?.toString(),
        hasTrigger: hasTrigger === 1,
        level,
        showIndex,
      })
    },
  }
}
</script>

<style>

</style>