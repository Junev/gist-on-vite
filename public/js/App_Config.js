var msg = new Vue({
    el: "#msg",
    data() {
        return {
            expandTreeData:[],//默认展开

            activeName: "ConfigClass", //标签页
            msgtree: [], //树数据
            selnode: "", //选中的树节点
            selrow: [], // 选中的行
            isAddcfg: false,
            Header: { //配置项/类Header表单
                CFG_TYPE: "",
                CFG_ID: "",
                CFG_NAME: "",
                CFG_VALUE1:"",
                CFG_VALUE2:"",
                CFG_VALUE3:"",
                CFG_VALUE4:"",
                CFG_VALUE5:"",
                DESCRIPTION: "",
                PARENTCFG: ""
            },
            Item_Table: [], //配置项/类Item表格
            Item_Proerties_Details: { //配置项/类Item表单
                PropertyID: "",
                PropertyName: "",
                PropertyValue: "",
                PropertyValue1:"",
                PropertyValue2:"",
                PropertyValue3:"",
                PropertyValue4:"",
                PropertyValue5:"",
                DESCRIPTION: "",
                PARENTCFG: ""
            },
            add_class_disable: true,
            add_item_disable: true,
            header_save_disable: true,
            header_del_disable: true,
            prop_add_disable: true,
            prop_save_disable: true,
            prop_del_disable: true,
            Header_id_disable: true,
            Prop_id_disable: true,
            rules_Header: { //Header表单验证规则
                CFG_ID: [
                    { required: true, message: '请输入配置类/项编码', trigger: 'blur' }
                ],
                CFG_NAME: [
                    { required: true, message: '请输入配置类/项名称', trigger: 'blur' }
                ]
            },
            rules_prop: { //prop表单验证规则
                PropertyID: [
                    { required: true, message: '请输入配置属性编码', trigger: 'blur' }
                ],
                PropertyName: [
                    { required: true, message: '请输入配置属性名称', trigger: 'blur' }
                ]
            },
        };
    },
    mounted() {
        this.msgtree = this.init_tree(); // 初始化物料树
    },
    methods: {
        // 初始化物料树(只初始化到第二层，解决进页面卡顿)
        init_tree: function(datas, node) {
            if (null == datas) {
                var cs = $.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "APP_CONFIG", [])).d).OrderBy("$.CFG_NAME").ToArray();
                return this.init_tree(cs, null);
            }
            if (null == node) {
                this.expandTreeData = [];
                var ret = new Array();
                for (var i = 0; i < datas.length; i++) {
                    if (null == datas[i].PARENTCFG) {
                        var root = new Object();
                        root.children = new Array();
                        root.id = datas[i].CFG_ID;
                        root.label = datas[i].CFG_NAME;
                        root.parent = datas[i].PARENTCFG;
                        root.type = datas[i].CFG_TYPE;
                        root.nodeicon = "el-icon-share";
                        for (var j = 0; j < datas.length; j++) {
                            if (datas[j].PARENTCFG == datas[i].CFG_ID) {
                                var child = new Object();
                                child.children = new Array();
                                child.id = datas[j].CFG_ID;
                                child.label = datas[j].CFG_NAME;
                                child.parent = datas[j].PARENTCFG;
                                child.type = datas[j].CFG_TYPE;
                                if (child.type == 1) {
                                    child.nodeicon = "el-icon-s-tools";
                                };
                                root.children.push(child);
                                this.expandTreeData.push(datas[j].CFG_ID);
                            };
                        }
                        ret.push(root);
                    }
                }
                return ret;
            }
            
        },
        // 加载叶子节点
        load_treenode: function(node) {
            if (node.children.length > 0) {
                return;
            }
            var nodechildren = $.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "APP_CONFIG", [{ "cn": "PARENTCFG", "cp": "=", "v1": node.id, "v2": null }])).d).OrderBy("$.CFG_NAME").ToArray();
            if (nodechildren.length > 0) {
                for (var i = 0; i < nodechildren.length; i++) {
                    var ch = new Object();
                    ch.children = new Array();
                    ch.id = nodechildren[i].CFG_ID;
                    ch.label = nodechildren[i].CFG_NAME;
                    ch.parent = nodechildren[i].PARENTCFG;
                    ch.type = nodechildren[i].CFG_TYPE;
                    if (ch.type == 1) {
                        ch.nodeicon = "el-icon-s-tools";
                    };
                    node.children.push(ch);
                }
            };
        },
        // 点击节点的操作
        node_sel: function(node) {
            this.load_treenode(node);
            this.clear_msg();
            this.load_data(node);
            this.lock_button(node);
        },
        //加载节点数据
        load_data: function(node) {
            if (node.type == 1) { // 加载配置类表单数据
                var rec = RequestHd(GetorDelData("mdb\\get", "APP_CONFIG", [{ "cn": "CFG_ID", "cp": "=", "v1": node.id, "v2": null }])).d;
                this.Header.CFG_TYPE = rec[0].CFG_TYPE == 1 ? "配置类" : "配置项";
                this.Header.CFG_ID = rec[0].CFG_ID;
                this.Header.CFG_NAME = rec[0].CFG_NAME;

                this.Header.CFG_VALUE1= rec[0].CFG_VALUE1;
                this.Header.CFG_VALUE2= rec[0].CFG_VALUE2;
                this.Header.CFG_VALUE3= rec[0].CFG_VALUE3;
                this.Header.CFG_VALUE4= rec[0].CFG_VALUE4;
                this.Header.CFG_VALUE5= rec[0].CFG_VALUE5;

                this.Header.PARENTCFG = rec[0].PARENTCFG;
                this.Header.DESCRIPTION = rec[0].DESCRIPTION;
                var rec_t = RequestHd(GetorDelData("mdb\\get", "APP_CONFIG_ITEMS", [{ "cn": "PARENTCFG", "cp": "=", "v1": node.id, "v2": null }])).d;
                this.Item_Table = $.Enumerable.From(rec_t).OrderBy("$.PROPERTYID").ToArray();
            } else { // 加载配置项属性数据(是表格！不是表单！)
                var rec = RequestHd(GetorDelData("mdb\\get", "APP_CONFIG", [{ "cn": "CFG_ID", "cp": "=", "v1": node.id, "v2": null }])).d;
                this.Header.CFG_TYPE = rec[0].CFG_TYPE == 1 ? "配置类" : "配置项";
                this.Header.CFG_ID = rec[0].CFG_ID;
                this.Header.CFG_NAME = rec[0].CFG_NAME;

                this.Header.CFG_VALUE1= rec[0].CFG_VALUE1;
                this.Header.CFG_VALUE2= rec[0].CFG_VALUE2;
                this.Header.CFG_VALUE3= rec[0].CFG_VALUE3;
                this.Header.CFG_VALUE4= rec[0].CFG_VALUE4;
                this.Header.CFG_VALUE5= rec[0].CFG_VALUE5;
                
                this.Header.DESCRIPTION = rec[0].DESCRIPTION;
                this.Header.PARENTCFG = rec[0].PARENTCFG;
                var rec_t = RequestHd(GetorDelData("mdb\\get", "APP_CONFIG_ITEMS", [{ "cn": "PARENTCFG", "cp": "=", "v1": node.id, "v2": null }])).d;
                this.Item_Table = $.Enumerable.From(rec_t).OrderBy("$.PROPERTYID").ToArray();
            };
        },
        // 点击表格属性，加载配置属性表单
        load_table_data: function(row, selection) {
            this.Header_id_disable = true;
            this.Prop_id_disable = true;
            var rec = RequestHd(GetorDelData("mdb\\get", "APP_CONFIG_ITEMS", [{ "cn": "PARENTCFG", "cp": "=", "v1": row.PARENTCFG, "v2": null },{ "cn": "PROPERTYID", "cp": "=", "v1": row.PROPERTYID, "v2": null }])).d;
            this.Item_Proerties_Details.PropertyID = rec[0].PROPERTYID;
            this.Item_Proerties_Details.PropertyName = rec[0].PROPERTYNAME;
            this.Item_Proerties_Details.PropertyValue = rec[0].PROPERTYVALUE;
            this.Item_Proerties_Details.PropertyValue1 = rec[0].PROPERTYVALUE1;
            this.Item_Proerties_Details.PropertyValue2 = rec[0].PROPERTYVALUE2;
            this.Item_Proerties_Details.PropertyValue3 = rec[0].PROPERTYVALUE3;
            this.Item_Proerties_Details.PropertyValue4 = rec[0].PROPERTYVALUE4;
            this.Item_Proerties_Details.PropertyValue5 = rec[0].PROPERTYVALUE5;

            this.Item_Proerties_Details.DESCRIPTION = rec[0].DESCRIPTION;
            this.Item_Proerties_Details.PARENTCFG = rec[0].PARENTCFG;
            this.prop_add_disable = true;
            this.prop_save_disable = false;
            this.prop_del_disable = false;
            this.selrow = row;
        },
        // 清空表单表格数据以及表单验证信息
        clear_msg: function() {
            this.$refs["Header"].resetFields();
            this.$refs["Item_Proerties_Details"].resetFields();
            this.Item_Table = [];
            this.Header_id_disable = true;
            this.Prop_id_disable = true;
        },
        // 初始化按钮
        init_buttonstatus: function() {
            this.add_class_disable = true;
            this.add_item_disable = true;
            this.header_save_disable = true;
            this.header_del_disable = true;
            this.prop_add_disable = true;
            this.prop_save_disable = true;
            this.prop_del_disable = true;
        },
        //按钮锁定操作
        lock_button: function(node) {
            this.add_class_disable = true;
            this.add_item_disable = true;
            this.header_save_disable = true;
            this.header_del_disable = true;
            this.prop_add_disable = true;
            this.prop_save_disable = true;
            this.prop_del_disable = true;
            this.Header_id_disable = true;
            this.Prop_id_disable = true;

            if (node.type == 1) {
                this.add_class_disable = false;
                this.add_item_disable = false;
                this.header_save_disable = false;
                var rec = RequestHd(GetorDelData("mdb\\get", "APP_CONFIG", [{ "cn": "PARENTCFG", "cp": "=", "v1": node.id, "v2": null }])).d;
                if (rec.length > 0) {
                    this.header_del_disable = true;
                } else {
                    this.header_del_disable = false;
                };
                this.prop_add_disable = false;
            } else {
                this.header_save_disable = false;
                this.header_del_disable = false;
                this.prop_add_disable = false;
            };
            //根节点智能添加配置类
            if (node.parent == null) {
                this.add_item_disable = true;
            };
        },
        // 点击添加Header按钮
        add_Header: function(mark) {
            this.isAddcfg = true;
            if (mark == "class") {
                this.clear_msg();
                this.Header_id_disable = false;
                this.Header.CFG_TYPE = "配置类";
            } else {
                this.clear_msg();
                this.Header_id_disable = false;
                this.Header.CFG_TYPE = "配置项";
            };
            var node = this.$refs.msg_tree.getCurrentNode();
            this.Header.PARENTCFG = node.id;
        },
        // Header保存按钮
        Header_save: function() {
            if (this.isAddcfg == true) { //判断是添加保存还是更新保存
                var temp = JSON.parse(JSON.stringify(this.Header));
                temp.CFG_TYPE = temp.CFG_TYPE == "配置类" ? 1 : 2;
                var id_ck = RequestHd(GetorDelData("mdb\\get", "APP_CONFIG", [{ "cn": "CFG_ID", "cp": "=", "v1": this.Header.CFG_ID, "v2": null }])).d;
                if (id_ck.length > 0) {
                    this.$message({
                        message: "配置类/项编码重复！",
                        type: "error"
                    });
                    this.Header.CFG_ID = ""
                    return;
                };
                var addHeader = addData("mdb\\add", "APP_CONFIG", temp); //添加
                var addresult = RequestHd(addHeader);
                if (addresult.s == 0) {
                    this.$message({
                        message: "添加成功",
                        type: "success"
                    });
                    if (temp.CFG_TYPE == 1) {
                        this.addnode(1);
                    } else {
                        this.addnode(2);
                    };
                    this.isAddcfg = false;
                    this.init_buttonstatus();
                    addUserOperLog("在【系统基础信息配置】页面【添加】了配置类/项【" + this.Header.CFG_NAME + "--" + this.Header.CFG_ID + "】", top.LogInfor.UserName,top.LogInfor.clientip);
                } else {
                    this.$message({
                        message: "添加失败",
                        type: "error"
                    });
                };
            } else {
                var temp = JSON.parse(JSON.stringify(this.Header));
                delete temp.CFG_ID;
                temp.CFG_TYPE = temp.CFG_TYPE == "配置类" ? 1 : 2;
                var updateHeader = saveData("APP_CONFIG", temp, [{ "cn": "CFG_ID", "cp": "=", "v1": this.Header.CFG_ID, "v2": null }]);
                updateresult = RequestHd(updateHeader);
                if (updateresult.s == 0) {
                    this.$message({
                        message: "修改成功",
                        type: "success"
                    });
                    this.init_buttonstatus();
                    var node = this.$refs.msg_tree.getCurrentNode();
                    node.label = this.Header.CFG_NAME;
                    addUserOperLog("在【系统基础信息配置】页面【修改】了配置类/项【" + this.Header.CFG_NAME + "--" + this.Header.CFG_ID + "】", top.LogInfor.UserName,top.LogInfor.clientip);
                } else {
                    this.$message({
                        message: "修改失败",
                        type: "error"
                    });
                };
            };
        },
        // Header删除按钮
        Header_del: function() {
            var node = this.$refs.msg_tree.getCurrentNode();
            // 删除之前检查其属性是否为空，如果不为空，则不允许删除
            var item_ck = GetorDelData("mdb\\get", "APP_CONFIG_ITEMS", [{ "cn": "PARENTCFG", "cp": "=", "v1": node.id, "v2": null }]);
            var result_ck = RequestHd(item_ck).d;
            if (result_ck.length > 0) {
                this.$message({
                    message: "删除失败！该配置项/类下存在配置属性，请先删除后再试！",
                    type: "error"
                });
                return;
            };
            var delheader = GetorDelData("mdb\\del", "APP_CONFIG", [{ "cn": "CFG_ID", "cp": "=", "v1": node.id, "v2": null }]);
            var delresult = RequestHd(delheader);
            if (delresult.s == 0) { //若数据写入成功
                this.$message({
                    message: "删除成功",
                    type: "success"
                });
                this.delnode();
                this.clear_msg();
                this.init_buttonstatus();
                addUserOperLog("在【系统应用基础信息配置】页面【删除】了配置属性【" + this.Item_Proerties_Details.PropertyID + "--" + this.Item_Proerties_Details.PropertyName + "】", top.LogInfor.UserName,top.LogInfor.clientip);
            } else {
                this.$message({
                    message: "删除失败",
                    type: "error"
                });
            };



        },
        // 点击添加Items按钮
        add_Items: function() {
            this.isAddcfg = true;
            this.Prop_id_disable = false;
            this.$refs["Item_Proerties_Details"].resetFields();
            var node = this.$refs.msg_tree.getCurrentNode();
            this.Item_Proerties_Details.PARENTCFG = node.id;
            this.prop_add_disable = true;
            this.prop_save_disable = false;
        },
        // Items保存按钮
        Items_save: function() {
            if (this.isAddcfg == true) { //判断是添加保存还是更新保存
                //检查编码是否为空
                if(this.Item_Proerties_Details.PropertyID == "" || !this.Item_Proerties_Details.PropertyID || this.Item_Proerties_Details.PropertyID == null){
                    this.$message({
                        message: "配置属性编码不可为空！",
                        type: "error"
                    });
                    this.Item_Proerties_Details.PropertyID = "";
                    return;
                }
                var id_ck = RequestHd(GetorDelData("mdb\\get", "APP_CONFIG_ITEMS", [
                    {"cn": "PARENTCFG", "cp": "=", "v1": this.Item_Proerties_Details.PARENTCFG, "v2": null},
                { "cn": "PROPERTYID", "cp": "=", "v1": this.Item_Proerties_Details.PropertyID, "v2": null }])).d;
                if (id_ck.length > 0) {
                    this.$message({
                        message: "配置属性编码重复！",
                        type: "error"
                    });
                    this.Item_Proerties_Details.PropertyID = "";
                    return;
                };
                var addprop = addData("mdb\\add", "APP_CONFIG_ITEMS", this.Item_Proerties_Details); //添加
                var addresult = RequestHd(addprop);
                if (addresult.s == 0) {
                    this.$message({
                        message: "添加成功",
                        type: "success"
                    });
                    this.additem();
                    this.prop_add_disable = false;
                    this.prop_save_disable = true;
                    this.prop_del_disable = true;
                    this.Prop_id_disable = true;
                    this.isAddcfg = false;
                    addUserOperLog("在【系统基础信息配置】页面【添加】了配置属性【" + this.Item_Proerties_Details.PropertyName + "--" + this.Item_Proerties_Details.PropertyID + "】", top.LogInfor.UserName,top.LogInfor.clientip);
                } else {
                    this.$message({
                        message: "添加失败",
                        type: "error"
                    });
                };
            } else {
                var temp = JSON.parse(JSON.stringify(this.Item_Proerties_Details));
                delete temp.PropertyID;
                delete temp.PARENTCFG;
                var updateItems = saveData("APP_CONFIG_ITEMS", temp, [{"cn": "PARENTCFG", "cp": "=", "v1": this.Item_Proerties_Details.PARENTCFG, "v2": null},{ "cn": "PROPERTYID", "cp": "=", "v1": this.Item_Proerties_Details.PropertyID, "v2": null }]);
                updateresult = RequestHd(updateItems);
                if (updateresult.s == 0) {
                    this.$message({
                        message: "修改成功",
                        type: "success"
                    });
                    this.init_buttonstatus();
                    this.selrow.PROPERTYNAME = this.Item_Proerties_Details.PropertyName;
                    this.selrow.PROPERTYVALUE = this.Item_Proerties_Details.PropertyValue;
                    this.selrow.PROPERTYVALUE1 = this.Item_Proerties_Details.PropertyValue1;
                    this.selrow.PROPERTYVALUE2 = this.Item_Proerties_Details.PropertyValue2;
                    this.selrow.PROPERTYVALUE3 = this.Item_Proerties_Details.PropertyValue3;
                    this.selrow.PROPERTYVALUE4 = this.Item_Proerties_Details.PropertyValue4;
                    this.selrow.PROPERTYVALUE5 = this.Item_Proerties_Details.PropertyValue5;
                    addUserOperLog("在【系统基础信息配置】页面【修改】了配置属性【" + this.Item_Proerties_Details.PropertyName + "--" + this.Item_Proerties_Details.PropertyID + "】", top.LogInfor.UserName,top.LogInfor.clientip);
                } else {
                    this.$message({
                        message: "修改失败",
                        type: "error"
                    });
                };
            };
        },
        // Items删除按钮
        Items_del: function() {
            var delitem = GetorDelData("mdb\\del", "APP_CONFIG_ITEMS", [{"cn": "PARENTCFG", "cp": "=", "v1": this.Item_Proerties_Details.PARENTCFG, "v2": null},{ "cn": "PROPERTYID", "cp": "=", "v1": this.Item_Proerties_Details.PropertyID, "v2": null }]);
            var delresult = RequestHd(delitem);
            if (delresult.s == 0) { //若数据写入成功
                this.$message({
                    message: "删除成功",
                    type: "success"
                });
                this.delitem();
                this.$refs["Item_Proerties_Details"].resetFields();
                this.init_buttonstatus();
                addUserOperLog("在【系统应用基础信息配置】页面【删除】了配置属性【" + this.Item_Proerties_Details.PropertyID + "--" + this.Item_Proerties_Details.PropertyName + "】", top.LogInfor.UserName,top.LogInfor.clientip);
            } else {
                this.$message({
                    message: "删除失败",
                    type: "error"
                });
            };
        },
        // 添加树节点(样式)
        addnode: function(type) {
            var parentnode = this.$refs.msg_tree.getCurrentNode();
            if (type == 1) {
                parentnode.children.push({ id: this.Header.CFG_ID, label: this.Header.CFG_NAME, nodeicon: "el-icon-s-tools", type: type, parent: this.Header.PARENTCFG, children: [] });
            } else if (type == 2) {
                parentnode.children.push({ id: this.Header.CFG_ID, label: this.Header.CFG_NAME, nodeicon: "", type: type, parent: this.Header.PARENTCFG, children: [] });
            };
        },
        // 删除树节点(样式)
        delnode: function() {
            var childrennode = this.$refs.msg_tree.getCurrentNode();
            this.$refs.msg_tree.remove(childrennode);
        },
        // 添加表格项(样式)
        additem: function() {
            this.Item_Table.push({ PROPERTYID: this.Item_Proerties_Details.PropertyID, PROPERTYNAME: this.Item_Proerties_Details.PropertyName, PROPERTYVALUE: this.Item_Proerties_Details.PropertyValue,
                PROPERTYVALUE1: this.Item_Proerties_Details.PropertyValue1,PROPERTYVALUE2: this.Item_Proerties_Details.PropertyValue2,PROPERTYVALUE3: this.Item_Proerties_Details.PropertyValue3,
                PROPERTYVALUE4: this.Item_Proerties_Details.PropertyValue4,PROPERTYVALUE5: this.Item_Proerties_Details.PropertyValue5});
        },
        // 删除表格项(样式)
        delitem: function() {
            this.Item_Table.splice(this.Item_Table.indexOf(this.selrow), 1);
            //this.Item_Table.splice($.inArray(this.selrow, this.Item_Table), 1);
        }
    }
});

