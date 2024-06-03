var myvue = new Vue({
    el:"#myvue",
    data(){
        return{
            CommonExpandTree:[],//默认展开
            SpecialExpandTree:[],//默认展开

            //数据点表单筛选
            queryForm: {}, //刷新数据点表的表单
            PropertyGroup: [], //所属分组
            choseTagGro: null, //改变分组后获取分组的编码

            changeCommonUser:null,//用户通用模板勾选改变节点

            modelTableData:[],//模板信息
            cfgCommon:[],//当前选中的定制树对应的通用信息点配置
            isUserCommon:[],//当前用户是否启用通用信息点
            equpTree:[],//右侧质量信息点树
            ModelInfoVisible:false,//模板信息
            CommonParaVisible:false,//通用指标选取
            isModelAdd:false,//区分模板是在创建还是修改
            //模板信息验证
            rules:{
                MODELNAME:[{ required: true, message: '请输入模板名称', trigger: ['blur'] },],
                MODELTYPE:[{ required: true, message: '请输入模板类型', trigger: ['blur'] },],
            },
            selModel:null,//选中的模板的信息
            dialogVisible:false,//通用弹出确认框
            nowFun:"",//当前正在操作的功能
            CommonTable:[],//选中树节点后显示的数据的第一层
            selCommonPara:[],//模板所有已经选中的通用信息点和指标
            treeprops: { //treedata 参数定义
                children: 'children', //定义treedata中子节点的对象名
                label: 'nlabel' //定义treedata中用于标注节点的名称的key
            },
            selCommonNode:null,//选中的通用树节点

            SearchItem: '',//人员和组织节点查询的信息
            SearchType:'2',//组织1，用户2
            userTree: [],//模型树
            selUserNode:null,//选中的人
            usersLoading: false,

            SpecialTable:[],//定制表格可选
            SpecialEqupTree:[],//定制树节点
            selSpecialNode:null,//选中的定制树节点
            selSpecialPara:[],//选中的定制节点

            nowtitle:"",//标题

            //共用弹窗
            dialogTitle : "保存数据",
            dialogIcon : "icon-kaohe",
            dialogIconStyle : "dialogI",
            dialogSureBtnColor : "primary",
            dialogMessage : "您是否确认保存当前数据？"
        }
    },
    watch: {
        SearchItem(val) {
            this.$refs.userTreeRef.filter(val);
        }
    },
    mounted() {
        this.getModelTable();//左侧模型表格
        this.initEqupTree('init');//右侧设备树
        this.InitUserData();
        this.PropertyGroup = this.getProperGro();
        
        //初始化模板数据
        this.selModel = {
            MODELCODE:"",
            MODELNAME:"",
            AUTHOR:"",
            CREATEDATE:"",
            APPROVEDBY:"",
            APPROVALDATE:"",
            DESCRIPTION:"",
            MODELTYPE:1,
        };

        this.getValues();//获取指标
    },
    methods: {
        //点击用户树节点
        UserTreeClick(val){
            this.SpecialTable = [];
            this.selUserNode = val;

            if(val.ntype=="User"){
                this.SpecialEqupTree= [];
                this.initEqupTree('');

                this.isUserCommon = [];
                var p = [
                    {"cn":"MODELCODE","cp":"=","v1":this.selModel.MODELCODE,"v2":null},
                    {"cn":"COMMONINUSE","cp":"=","v1":1,"v2":null},
                    {"cn":"USERID","cp":"=","v1":this.selUserNode.USER_ID,"v2":null}
                ];
                this.isUserCommon = $.Enumerable.From(loaddata("ANALYSISMODEL_USERPARAS",p).d).ToArray();

                this.equipClass(this.SpecialEqupTree,'Special');//渲染设备树选中节点
            }
        },
        //用户对应的通用模板
        UserCheckClick(data, checked){
            this.selUserNode = data;
            if(this.selModel && this.selModel.MODELNAME != ""){
                this.changeCommonUser = data;
                if(checked.checkedKeys.filter(x=>x==data.nid).length>0){
                    this.askWin('save');
                    this.nowFun='saveUserCommon';
                }
                else{
                    this.askWin('del');
                    this.nowFun='delUserCommon';
                }
            }
            else{
                this.$message({
                    type: 'error',
                    message: '要想更改该用户的通用数据点，请先选择模型！'
                });
            }
        },
        //获取数据点分组
        getProperGro() {
            var PropertyGroup = [];
            var cons = [{
                "cn": "ENUMSET",
                "cp": "=",
                "v1": "PropertyGroup",
                "v2": null
            }];
            var getGroup = loaddata("BXT_ENUMERATION", cons);
            if (getGroup.d.length > 0) {
                PropertyGroup = $.Enumerable.From(getGroup.d).ToArray();
            }
            return PropertyGroup;
        },
        //获取属性分组中中值value
        getParentValue(value) {
            if (value) {
                var obj = this.PropertyGroup.find((item) => { //这里的oneData就是上面遍历的数据源
                    this.choseTagGro = item.ENUMVALUE;
                    return item.ENUMVALUE === value; //筛选出匹配数据
                });
            } else {
                this.choseTagGro = null;
            }

        },
        clearSelection() {
            this.$refs.CommonTableRef.clearSelection();
        },
        refreshData() {
            const tableData = this.selCommonNode.childrenTable;
            //筛选条件
            var value = {
                groupid: this.choseTagGro,
                tagid: this.queryForm.tagid === null ? "" : this.queryForm.tagid,
                tagname: this.queryForm.tagname === null ? "" : this.queryForm.tagname,
            }
            if (!value.groupid && !value.tagid && !value.tagname) {
                this.CommonTable = tableData;
                return
            }
            this.CommonTable = tableData.filter(c => {
                if (c.PROPERTYGROUP === value.groupid) {
                    return true;
                }
                
                if ((c.PROPERTYID ||'').includes(value.tagid)) {
                    return true;
                }

                if ((c.PROPERTYNAME||'').includes(value.tagname)) {
                    return true;
                }
                return false
            })
        },
        //定制信息点是否可选
        checkSelectable(val){
            if(this.isUserCommon.length >0 && (this.cfgCommon.filter(x=>x.PROPERTYID == val.PROPERTYID).length > 0)){
                return false;
            }
            else
                return true;
        },
         //树节点过滤
        filterUserNode(value, data) {
            if (!value) return true;
            if(this.SearchType=='1'){
                if(data.ntype=="Group"){
                    return data.USER_TYPENAME.indexOf(value) !== -1;
                }
            }
            else if(this.SearchType=='2'){
                if(data.ntype=="User"){
                    return data.USER_NAME.indexOf(value) !== -1;
                }
            }
        },

         //初始化人员树节点
        InitUserData() {
            //查找物理模型的根节点，没有添加任何节点的时候就算没有选中父节点，也允许添加新节点
            this.userTree = loaddata("SYS_USER_TYPE", [{ "cn": "PARENT_TYPEID", "cp": "is", "v1": null, "v2": null }]).d;

            console.log(this.userTree)
            if (this.userTree) {
                if (this.userTree.length > 0) {
                    this.userTree[0].nodeicon = 'iconpr iconfont icon-yewudanyuan ';
                    this.userTree[0].nlabel = this.userTree[0].USER_TYPENAME;
                    this.userTree[0].nid = this.userTree[0].USER_TYPEID;
                    this.userTree[0]['ntype']="Group";
                    this.userTree[0].disabled=true;
                    this.userTree.forEach(element => {
                        element.children = getTreeNodedata("SYS_USER_TYPE", "PARENT_TYPEID", element.USER_TYPEID, true, "USER_TYPEID", "USER_TYPENAME");
                        generateUserTree(element.children);
                    });
                }
            }

            function generateUserTree(userTypes) {
                userTypes.forEach(c => {
                    if (c.ntype === 'Group') {
                        const subGroups = getTreeNodedata("SYS_USER_TYPE", "PARENT_TYPEID", c.USER_TYPEID, true, "USER_TYPEID", "USER_TYPENAME");
                        if (subGroups.length === 0) {
                            c.children = getTreeNodedata("SYS_USERS", "USER_TYPEID", c.USER_TYPEID, true, "USER_ID", "USER_NAME");
                        } else {
                            c.children = subGroups;
                        }
                    }

                    if (c.children.length > 0) {
                        generateUserTree(c.children)
                    }
                });
            }
        },
        //定制设备树
        SpecialTreeClick(val){
            if(val && (this.selModel.MODELNAME =="" || this.selUserNode==null || this.selUserNode.ntype=='Group')){
                this.$message({
                    type: 'error',
                    message: '请先选择模板和用户！'
                });
                return;
            }

            else{
                this.selSpecialNode = val;
                if(this.$refs.SpecialTableRef)
                    this.$refs.SpecialTableRef.clearSelection();

                this.SpecialTable = $.Enumerable.From(loaddata("V_HISDOCPARADEF",[
                        {"cn":"EQUIPMENTID","cp":"=","v1":this.selSpecialNode.nid,"v2":null}
                        ]).d).OrderBy("$.SHOWINDEX").ToArray();

                //点击树节点后默认选中已经配置过的点
                var cfg = $.Enumerable.From(loaddata("ANALYSISMODEL_USERPARAS",
                [{"cn":"MODELCODE","cp":"=","v1":this.selModel?this.selModel.MODELCODE:"","v2":null},
                {"cn":"EQUIPMENTID","cp":"=","v1":this.selSpecialNode.nid,"v2":null},
                {"cn":"USERID","cp":"=","v1":this.selUserNode.USER_ID,"v2":null}]).d).ToArray();
                this.$nextTick(function () {
                    if(cfg.length > 0){
                        cfg.forEach(item=>{
                            var choosed = this.SpecialTable.filter(x=>x.PROPERTYID == item.PROPERTYID)[0];
                            this.$refs.SpecialTableRef.toggleRowSelection(choosed);
                        });
                    }
                });

                //当前节点下配置的通用信息
                this.cfgCommon = $.Enumerable.From(loaddata("ANALYSISMODEL_PARAS",
                [{"cn":"MODELCODE","cp":"=","v1":this.selModel.MODELCODE,"v2":null},
                {"cn":"EQUIPMENTID","cp":"=","v1":this.selSpecialNode.nid,"v2":null}]).d).ToArray();

                if(this.isUserCommon.length>0){
                    this.$nextTick(function () {
                        if(this.cfgCommon.length > 0){
                            this.cfgCommon.forEach(item=>{
                                var choosed = this.SpecialTable.filter(x=>x.PROPERTYID == item.PROPERTYID)[0];
                                this.$refs.SpecialTableRef.toggleRowSelection(choosed);
                            });
                        }
                    });
                }
            }

            this.equipClass(this.selSpecialNode.children,'Special');//渲染设备树选中节点
        },

        //选中通用设备树的节点
        CommonTreeClick(val){
            this.selCommonNode = val;
            if(this.$refs.CommonTableRef)
                this.$refs.CommonTableRef.clearSelection();

            this.CommonTable = $.Enumerable.From(loaddata("V_HISDOCPARADEF",[
                {"cn":"EQUIPMENTID","cp":"=","v1":this.selCommonNode.nid,"v2":null}
            ]).d).OrderBy("$.SHOWINDEX").ToArray();

            val.childrenTable = this.CommonTable;

            var cfg = $.Enumerable.From(loaddata("ANALYSISMODEL_PARAS",
            [{"cn":"MODELCODE","cp":"=","v1":this.selModel?this.selModel.MODELCODE:"","v2":null},
            {"cn":"EQUIPMENTID","cp":"=","v1":this.selCommonNode.nid,"v2":null}]).d).ToArray();
            this.$nextTick(function () {
                if(cfg.length > 0){
                    cfg.forEach(item=>{
                        var choosed = this.CommonTable.filter(x=>x.PROPERTYID == item.PROPERTYID)[0];
                        this.$refs.CommonTableRef.toggleRowSelection(choosed);
                    });
                }
            });
            this.equipClass(this.selCommonNode.children,'Common');//渲染设备树选中节点
        },

        //渲染默认的通用设备树选中节点,传进来的arr是同一层的，EE_LEVEL相同
        equipClass(arr,flag){
            if(!this.selModel || (flag =="Special" && !this.selUserNode)){
                return;
            }
            if(arr.length>0 && flag =="Common" || flag =="Special"){
                var field ="";
                arr.forEach(item=>{
                    field = item.EE_LEVEL == 1?'SPACEID':(item.EE_LEVEL == 2?'LINEID':(item.EE_LEVEL == 3?'CELLID':(item.EE_LEVEL == 4?'UNITID':null)));
                    if(field){
                        var paras =  [{"cn":"MODELCODE","cp":"=","v1":this.selModel?this.selModel.MODELCODE:"","v2":null},
                        {"cn":field,"cp":"=","v1":item.nid,"v2":null}]
                        var cfgCommon = $.Enumerable.From(loaddata("V_ANALYSISMODEL_PARAS",paras).d).ToArray();
                        if(this.selUserNode != null && this.selUserNode.ntype=="User"){
                            paras.push({"cn":"USERID","cp":"=","v1":this.selUserNode.USER_ID,"v2":null});
                        }
                        var cfgSpecial = $.Enumerable.From(loaddata(flag=='Common'?"V_ANALYSISMODEL_PARAS":"V_ANALYSISMODEL_USERPARAS",paras).d).ToArray();
                        
                        item.isHightlight = false;
                        if((flag =="Common" && cfgCommon.length>0 ) ||(flag =="Special" && this.isUserCommon.length >0 && cfgCommon.length>0 ) || cfgSpecial.length>0){
                            this.$nextTick(function () {
                                item.isHightlight = true;
                            });
                        }

                        if(item.children.length>0){
                            var hisCfg=[];

                            if(flag =="Common")
                                hisCfg =selfSql_One("select propertyid from ANALYSISMODEL_PARAS where EQUIPMENTID like '"+item.nid+"%' and MODELCODE ='"+this.selModel.MODELCODE+"'").d;
                            if(flag =="Special"){
                                hisCfg =selfSql_One("select propertyid from ANALYSISMODEL_USERPARAS where (EQUIPMENTID like '"+item.nid+"%' or PROPERTYID ='common') and MODELCODE ='"+this.selModel.MODELCODE+"' and USERID ='"+this.selUserNode.USER_ID+"'").d;
                            }
                            if(hisCfg.length>0){
                                this.equipClass(item.children,flag);
                            }
                            else{
                                item.children.forEach(el=>{
                                    el.isHightlight = false;
                                })
                            }
                        }
                    }
                })
            }
        },

        //获取左侧模板表格的数据
        getModelTable(){
            var modelData = $.Enumerable.From(loaddata("ANALYSISMODEL",[]).d).OrderBy("$.MODELNAME").ToArray();
            if(modelData.length > 0){
                this.modelTableData = modelData;
            }
        },

        //加载右侧质量信息点树
        initEqupTree(flag){
            var temp = $.Enumerable.From(loaddata("BXT_EQUIPELEMENT", []).d).OrderBy("$.EQUIPMENTID").OrderBy("$.SHOWINDEX").ToArray();
            if (temp.length>0) {
                this.SpecialExpandTree = [];
                this.CommonExpandTree = [];
                for(let x = 0;x<temp.length;x++){
                    if(temp[x].CONTAINEDIN == null){
                        temp[x].nid = temp[x].EQUIPMENTID;
                        temp[x].nlabel = temp[x].EQUIPMENTNAME;
                        temp[x].isHightlight = false;
                        this.SpecialExpandTree.push(temp[x].EQUIPMENTID);
                        this.CommonExpandTree.push(temp[x].EQUIPMENTID);

                        getchildnode(temp, temp[x].EQUIPMENTID,temp[x],"CONTAINEDIN","EQUIPMENTID","EQUIPMENTNAME");
                        if(flag == 'init'){
                            this.equpTree.push( JSON.parse(JSON.stringify(temp[x])));
                        }
                        temp[x].children.forEach(element=>{
                            this.SpecialExpandTree.push(element.nid);
                            this.CommonExpandTree.push(element.nid);
                        });

                        this.SpecialEqupTree.push( JSON.parse(JSON.stringify(temp[x])));
                    }
                }
            }
        },

        //生成模板编码
        createModelCode(){
            this.selModel.CREATEDATE = "datetime("+this.selModel.CREATEDATE+")";
            this.selModel.APPROVALDATE = "datetime("+this.selModel.APPROVALDATE+")";

            return getNewID("MDB", "ANALYSISMODEL", "MODELCODE", 'UM', 4)
        },

        //编辑模板
        editModel(){
            this.isModelAdd = false;
            this.ModelInfoVisible = true;
        },

        //点击模板行记录
        ModelClick(val){
            this.selModel = val;

            this.SpecialEqupTree= [];
            this.initEqupTree('');

            // if(this.selUserNode){
            //     this.UserTreeClick(this.selUserNode);
            // }
            this.setModelRelatedUsers(val);
            
            this.SpecialTable = [];

            this.nowtitle = this.selModel.MODELTYPE==1?"信息点":"指标点";
        },
        setModelRelatedUsers(model) {
            this.usersLoading = true;
            setTimeout(() => {
                const _cons = [
                    { "cn": "COMMONINUSE", "cp": "=", "v1": 1, "v2": null },
                    { "cn": "MODELCODE", "cp": "=", "v1": model.MODELCODE, "v2": null }];
                const commonUserCfg = loaddata("ANALYSISMODEL_USERPARAS", _cons).d;
                this.$refs.userTreeRef.setCheckedKeys(commonUserCfg.map(c => c.USERID))
                this.usersLoading = false;
            }, 200)  
        },

        //新建模板
        createModel(){
            this.isModelAdd = true;
            this.ModelInfoVisible = true;

            var time = dateTrans(new Date());
            this.selModel = {
                MODELCODE:"保存时将自动生成",
                MODELNAME:"",
                AUTHOR:top.LogInfor.UserName,
                CREATEDATE:time,
                APPROVEDBY:top.LogInfor.UserName,
                APPROVALDATE:time,
                DESCRIPTION:"",
                MODELTYPE:1
            };
        },

        //保存模板
        saveModel(){
            if(this.isModelAdd){
                var item = this.selModel;
                item.MODELCODE = this.createModelCode();

                var addReq = addData("mdb\\add", "ANALYSISMODEL", item);
                saveresult = RequestHd(addReq);
                if(saveresult && saveresult.s===0){
                    this.modelTableData.push(JSON.parse(JSON.stringify(this.selModel)));
                    this.ModelInfoVisible = false;
                    this.isModelAdd = false;
                    addUserOperLog("在【统计分析模板配置】页面【新增】模板"+this.selModel.MODELNAME+":"+this.selModel.MODELCODE,top.LogInfor.UserName, top.LogInfor.clientip);
                }
            }
            else{
                var item = {
                    MODELNAME:this.selModel.MODELNAME,
                    APPROVEDBY:top.LogInfor.UserName,
                    APPROVALDATE:"datetime("+dateTrans(new Date())+")",
                    MODELTYPE:this.selModel.MODELTYPE,
                    DESCRIPTION:this.selModel.DESCRIPTION
                }

                var updateReq = saveData("ANALYSISMODEL", item, [{ "cn": "MODELCODE", "cp": "=", "v1": this.selModel.MODELCODE, "v2": null }]);
                saveresult = RequestHd(updateReq);
                if(saveresult && saveresult.s===0){
                    var index = this.modelTableData.indexOf(this.modelTableData.filter(x=>x.MODELCODE == this.selModel.MODELCODE)[0]);
                    this.modelTableData.splice(index,1,JSON.parse(JSON.stringify(this.selModel)));
                    this.ModelInfoVisible = false;
                    addUserOperLog("在【统计分析模板配置】页面【修改】模板"+this.selModel.MODELNAME+":"+this.selModel.MODELCODE,top.LogInfor.UserName, top.LogInfor.clientip);
                }
            }
        },

        //按钮触发的确认事件
        askWin(type) {
            if (type == "save" ) {
                this.dialogTitle = "保存数据";
                this.dialogIcon = "el-icon-success";
                this.dialogIconStyle = "dialogI";
                this.dialogSureBtnColor = "primary";
                this.dialogMessage = "您是否确认保存当前数据？";
            }
            else if (type == "del") {
                this.dialogtype = "del";
                this.dialogIcon = "el-icon-delete-solid";
                this.dialogIconStyle = "dialogD";
                this.dialogSureBtnColor = "danger";
                this.dialogTitle = "删除数据";
                this.dialogMessage = "您是否确认删除当前数据？";
                
            }
            this.dialogVisible = true;
        },

        //通用弹出框确定事件
        //弹窗点确定执行最后的操作
        btnsure(){
            if(this.nowFun == "delModel"){//删除模板
                var delData = this.selModel;
                
                var _cons = [{ "cn": "MODELCODE", "cp": "=", "v1": this.selModel.MODELCODE, "v2": null }];
                var delCom = GetorDelData("mdb\\del", "ANALYSISMODEL_PARAS", _cons);
                var delComresult = RequestHd(delCom);

                var _cons = [{ "cn": "MODELCODE", "cp": "=", "v1": this.selModel.MODELCODE, "v2": null }];
                var delSpec = GetorDelData("mdb\\del", "ANALYSISMODEL_USERPARAS", _cons);
                var delSpecresult = RequestHd(delSpec);

                var _cons = [{ "cn": "MODELCODE", "cp": "=", "v1": delData.MODELCODE, "v2": null }];
                var deltag = GetorDelData("mdb\\del", "ANALYSISMODEL", _cons);
                var delresult = RequestHd(deltag);

                if (delresult.s === 0 && delComresult.s==0 && delSpecresult.s == 0) { //若数据写入成功

                    this.$message({
                        type: 'success',
                        message: "成功删除模板 "+ delData.MODELCODE +" - "+ delData.MODELNAME +" ！"
                    });
                    var index = this.modelTableData.indexOf(this.modelTableData.filter(x=>x.MODELCODE == delData.MODELCODE)[0]);
                    addUserOperLog( "在【统计分析模板配置】页面中【删除】了模板" + delData.MODELCODE +" -- "+ delData.MODELNAME,top.LogInfor.UserName, top.LogInfor.clientip);
                    if(index != -1){
                        this.modelTableData.splice(index,1);
                    }
                    this.selModel = null;
                    this.nowFun = null;
                }else{
                    this.$message({
                        type: 'error',
                        message: '删除失败,请确保该模板下的配置已经全部删除后才能进行此操作'
                    });
                }
            }
            //保存模板下通用信息点
            else if(this.nowFun == "saveCommon"){
                if(this.selCommonPara.length>0){
                    this.selCommonNode.isHightlight = true;
    
                    var _cons = [{ "cn": "EQUIPMENTID", "cp": "=", "v1": this.selCommonNode.nid, "v2": null },
                    { "cn": "MODELCODE", "cp": "=", "v1": this.selModel.MODELCODE, "v2": null }];
                    var deltag = GetorDelData("mdb\\del", "ANALYSISMODEL_PARAS", _cons);
                    var delresult = RequestHd(deltag);
                    if(delresult && delresult.s ===0){
                        addUserOperLog("在【统计分析模板配置】页面的模板【" + this.selModel.MODELCODE +" -- "+ this.selModel.MODELNAME + "】中为修改【"+
                        this.selCommonNode.nlabel +"】的通用指标先删除配置",top.LogInfor.UserName, top.LogInfor.clientip);
    
                        try{
                            this.selCommonPara.forEach(item=>{
                                var ob={
                                    MODELCODE:this.selModel.MODELCODE,
                                    EQUIPMENTID:this.selCommonNode.nid,
                                    PROPERTYID:item.PROPERTYID
                                };
                                var addReq = addData("mdb\\add", "ANALYSISMODEL_PARAS", ob);
                                saveresult = RequestHd(addReq);
                                if(saveresult && saveresult.s===0){
                                }
                                else{
                                    throw new Error('修改通用信息点失败');
                                }
                            });
                        }
                        catch{
                            this.$message({
                                type: 'success',
                                message: '保存失败！'
                            });
                        }
                    }
    
                    this.$message({
                        type: 'success',
                        message: '保存成功！'
                    });
                    addUserOperLog("在【统计分析模板配置】页面的模板【" + this.selModel.MODELCODE +" -- "+ this.selModel.MODELNAME + "】中为修改【"+this.selCommonNode.nlabel +"】的配置",top.LogInfor.UserName, top.LogInfor.clientip);
                    
                }
            }
            //保存模板下定制信息点
            else if(this.nowFun == "saveSpecial"){
                if(this.selSpecialPara.length>0){
                    this.selSpecialNode.isHightlight = true;
                    var _cons = [
                    { "cn": "USERID", "cp": "=", "v1": this.selUserNode.USER_ID, "v2": null },
                    { "cn": "EQUIPMENTID", "cp": "=", "v1": this.selSpecialNode.nid, "v2": null },
                    { "cn": "MODELCODE", "cp": "=", "v1": this.selModel.MODELCODE, "v2": null }];
                    var deltag = GetorDelData("mdb\\del", "ANALYSISMODEL_USERPARAS", _cons);
                    var delresult = RequestHd(deltag);
                    if(delresult && delresult.s ===0){
                        addUserOperLog("在【统计分析模板配置】页面的模板【" + this.selModel.MODELCODE +" -- "+ this.selModel.MODELNAME + "】中为修改【"+
                        this.selUserNode.USER_NAME+"_"+this.selSpecialNode.nlabel +"】的定制指标先删除配置",top.LogInfor.UserName, top.LogInfor.clientip);
    
                        try{
                            var temp = this.selSpecialPara.filter(x=>!this.cfgCommon.some(y=>y.PROPERTYID == x.PROPERTYID));
                            temp.forEach(item=>{
                                var ob={
                                    MODELCODE:this.selModel.MODELCODE,
                                    EQUIPMENTID:this.selSpecialNode.nid,
                                    PROPERTYID:item.PROPERTYID,
                                    USERID:this.selUserNode.USER_ID
                                };
                                var addReq = addData("mdb\\add", "ANALYSISMODEL_USERPARAS", ob);
                                saveresult = RequestHd(addReq);
                                if(saveresult && saveresult.s===0){
                                }
                                else{
                                    throw new Error('修改定制信息点失败');
                                }
                            });
                        }
                        catch{
                            this.$message({
                                type: 'success',
                                message: '保存失败！'
                            });
                        }
                    }
    
                    this.$message({
                        type: 'success',
                        message: '保存成功！'
                    });

                    this.selSpecialNode.isHightlight = true;
                    addUserOperLog("在【统计分析模板配置】页面的模板【" + this.selModel.MODELCODE +" -- "+ this.selModel.MODELNAME + "】中为修改【"+this.selUserNode.USER_NAME+"_"+this.selSpecialNode.nlabel +"】的配置",top.LogInfor.UserName, top.LogInfor.clientip);
                }
            }
            else if(this.nowFun == "saveUserCommon"){
                var _cons = [
                    { "cn": "USERID", "cp": "=", "v1": this.changeCommonUser.USER_ID, "v2": null },
                    { "cn": "COMMONINUSE", "cp": "=", "v1": 1, "v2": null },
                    { "cn": "MODELCODE", "cp": "=", "v1": this.selModel.MODELCODE, "v2": null }];
                var deltag = GetorDelData("mdb\\del", "ANALYSISMODEL_USERPARAS", _cons);
                var delresult = RequestHd(deltag);
                if(delresult && delresult.s ===0){
                    var ob={
                        MODELCODE:this.selModel.MODELCODE,
                        COMMONINUSE:1,
                        USERID:this.changeCommonUser.USER_ID,
                        PROPERTYID:"common"
                    };
                    var addReq = addData("mdb\\add", "ANALYSISMODEL_USERPARAS", ob);
                    saveresult = RequestHd(addReq);
                    if(saveresult && saveresult.s===0){
                        this.$message({
                            type: 'success',
                            message: this.changeCommonUser.USER_NAME+"被赋予"+this.selModel.MODELNAME+"的通用指标权限"
                        });
                        addUserOperLog("在【统计分析模板配置】页面的模板" + this.changeCommonUser.USER_NAME+"已新增"+this.selModel.MODELNAME+"的通用指标权限",top.LogInfor.UserName, top.LogInfor.clientip);
                    }
                    else{
                        this.$message({
                            type: 'success',
                            message: '保存失败！'
                        });
                    }
                }
            }
            else if(this.nowFun == "delUserCommon"){
                var _cons = [
                    { "cn": "USERID", "cp": "=", "v1": this.changeCommonUser.USER_ID, "v2": null },
                    { "cn": "COMMONINUSE", "cp": "=", "v1": 1, "v2": null },
                    { "cn": "MODELCODE", "cp": "=", "v1": this.selModel.MODELCODE, "v2": null }];
                var deltag = GetorDelData("mdb\\del", "ANALYSISMODEL_USERPARAS", _cons);
                var delresult = RequestHd(deltag);
                if(delresult && delresult.s ===0){
                    this.$message({
                        type: 'success',
                        message: this.changeCommonUser.USER_NAME+"已删除"+this.selModel.MODELNAME+"的通用指标权限"
                    });
                    addUserOperLog("在【统计分析模板配置】页面的模板" + this.changeCommonUser.USER_NAME+"已删除"+this.selModel.MODELNAME+"的通用指标权限",top.LogInfor.UserName, top.LogInfor.clientip);
                }
                else{
                    this.$message({
                        type: 'success',
                        message: '删除失败！'
                    });
                }
            }
            this.dialogVisible = false;
        },
        btnCancel() {
            if (this.nowFun === 'saveUserCommon' || this.nowFun === 'delUserCommon') {
                const checkedKeys = this.$refs.userTreeRef.getCheckedKeys();
                if (checkedKeys.includes(this.selUserNode.USER_ID)) {
                    this.$refs.userTreeRef.setChecked(this.selUserNode, false);
                } else {
                    this.$refs.userTreeRef.setChecked(this.selUserNode, true);
                }
            }
            this.dialogVisible = false;
        },

        //选择通用信息点
        CommonParaSel(){
            this.CommonParaVisible = true;
            this.selCommonPara = [];
            
            this.equipClass(this.equpTree[0].children,'Common');//渲染设备树选中节点
        },

        //点击通用表
        CommonTableRowClick(val){
            this.$refs.CommonTableRef.toggleRowSelection(val);
        },

        //点击定制表
        SpecialTableRowClick(val){
            this.$refs.SpecialTableRef.toggleRowSelection(val);
        },

        //通用指标选取
        CommonSelChange(val){
            if(val && val.length>0){
                this.selCommonPara = val;
            }
        },

        //通用指标选取
        SpecialSelChange(val){
            if(val && val.length>0){
                this.selSpecialPara = val;
            }
        },

        //获取指标组
        getValues(){
            this.values = $.Enumerable.From(loaddata("APP_CONFIG_ITEMS",[
                {"cn":"PARENTCFG","cp":"=","v1":"QMSAsessmentFields","v2":null}
            ]).d).OrderBy("$.PROPERTYID").ToArray();
        }
    },
});

