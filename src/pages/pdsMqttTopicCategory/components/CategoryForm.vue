<template>
  <div>
  <el-form id="treeForm" ref="treeForm" :model="treeForm" :rules="rules"  label-width="120px">
    <el-form-item> 
      <el-button type="success" :icon="Plus" @click="addNode(selectedNode)" :disabled="!selectedNode.nid">
        添加</el-button
        >
      
      <el-button
        type="primary"
        :icon="DocumentChecked"
        @click="saveClick"
        :disabled="!treeForm || !treeForm.categoryId"
        >保存</el-button
      >
      <el-button
        type="danger"
        :icon="Delete"
        @click="deleteClick"
        :disabled="!selectedNode || !selectedNode.CATEGORY_ID"
        >删除</el-button
      >
    </el-form-item>
    <div style="padding-bottom: 12px; overflow: hidden auto">
        <el-form-item prop="parentId" label="父节点编码">
          <el-input class="input" v-model="treeForm.parentId" :disabled="formDisable.parentId"> </el-input>
        </el-form-item>
      
        <el-form-item prop="categoryId" label="节点编码">
          <el-input
            class="input"
            placeholder="请输入该节点的编码"
            v-model="treeForm.categoryId"
            :disabled="formDisable.categoryId"
          >
          </el-input>
        </el-form-item>
      
        <el-form-item prop="categoryName" label="节点名称">
          <el-input
            class="input"
            placeholder="请输入该节点的名称"
            v-model="treeForm.categoryName"
            :disabled="formDisable.categoryName"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="categoryType" label="类型">
          <el-select v-model="treeForm.categoryType" placeholder="请选择类型" class="input">
            <el-option label="空" value="0"></el-option>
            <el-option label="工段" value="1"></el-option>
            <el-option label="单元" value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-row>
          <el-col :span="24">
            <el-form-item style="margin-left: 10px">
              <el-switch v-model="treeForm.hasTrigger" active-color="#2A923A" inactive-text="是否允许挂载触发器">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item prop="level" label="层次">
          <el-input type="number" class="input" placeholder="请输入节点层级" v-model="treeForm.level"> </el-input>
        </el-form-item>

        <el-form-item prop="categoryDescription" label="分类描述">
          <el-input
            type="textarea"
            :rows="10"
            class="input"
            placeholder="请输入分类描述"
            v-model="treeForm.categoryDescription"
          >
          </el-input>
        </el-form-item>
    </div>
  </el-form>
  <el-dialog
        title="删除"
        v-model="deleteDialog.visible"
        width="30%"
        style="font-weight: 600"
      >
        <span class="['iconfont ','icon-shanchu', 'dialogD']"></span>
        <span style="font-size: 20px">您是否确认删除当前数据?</span>
        <template #footer class="dialog-footer">
          <el-button @click="deleteDialog.visible = false"
            >取 消</el-button
          >
          <el-button type="danger" @click="deleteDialogOnOk"
            >确 定</el-button
          >
        </template>
      </el-dialog>
  </div>
</template>

<script setup>
import {
  Plus,
  DocumentChecked,
  Delete,
} from '@element-plus/icons-vue'
</script>

