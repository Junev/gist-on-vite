
var nodesel = new Vue({
    el: "#nodesel",
    data() {
        return {
            Apps: $.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "APP_CONFIG_ITEMS", [{ "cn": "ParentCFG", "cp": "=", "v1": "SysApps", "v2": null }])).d).OrderBy("$.PropertyID").ToArray(),
            Clients: $.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "APP_CONFIG_ITEMS", [{ "cn": "SysClient", "cp": "=", "v1": "SysApps", "v2": null }])).d).OrderBy("$.PropertyID").ToArray(),
            Levels:[],
            // selnode: {},
            nodes: [],
            shows: true,
            nowApp: null,
            nowClient: null,
            nowLevel:"",
            nowDesc: "",
            nowUserName: null,
            batchTime: [],//选取时间
            batchtime_s: "",//开始时间
            batchtime_e: "",//结束时间
            level_filt:loaddata("APP_CONFIG_ITEMS", [{ "cn": "ParentCFG", "cp": "=", "v1": "SysLogMsg", "v2": null }]).d,
              //禁用选择未来日期
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() >= new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000);
                }
            }
        };
    },
    mounted() {
        //设置初始化时间
        const end = new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000-1);
        const start = new Date();
        var year = start.getFullYear();
        var month = start.getMonth();
        var date = start.getDate();
        this.batchTime = [new Date(year, month, date), end];
        this.batchTimepick();
        this.nodes = GetUserTypeNodes();
        // 初始化消息等级
        this.Levels = this.init_level();
        //this.initApps();
    },
    methods: {
        // 加载消息重要性等级
        init_level:function(){
            var datas = $.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "APP_CONFIG_ITEMS", [{ "cn": "ParentCFG", "cp": "=", "v1": "SysLogMsg", "v2": null }])).d).OrderBy("$.PropertyID").ToArray();
            var ls = [{text:"全部",value: ""},{text:"未定义",value:null}];
            for(var i = 0;i < datas.length ;i++){
                var p = new Object();
                p.text = datas[i].PROPERTYNAME;
                p.value = datas[i].PROPERTYVALUE;
                ls.push(p);
            }
            return ls; 
        },
        //格式化时间格式
        batchTimepick() {
            if(this.batchTime){
                this.batchtime_s = this.newdate(this.batchTime[0]);
                this.batchtime_e = this.newdate(this.batchTime[1]);
            }      
        },
        //时间格式
        newdate(data) {
            var date = new Date(data);
            var now = "";
            now = date.getFullYear() + "-";
            now = now + (date.getMonth() + 1) + "-";
            now = now + date.getDate() + " ";
            now = now + this.mendZero(date.getHours()) + ":";
            now = now + this.mendZero(date.getMinutes()) + ":";
            now = now + this.mendZero(date.getSeconds()) + "";
            // now = "datetime(" + now + ")";
            return now;
        },
        mendZero(num) {//时间格式添0
            return (num = num < 10 ? '0' + num : num)
        },
        SelectOpers: function () {//查询事件
            OperTable.Opers = [];
            if(!this.batchTime){
                this.$message({
                    message: "请选择时间！",
                    type: "error"
                });
                return;
            };
            if(nodesel.nowApp == "" || nodesel.nowApp == null){
                this.$message({
                    message: "请选择操作子系统！",
                    type: "error"
                });
                return;
            };
            if(nodesel.nowUserName == ""){
                this.$message({
                    message: "请选择操作人！",
                    type: "error"
                });
                return;
            };
            var parasx = [{ "cn": "OPERTIME", "cp": "between", "v1": "datetime(" + this.batchtime_s + ")", "v2": "datetime(" + this.batchtime_e + ")" }];
            if (nodesel.nowApp != "" && nodesel.nowApp != null)
                parasx.push({ "cn": "AppID", "cp": "=", "v1": nodesel.nowApp, "v2": null });
            if (nodesel.nowClient != "" && nodesel.nowClient != null)
                parasx.push({ "cn": "ClientIp", "cp": "=", "v1": nodesel.nowClient, "v2": null });
            if (nodesel.nowLevel != null && nodesel.nowLevel != ""){
                parasx.push({ "cn": "MSGLEVEL", "cp": "=", "v1": nodesel.nowLevel, "v2": null });
            }else if(nodesel.nowLevel != ""){
                parasx.push({ "cn": "MSGLEVEL", "cp": "is", "v1": null, "v2": null });
            } 
            if (nodesel.nowUserName != null  && nodesel.nowUserName != "")
                parasx.push({ "cn": "UserName", "cp": "=", "v1": nodesel.nowUserName, "v2": null });
            if (nodesel.nowDesc.trim() != "")
                parasx.push({ "cn": "OperDesc", "cp": "like", "v1": '%' + nodesel.nowDesc.trim() + '%', "v2": null });
            var modeldata = GetorDelData("mdb\\get", "V_ZK_LOG", parasx);
            var userlogdata = RequestHd(modeldata).d;
            OperTable.Opers = $.Enumerable.From(userlogdata).OrderByDescending("$.OPERTIME").ToArray();
        },
        //导出Excel
        ExpOpers: function () {
            var out_log = OperTable.Opers;
            for (var p in out_log) {
                out_log[p].APPID = OperTable.GetAppName(0, 0, out_log[p].APPID);
                out_log[p].MSGLEVEL = this.level_filter(out_log[p].MSGLEVEL);
            }
            if (out_log.length > 0) {
                this.zfhead = ["操作子系统", "操作人", "时间", "等级","客户端", "详细信息"];//表头
                this.zfhead2 = ["APPID", "USERNAME", "OPERTIME", "MSGLEVEL","CLIENTIP", "OPERDESC"];//字段
                var body = this.formatJson(this.zfhead2, out_log);
                this.exprotex(this.zfhead, body);
            } else {
                this.$message('当前数据为空，请先选择数据点');
            }
        },
        exprotex: function (header, body) {
            export_json_to_excel(header, body, '系统操作日志信息');
        },
        formatJson: function (filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => v[j]))
        },
        level_filter:function(cellValue){
            if (cellValue == null ||  cellValue == "")
                return "未定义";
            for(var i = 0;i < this.level_filt.length ; i++){
                if(cellValue == this.level_filt[i].PROPERTYVALUE)
                    return this.level_filt[i].PROPERTYNAME;
            };
            return cellValue;
        }
    }
});