var dwin = new Vue({
    el: "#dwin",
    data() {
        return {
            dialogVisible: false,
            isChange: true, //是否改变类按钮，[删除、保存]
            dialogTitle: "", //弹窗标题
            dialogIcon: "", //弹窗提示文本前图标
            dialogIconStyle: "", //图标样式
            dialogMessage: "", //弹窗提示文本
            dialogType: "", //弹窗触发类型save\del\error
            dialogSureBtnColor: "", //确定按钮的颜色
            errorMessage: '[错误信息]',

        }
    },
    methods: {
        dialogwin(type) { //按钮触发弹窗事件
            this.dialogType = type;
            if (type == "save_Header") {
                this.isChange = true;
                this.dialogTitle = "保存数据";
                this.dialogIcon = "icon-kaohe";
                this.dialogIconStyle = "dialogI";
                this.dialogSureBtnColor = "info";
                this.dialogMessage = "您是否确认保存当前数据？";

            } else if (type == "del_Header") {
                this.isChange = true;
                this.dialogTitle = "删除数据";
                this.dialogIcon = "icon-shanchu";
                this.dialogIconStyle = "dialogD";
                this.dialogSureBtnColor = "danger";
                this.dialogMessage = "您是否确认删除当前数据？";
            } else if (type == "save_prop") {
                this.isChange = true;
                this.dialogTitle = "保存数据";
                this.dialogIcon = "icon-kaohe";
                this.dialogIconStyle = "dialogI";
                this.dialogSureBtnColor = "info";
                this.dialogMessage = "您是否确认保存当前数据？";
            } else if (type == "del_prop") {
                this.isChange = true;
                this.dialogTitle = "删除数据";
                this.dialogIcon = "icon-shanchu";
                this.dialogIconStyle = "dialogD";
                this.dialogSureBtnColor = "danger";
                this.dialogMessage = "您是否确认删除当前数据？";
            } else if (type == "error") {
                this.isChange = false;
                this.dialogTitle = "错误提示";
                this.dialogIcon = "icon-shanchu1";
                this.dialogIconStyle = "dialogD";
                this.dialogSureBtnColor = "danger";
                this.dialogMessage = this.errorMessage + "，请检查数据正确性后再试。";
            } else if (type == "add") {
                this.isChange = true;
                this.dialogTitle = "添加数据";
                this.dialogIcon = "icon-shujuyibaocun";
                this.dialogIconStyle = "dialogI";
                this.dialogSureBtnColor = "info";
                this.dialogMessage = "您是否确认添加当前所选数据？";
            };
            this.dialogVisible = true;
        },
        btnsure() { //按钮确认按钮事件
            if (this.dialogType == "save_Header")
                msg.Header_save();
            else if (this.dialogType == "del_Header")
                msg.Header_del();
            else if (this.dialogType == "save_prop")
                msg.Items_save();
            else if (this.dialogType == "del_prop")
                msg.Items_del();
            this.dialogVisible = false;
            msg.isAddcfg = false;
        },
        btnsave(type) { //保存按钮事件
            if (type == "Header") {
                if (msg.Header.CFG_ID == "" || msg.Header.CFG_NAME == "") {
                    this.$message({
                        message: "必填项不能为空！",
                        type: "error"
                    });
                    return;
                };
                this.dialogwin("save_Header");
            } else if (type == "prop") {
                if (msg.Item_Proerties_Details.PropertyID == "" || msg.Item_Proerties_Details.PropertyName == "") {
                    this.$message({
                        message: "必填项不能为空！",
                        type: "error"
                    });
                    return;
                };
                this.dialogwin("save_prop");
            }
        },
        btndel(type) { //删除按钮事件
            if (type == "Header") {
                this.dialogwin("del_Header");
            } else if (type == "prop") {
                this.dialogwin("del_prop");
            };
        }
    }
});