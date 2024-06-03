var DataGroup = new Vue({
    el: "#DataGroup",
    data:{
        treedata:[],//模型树
        treeprops:{//treedata 参数定义
            children: 'children', //treedata中子节点的对象名
            label: 'nlabel' //treedata中用于label显示的项
        },
        selnode:null,//选中树节点
        nodeform:{},//选择树节点编辑表单对象
        isAddData:false,////添加/更新（false）标记

        rules: { //表单验证规则
            GROUPNAME: [
                { required: true, message: '请输入信息分组名称', trigger: 'blur' }
            ],
        },
    },
    mounted(){
        this.InitTreeData();
    },
    methods:{
        //--------弹窗---------
        //通用弹窗（save/del)确认按钮事件
        btnsure() {
            this.dialogType = dwin.dialogType;
            if (this.dialogType === 'save') {
                this.saveNode();
            } else if (this.dialogType === 'del') {
                this.deleteNode();
            }
            dwin.dialogVisible = false;
        },

        //--------时间格式---------
        //时间格式
        newdate() {
            var date = new Date();
            var now = "";
            now = date.getFullYear() + "-";
            now = now + (date.getMonth() + 1) + "-";
            now = now + date.getDate() + " ";
            now = now + this.mendZero(date.getHours()) + ":";
            now = now + this.mendZero(date.getMinutes()) + ":";
            now = now + this.mendZero(date.getSeconds()) + "";
            return now;
        },
        mendZero(num) { //时间格式添0
            return (num = num < 10 ? '0' + num : num)
        },

        //--------树相关---------
        //初始化树节点
        InitTreeData() {
            //查找物理模型的根节点，没有添加任何节点的时候就算没有选中父节点，也允许添加新节点
            this.treedata = $.Enumerable.From(loaddata("HisDocOfflineModel_DataGroup", [{ "cn": "PUID", "cp": "=", "v1": getUrlParam("muid"), "v2": null }]).d).OrderBy("$.DATAITEMNUM").ToArray();

            if (this.treedata && this.treedata.length > 0) {
                this.treedata.forEach(element => {
                    element.nodeicon = 'iconpr iconfont icon-yewudanyuan';
                    element.nlabel = element.GROUPNAME;
                    element.nid = element.RUID;
                    element.children = [];
                });
            }
        },
        /**
         * 树控件单击事件
         * @param {节点数据对象} data 
         * @param {节点对象} node 
         * @param {组件对象} nodeobj 
         */
        treenodeclick: function(data, node, nodeobj) {
            this.selnode = data;
            this.nodeform = (data == undefined) ? {} : JSON.parse(JSON.stringify(data)); //先将对象转换为jon字符串再反序列化出一个新的对象，将引用对象转为值对象
            this.isAddData = false;
        },
        
       //--------增删保存---------
        //添加
        AddNode() {
            this.isAddData = true;
            var newnodekey= getNewID("MDB", "HisDocOfflineModel_DataGroup", "RUID", 'G', 4)   

            this.nodeform = {
                APPROVALDATE: this.newdate(),//最后操作时间
                APPROVEDBY: top.LogInfor.UserName.toString(),//最后操作人
                AUTHOR: top.LogInfor.UserName.toString(),//创建人
                CREATEDATE: this.newdate(),//创建时间
                DATAITEMNUM: newnodekey.toString().substr(-4),//用于排序显示
                DESCRIPTION: "",//描述
                GROUPNAME: "",//分组名称
                PUID: getUrlParam("muid"),//所属模板编码
                RUID: newnodekey,//分组编码

                children: [],
                nid: newnodekey,
                nlabel: "",
                nodeicon: "iconpr iconfont icon-yewudanyuan",
            };
        },
        //删除
        DeleteClick() {
            if (this.selnode != null) { //选中节点不可为空
                var groupChildren = loaddata("HISDOCOFFLINEMODEL_DATAITEMS", [{ "cn": "GUID", "cp": "=", "v1": this.selnode.nid, "v2": null }]).d;
                if (!groupChildren || groupChildren.length <= 0) { //节点下不可存在子节点
                    dwin.dialogwin('del');
                } else {
                    this.$message({
                        showClose: true,
                        type: 'error',
                        message: "该节点下存在子节点，请删除所有子节点后再试！"
                    });
                }
            } else{
                this.$message({
                    showClose: true,
                    type: 'warning',
                    message: "未选中任何数据，请选中后再试！"
                });
            }
        },
        //执行删除
        deleteNode() {
            var delresult;
            var _cons = [{ "cn": "RUID", "cp": "=", "v1": this.selnode.nid, "v2": null }];
            var deltag = GetorDelData("mdb\\del", "HisDocOfflineModel_DataGroup", _cons);
            delresult = RequestHd(deltag);
            if (delresult && delresult.s === 0) {
                this.$message({
                    showClose: true,
                    type: 'success',
                    message: "操作成功！"
                });
                addUserOperLog("在【离线数采信息分组配置】页面【删除】了分组【" + this.selnode.nid + "--" + this.selnode.nlabel + "】",top.LogInfor.UserName, top.LogInfor.clientip);

                var nodeindex = $.inArray(this.selnode, this.treedata);
                if(nodeindex!=-1){
                    this.treedata.splice(nodeindex, 1);  
                }
                
                this.selnode = null; //初始化当前选中
                this.nodeform = {}; //初始化form
            }else{
                this.$message({
                    showClose: true,
                    type: 'error',
                    message: "操作失败！"
                });
            }
        },
        //保存
        SaveClick() {
            if (this.nodeform.RUID && this.nodeform.GROUPNAME) { //id与名称为必填项
                if (this.isAddData) { //是否新增
                    var IsIDExist = loaddata("HisDocOfflineModel_DataGroup", [{ "cn": "RUID", "cp": "=", "v1": this.nodeform.RUID, "v2": null }]).d;
                    if (IsIDExist && IsIDExist.length>0) { //新增ID不能与已有重复
                        this.nodeform.RUID = null; //用户输入已存在的ID，则为用户重置
                        this.$message({
                            showClose: true,
                            type: 'error',
                            message: "节点编码已存在！无法保存该数据，请修改后再试!"
                        });
                        return null;
                    }
                }
                dwin.dialogwin('save'); //保存条件满足，弹出用户确认框
            } else
                this.$message({
                    showClose: true,
                    type: 'error',
                    message: "节点编码及节点名称不可为空！请修改后再试！"
                });
        },
        //执行保存
        saveNode() {
            var saveresult;
            var tagItem = {
                APPROVALDATE: "datetime(" + this.nodeform.APPROVALDATE + ")",//最后操作时间
                APPROVEDBY: this.nodeform.APPROVEDBY,//最后操作人
                AUTHOR: this.nodeform.AUTHOR,//创建人
                CREATEDATE: "datetime(" + this.nodeform.CREATEDATE + ")",//创建时间
                DATAITEMNUM: this.nodeform.DATAITEMNUM,//用于排序显示
                DESCRIPTION: this.nodeform.DESCRIPTION,//描述
                GROUPNAME: this.nodeform.GROUPNAME,//分组名称
                PUID: this.nodeform.PUID,//所属模板编码
                RUID: this.nodeform.RUID,//分组编码
            };
            if (this.isAddData){
                var addReq = addData("mdb\\add", "HisDocOfflineModel_DataGroup", tagItem);
                saveresult = RequestHd(addReq);
            }else{
                tagItem.APPROVEDBY = top.LogInfor.UserName.toString();
                tagItem.APPROVALDATE = "datetime(" + this.newdate() + ")";
                var updateReq = saveData("HisDocOfflineModel_DataGroup",tagItem, [{ "cn": "RUID", "cp": "=", "v1": tagItem.RUID, "v2": null }]);
                saveresult = RequestHd(updateReq);
            }

            if (saveresult && saveresult.s === 0){
                this.$message({
                    showClose: true,
                    type: 'success',
                    message: "操作成功！"
                });

                this.nodeform.nlabel = this.nodeform.GROUPNAME;
                this.nodeform.nid = this.nodeform.RUID;
                this.nodeform.APPROVEDBY = tagItem.APPROVEDBY;
                this.nodeform.APPROVALDATE = tagItem.APPROVALDATE;

                if(this.isAddData){
                    addUserOperLog("在【离线数采信息分组配置】页面【添加】了分组【" + tagItem.RUID + "--" + tagItem.GROUPNAME + "】",top.LogInfor.UserName, top.LogInfor.clientip);
                    this.treedata.push(this.nodeform);
                }else{
                    addUserOperLog("在【离线数采信息分组配置】页面【修改】了分组【" + tagItem.RUID + "--" + tagItem.GROUPNAME + "】",top.LogInfor.UserName, top.LogInfor.clientip);
                }  
                this.InitTreeData();
            }else{
                this.$message({
                    showClose: true,
                    type: 'error',
                    message: "操作失败:"+saveresult.m
                });
            }

            this.isAddData = false;
            this.selnode = null;
        },
        
    }
});