var OperTable = new Vue({
    el: "#OperTable",
    data() {
        return{
            Opers:[],
            currentPage: 1,//当前页
		    pageSize: 20, //一页显示日志条数
            search:"", // 二次查询
            Levels:[]
        }
    },
    mounted(){
        this.Levels = this.init_level();
    },
    methods: {
        // 加载消息重要性等级
        init_level:function(){
            var datas = $.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "APP_CONFIG_ITEMS", [{ "cn": "ParentCFG", "cp": "=", "v1": "SysLogMsg", "v2": null }])).d).OrderBy("$.PropertyID").ToArray();
            var ls = [{text:"未定义",value:null}];
            for(var i = 0;i < datas.length ;i++){
                var p = new Object();
                p.text = datas[i].PROPERTYNAME;
                p.value = datas[i].PROPERTYVALUE;
                ls.push(p);
            }
            return ls; 
        },
        GetAppName: function (row, column, cellValue) {
            try {
                return $.Enumerable.From(nodesel.Apps).Where(a => a.PROPERTYVALUE == cellValue).ToArray()[0].PROPERTYNAME;
            }
            catch (err) {
                return AppID;
            }
        },
         //每页条数改变时触发,选择一页显示多少行
		handleSizeChange(val) {
			this.currentPage = 1;
			this.pageSize = val;
		},
		//当前页改变时触发,跳转其他页
		handleCurrentChange(val) {
			this.currentPage = val;
		},
        filterTag(value, row) {
            return row.MSGLEVEL === value;
        },
        // 过滤等级Tag
        formatTagType:function(level){
            //var colorstyle = ["","success","info","warning","danger"]; //标签样式
            if(level == "A") return "success"
            else if (level == "B") return "warning"
            else if (level == "C") return "danger"
            else  return ""
        }
    }
});

//加载树节点
function GetUserTypeNodes() {
    var nodes = [];
    //nodes.push({ id: "1_", label: "全部", initcollapsed: false, enable: true, checkbox: false, checkable: false, checkwithchild: false, selected: false,children:[], NodeObj: null });
    try {
        $($.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "SYS_USER_TYPE", [{ "cn": "PARENT_TYPEID", "cp": "is not", "v1": "UT001", "v2": null }])).d).OrderBy("$.PropertyID").OrderBy("$.USER_TYPEID").ToArray()).each(
            function (i, typex) {
                nodes.push({ id: typex.USER_TYPEID, label: typex.USER_TYPENAME, initcollapsed: false, enable: false, checkbox: false, checkable: false, checkwithchild: false, selected: false, children: GetChildNodes(typex), NodeObj: typex });
            }
        );
    }
    catch (e) { }
    return nodes;
}
//加载树的子节点
function GetChildNodes(UserType) {
    var ChildNode = [];
    try {
        $($.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "SYS_USER_TYPE", [{ "cn": "PARENT_TYPEID", "cp": "=", "v1": UserType.USER_TYPEID, "v2": null }])).d).OrderBy("$.USER_TYPEID").ToArray()).each(
            function (i, typex) {
                ChildNode.push({ id: typex.USER_TYPEID, label: typex.USER_TYPENAME, initcollapsed: false, enable: false, checkbox: false, checkable: false, checkwithchild: false, selected: false, children: GetChildNodes(typex), NodeObj: typex });
            });
        $($.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "SYS_USERS", [{ "cn": "USER_TYPEID", "cp": "=", "v1": UserType.USER_TYPEID, "v2": null }])).d).OrderBy("$.USER_ID").ToArray()).each(
            function (i, userx) {
                ChildNode.push({ id: userx.USER_ID, label: userx.USER_NAME, initcollapsed: false, enable: true, checkbox: false, checkable: false, checkwithchild: false, selected: false, children: [], NodeObj: userx });
            });
    } catch (e) { }
    return ChildNode;
    
}

