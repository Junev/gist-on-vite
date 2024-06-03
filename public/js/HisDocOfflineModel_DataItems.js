var DataGroup = new Vue({
    el: "#DataGroup",
    data:{
        treedata:[],//模型树
        treeprops:{//treedata 参数定义
            children: 'children', //treedata中子节点的对象名
            label: 'nlabel' //treedata中用于label显示的项
        },
        selparentnode:{parentid:"",parentname:""},//选中父节点
        selnode:null,//选中树节点
        nodeform:{},//选择树节点编辑表单对象
        isAddData:false,////添加/更新（false）标记
        defualtKeyValue:[],

        rules: { //表单验证规则
            DATAITEMNAME: [
                { required: true, message: '请输入信息点名称', trigger: 'blur' }
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
                    element.ispro = false;//是否是信息点
                    element.children = [];

                    var tempchildren = $.Enumerable.From(loaddata("HISDOCOFFLINEMODEL_DATAITEMS", [{ "cn": "GUID", "cp": "=", "v1": element.RUID, "v2": null }]).d).OrderBy("$.DATAITEMNUM").ToArray();
                    if(tempchildren && tempchildren.length>0){
                        tempchildren.forEach(n => {
                            n.nodeicon = 'el-icon-s-order';
                            n.nlabel = n.DATAITEMNAME;
                            n.nid = n.RUID;
                            n.ispro = true;//是否是信息点
                            n.children = [];
                
                            n.parentname = element.GROUPNAME;
                            element.children.push(n);
                        });
                    }

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
            this.isAddData = false;
            if(data.ispro){
                this.selnode = data;

                this.selparentnode.parentid = data.GUID;
                this.selparentnode.parentname = data.parentname;

                this.nodeform = (data == undefined) ? {} : JSON.parse(JSON.stringify(data)); //先将对象转换为jon字符串再反序列化出一个新的对象，将引用对象转为值对象
            }else{
                this.selparentnode.parentid = data.RUID;
                this.selparentnode.parentname = data.GROUPNAME;
            } 
        },
        
       //--------增删保存---------
        //添加
        AddNode() {
            if(!this.selparentnode || !this.selparentnode.parentid){
                this.$message({
                    showClose: true,
                    type: 'error',
                    message: "操作失败，请选择分组！"
                });
                return;
            }
            this.isAddData = true;

            newnodekey = getNewID("MDB", "HISDOCOFFLINEMODEL_DATAITEMS", "RUID", 'P', 4);

            this.nodeform = {
                PUID:getUrlParam("muid"),//所属模板编码
                RUID:newnodekey,//信息点编码
                GUID:this.selparentnode.parentid,//信息点分组编码
                DATAITEMNAME:"",//信息点名称
                EXTERNALID:"",//信息点外联编码(mes编码)
                DESCRIPTION:"",//信息点描述
                DATAITEMNUM:newnodekey.toString().substr(-4),//用于排序显示
                
                parentname:this.selparentnode.parentname,
                children: [],
                nid: newnodekey,
                nlabel: "",
                nodeicon: "",
                ispro:true,
            };
        },
        //删除
        DeleteClick() {
            if (this.selnode != null) { //选中节点不可为空
                dwin.dialogwin('del');
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
            var deltag = GetorDelData("mdb\\del", "HISDOCOFFLINEMODEL_DATAITEMS", _cons);
            delresult = RequestHd(deltag);
            if (delresult && delresult.s === 0) {
                this.$message({
                    showClose: true,
                    type: 'success',
                    message: "操作成功！"
                });
                addUserOperLog("在【离线数采点信息定义】页面【删除】了数采点【" + this.selparentnode.parentname + "--" + this.selnode.nid + "--" + this.selnode.nlabel + "】",top.LogInfor.UserName, top.LogInfor.clientip);
                this.defualtKeyValue = [];
                this.defualtKeyValue.push(this.selparentnode.parentid); 
                this.InitTreeData();
                // var nodeindex = $.inArray(this.selnode, this.selparentnode.children);
                // if(nodeindex!=-1){
                //     this.selparentnode.children.splice(nodeindex, 1);  
                // }
                
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
            if (this.nodeform.RUID && this.nodeform.DATAITEMNAME) { //id与名称为必填项
                if (this.isAddData) { //是否新增
                    var IsIDExist = loaddata("HISDOCOFFLINEMODEL_DATAITEMS", [{ "cn": "RUID", "cp": "=", "v1": this.nodeform.RUID, "v2": null }]).d;
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
                PUID:this.nodeform.PUID,//所属模板编码
                RUID:this.nodeform.RUID,//信息点编码
                GUID:this.nodeform.GUID,//信息点分组编码
                DATAITEMNAME:this.nodeform.DATAITEMNAME,//信息点名称
                EXTERNALID:this.nodeform.EXTERNALID,//信息点外联编码(mes编码)
                DESCRIPTION:this.nodeform.DESCRIPTION,//信息点描述
                DATAITEMNUM:this.nodeform.DATAITEMNUM,//用于排序显示

            };
            if (this.isAddData){
                var addReq = addData("mdb\\add", "HISDOCOFFLINEMODEL_DATAITEMS", tagItem);
                saveresult = RequestHd(addReq);
            }else{
                var updateReq = saveData("HISDOCOFFLINEMODEL_DATAITEMS",tagItem, [{ "cn": "RUID", "cp": "=", "v1": tagItem.RUID, "v2": null }]);
                saveresult = RequestHd(updateReq);
            }

            if (saveresult && saveresult.s === 0){
                this.$message({
                    showClose: true,
                    type: 'success',
                    message: "操作成功！"
                });

                this.nodeform.nlabel = this.nodeform.DATAITEMNAME;
                this.nodeform.nid = this.nodeform.RUID;

                if(this.isAddData){
                    addUserOperLog("在【离线数采信息点配置】页面【添加】了数采点【" + tagItem.RUID + "--" + tagItem.DATAITEMNAME + "】",top.LogInfor.UserName, top.LogInfor.clientip);
                }else{
                    addUserOperLog("在【离线数采信息点配置】页面【修改】了数采点【" + tagItem.RUID + "--" + tagItem.DATAITEMNAME + "】",top.LogInfor.UserName, top.LogInfor.clientip);
                } 
                this.defualtKeyValue = [];
                this.defualtKeyValue.push(this.nodeform.GUID); 
                this.InitTreeData();
            }else{
                this.$message({
                    showClose: true,
                    type: 'error',
                    message: "操作失败！"
                });
            }

            this.isAddData = false;
            this.selnode = null;
        },
        
    }
});

