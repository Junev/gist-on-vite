var dwin = new Vue({
  el: "#dwin",
  data() {
    return {
      dialogVisible: false,
      isChange: true,//是否改变类按钮，[删除、保存]
      dialogTitle: "",//弹窗标题
      dialogIcon: "",//弹窗提示文本前图标
      dialogIconStyle: "",//图标样式
      dialogMessage: "",//弹窗提示文本
      dialogType: "",//弹窗触发类型save\del\error
      dialogSureBtnColor: "",//确定按钮的颜色
      errorMessage: '[错误信息]',

    }
  },
  methods: {
    dialogwin(type) {//按钮触发弹窗事件
      this.dialogType = type;
      if (type == "save") {
        this.isChange = true;
        this.dialogTitle = "保存数据";
        this.dialogIcon = "icon-kaohe";
        this.dialogIconStyle = "dialogI";
        this.dialogSureBtnColor = "info";
        this.dialogMessage = "您是否确认保存当前更改？";
      }
      else if (type == "del") {
        this.isChange = true;
        this.dialogTitle = "删除数据";
        this.dialogIcon = "icon-shanchu";
        this.dialogIconStyle = "dialogD";
        this.dialogSureBtnColor = "danger";
        this.dialogMessage = "您是否确认删除当前数据？";
      }
      else if (type == "error") {
        this.isChange = false;
        this.dialogTitle = "错误提示";
        this.dialogIcon = "icon-shanchu1";
        this.dialogIconStyle = "dialogD";
        this.dialogSureBtnColor = "danger";
        this.dialogMessage = this.errorMessage + "，请检查数据正确性后再试。";
      }
      else if (type == "add") {
        this.isChange = true;
        this.dialogTitle = "添加数据";
        this.dialogIcon = "icon-shujuyibaocun";
        this.dialogIconStyle = "dialogI";
        this.dialogSureBtnColor = "info";
        this.dialogMessage = "您是否确认添加当前所选数据？";
      }
      else if (type == "change") {
        this.isChange = true;
        this.dialogTitle = "数据变更";
        this.dialogIcon = "icon-shujuyibaocun";
        this.dialogIconStyle = "dialogW";
        this.dialogSureBtnColor = "warning";
        this.dialogMessage = "您是否确认应用当前更改？此更改将清除先前修改的数据";
      }
      this.dialogVisible = true;
    },
    btnsure() {//按钮确认按钮事件
      if (this.dialogType == "save")
        this.btnsave();
      else if (this.dialogType == "del")
        this.btndel();
      this.dialogVisible = false;
    },

    btnsave() {//保存按钮事件
      this.dialogVisible = false;
    },
    btndel() {//删除按钮事件
      this.dialogVisible = false;
    },
    btnchange() {//删除按钮事件
      this.dialogVisible = false;
    },
  }

});