<script>
export default {
  components: { Plus, DocumentChecked, Delete },
  props: {
    selectedNode: Object,
    formDisable: Object,
    treeFormProp: Object,
  },
  data() {
    return {
      rules: {
        parentId: [{ required: true, trigger: "blur" }],
        categoryId: [{ required: true, validator: this.validateUniqeID, trigger: "blur" }],
      },
      treeForm: {
        parentId: "",
        categoryId: "",
      },
      deleteDialog: {
        visible: false
      }
    };
  },
  watch: {
    treeFormProp() {
      this.treeForm = this.treeFormProp;
    },
  },
  methods: {
    validateUniqeID(rule, value, callback) {
      if (!value) {
        callback(new Error("请输入组织节点编码"));
      }
      //更新原来的点：有选中的节点
      else if (this.formDisable.categoryId && value) {
        callback();
      }
      //新增节点：新增的节点和原来的节点编码不冲突
      else if (!this.formDisable.categoryId && value) {
        if (checkData("PDS_MQTTTOPIC_CATEGORY", [{ cn: "CATEGORY_ID", cp: "=", v1: value, v2: null }]).d) {
          callback(new Error("该组织节点编码已存在!"));
        }
        callback();
      } else {
        callback();
      }
    },
    validateCondition(rule, value, callback) {
      if (!value.fieldname) {
        callback(new Error("条件名为空!"));
      }
      if (!value.operation) {
        callback(new Error("条件为空!"));
      }
      if (!value.value) {
        callback(new Error("条件值为空!"));
      }
      callback();
    },
    addNode(node) {
      this.treeForm = {
        parentId: node.CATEGORY_ID,
      };
      this.formDisable.categoryId = false;
    },
    saveClick() {
      this.$refs.treeForm.validate((isValid) => {
        if (isValid) {
          const {
            categoryCode,
            categoryDescription,
            parentId,
            categoryId,
            categoryName,
            categoryType,
            hasTrigger,
            level,
            showIndex,
          } = this.treeForm;
          const newNode = {
            CATEGORY_CODE: categoryCode,
            CATEGORY_DESC: categoryDescription,
            PARENT_ID: parseInt(parentId),
            CATEGORY_ID: parseInt(categoryId),
            CATEGORY_NAME: categoryName,
            CATEGORY_TYPE: parseInt(categoryType),
            HAS_TRIGGER: hasTrigger ? 1 : 0,
            MQ_LEVEL: level,
            SHOWINDEX: showIndex,
          };

          if (!this.formDisable.categoryId) {
            this.addCategory(categoryId, newNode);
            this.refreshCategory(this.selectedNode);
          } else {
            this.editCategory(categoryId, newNode);
            this.refreshCategory(this.selectedNode.parent)
          }
        } else {
          this.$message({
            message: "请确认填写无误之后再进行保存！",
            type: "warning",
          });
          this.$refs.treeForm.clearValidate();
        }
      });
    },
    deleteClick() {
      if (this.selectedNode != null) {
        this.deleteDialog.visible = true
      } else {
        this.$message({
          message: "请选中节点之后再进行删除!",
          type: "error",
        });
        return;
      }
    },
    addCategory(id, newNode) {
      newNode.CATEGORY_ID = id;
      var addGData = addData("mdb\\add", "PDS_MQTTTOPIC_CATEGORY", newNode);
      var addresult = RequestHd(addGData);
      if (addresult.s === 0) {
        addUserOperLog(
          "在【MQTT消息分类】页面【新增】节点【" + newNode.CATEGORY_NAME + "_" + newNode.CATEGORY_ID + "】",
          top.LogInfor.UserName,
          top.LogInfor.clientip
        );
        this.$message({
          message: "保存该配置成功",
          type: "success",
        });
      } else {
        this.$message({
          message: addresult.m,
          type: "error",
        });
      }
    },
    editCategory(id, category) {
      const cons = [
        {
          cn: "CATEGORY_ID",
          cp: "=",
          v1: id,
          v2: null,
        },
      ];

      const updateData = saveData("PDS_MQTTTOPIC_CATEGORY", category, cons);
      const updateResult = RequestHd(updateData);
      if (updateResult.s === 0) {
        addUserOperLog(
          "在【MQTT消息分类】页面【修改】节点【" + category.CATEGORY_NAME + "_" + category.CATEGORY_ID + "】",
          top.LogInfor.UserName,
          top.LogInfor.clientip
        );
        this.$message({
          message: "保存该配置成功",
          type: "success",
        });
      } else {
        this.$message({
          message: updateResult.m,
          type: "error",
        });
      }
    },
    refreshCategory(parentNode) {
      parentNode.children = $.Enumerable.From(
        getTreeNodedata(
          "PDS_MQTTTOPIC_CATEGORY",
          "PARENT_ID",
          parentNode.CATEGORY_ID,
          true,
          null,
          "CATEGORY_ID",
          "CATEGORY_NAME"
        )
      )
        .OrderBy("$.CATEGORY_ID")
        .OrderBy("$.SHOWINDEX")
        .ToArray();
      parentNode.children.forEach((c) => {
        c.nodeicon = "";
        c.parent = parentNode;
      });
    },
    deleteTrigger(toDeleteNodeId) {
      var _cons = [
        {
          cn: "CATEGORY_ID",
          cp: "=",
          v1: toDeleteNodeId,
          v2: null,
        },
      ];
      var deletedata = GetorDelData("mdb\\del", "PDS_MQTTTOPIC_CATEGORY", _cons);
      var delresult = RequestHd(deletedata);
      if (delresult.s === 0) {
        addUserOperLog(
          "在【MQTT消息分类】页面【删除】节点【" + toDeleteNodeId + "】",
          top.LogInfor.UserName,
          top.LogInfor.clientip
        );

        this.$message({
          message: "删除成功",
          type: "success",
        });
      } else {
        this.$message({
          message: "删除失败",
          type: "error",
        });
      }
    },
    deleteDialogOnOk() {
      const toDeleteNodeId = this.selectedNode.CATEGORY_ID;
      
        this.deleteTrigger(toDeleteNodeId);
        this.refreshCategory(this.selectedNode.parent);
      
      this.deleteDialog.visible = false;
    },
  },
};
</script>

<style>
.input {
  width: 260px;
}
</style>