/**获取树结构的每一层，用户点击时才加载子节点时用,20210917更新
         * 
         * @param {*} tablename //数据库表名
         * @param {*} parentcol //父节点id字段名
         * @param {*} parentvalue //父节id值
         * @param {*} istreenode //如果不是，则后面的idcol、labelcol可以不必赋值
         * @param {*} idcol //树节点id
         * @param {} labelcol //树节点名称，用于显示，与树控件的props属性中一致
         * @param {
 * "otfilter":[],
 * "lableicon":"",
 * "ischeckdisabled":"",
 * "isenablesortcol":"",
 * "sortcol":"",
 * "isdistinct":""} confitem//其他配置对象，json对象格式,otfilter其他过滤条件,lableicon图标字符串,ischeckdisabled树节点勾选是否禁用,sortcol重定义排序列
 */
function getTreeNodedata(tablename, parentcol, parentvalue, istreenode, idcol, labelcol, confitem) {
    //labelcol, lableicon, ischeckdisabled, isenablesortcol, sortcol
    var nodedata = [];
    if (parentvalue == null || parentvalue != 'not null')
        var strfilter = [{ "cn": parentcol, "cp": (parentvalue == null) ? "is" : "=", "v1": parentvalue, "v2": null }];
    else if (parentvalue == 'not null') {
        var strfilter = [{ "cn": parentcol, "cp": "is not", "v1": null, "v2": null }];
    }
    if (confitem) {
        if (confitem.otfilter) {
            confitem.otfilter.forEach(fi => {
                strfilter.push(fi);
            })
        }
    }
    nodedata_temp = loaddata(tablename, strfilter).d;
    if (nodedata_temp == null)//任何情况下若nodedata为null，则重新初始化数组
        nodedata = [];
    else {
        if (nodedata_temp.length > 0 && istreenode) {//若不是树节点了，则不需要修改json对象
            nodedata_temp.forEach(n => {//修改json对象以符合树控件数据源要求
                n.disabled = tablename=="SYS_USERS"?false:true;
                n.nid = n[idcol];
                n.nlabel = n[labelcol];//树控件显示
                n.nleaf=false;//是否是叶子节点
                n.ntype = tablename=="SYS_USER_TYPE"?"Group":(tablename=="SYS_USERS"?"User":"");
                if (confitem) {
                    if (confitem.lableicon)
                        n.nodeicon = confitem.lableicon;//树控件的图标
                    if (confitem.ischeckdisabled == 1)
                        n.disabled = true;
                }
                n.children = [];//初始化子节点对象
                if (confitem) {
                    if (confitem.isdistinct) {
                        var nexist = [];
                        nexist = $.Enumerable.From(nodedata).Where(nd => nd.nid == n.nid).ToArray();
                        if (nexist.length == 0) {
                            nodedata.push(n);
                        }
                    } else
                        nodedata.push(n);
                } else
                    nodedata.push(n);
            })
            if (confitem) {
                if (confitem.sortcol)
                    nodedata = $.Enumerable.From(nodedata).OrderBy("$." + confitem.sortcol).ToArray();
                else
                    nodedata = $.Enumerable.From(nodedata).OrderBy("$." + idcol).ToArray();
            }
            else
                nodedata = $.Enumerable.From(nodedata).OrderBy("$." + idcol).ToArray();
        }
    }
    return nodedata;
}