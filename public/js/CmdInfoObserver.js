var TaskSchedule = new Vue({ //树的VUE对象
    el: "#TaskSchedule",
    data() {
        return {
            ParameterDatas: [],//任务参数列表
            TechnologyDatas: [],//工艺标准信息表
            TaskParaDatas:[],//任务参数信息表

            Unit_window_show:false,

            StatusOptions: $.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "BXT_ENUMERATION", [{ "cn": "ENUMSET", "cp": "=", "v1": "ScheduleStatus", "v2": null },{ "cn": "ENUMVALUE", "cp": "between", "v1": 2, "v2": 4 }])).d).OrderBy("$.ENUMVALUE").ToArray(),//生产中 待确认 待生产
            selCmdTask:null,//选中的历史单元任务
            status_filt:loaddata("BXT_ENUMERATION", [{ "cn": "ENUMSET", "cp": "=", "v1": "ScheduleStatus", "v2": null }]).d, // 任务状态过滤器
            //历史工序任务
            cmdDatas:[],

            //分页功能
            currentPage: 1,//当前页
            pageSize: 50, //一页显示日志条数

            batchText: "",//用于过滤历史批次的生产批次号
            brandText:"",//用于过滤历史任务的品牌
            BatchMaterialOptions: [],//批次添加、编辑表单中的产成品/物料集合

            batchTime: [],//选取时间
            batchtime_s: "",//开始时间
            batchtime_e: "",//结束时间
            
            selTask:null,//选中的任务

            innerVisible:false,//画趋势图的dialog
            isRainbow:true,//趋势彩虹图
            isFullLine:false,//多坐标趋势图
            isTwoLine:false,//2s趋势图
            typewindow: 2,//默认加载哪个图
            getTrendVal:null,//当前选中要画图的对象
            isTwoReDraw:true,//趋势彩虹图是否需要重绘,
            analysisResult:[],//内层dialog右侧质量数据表格
            SpcData: null, 
            stopTips:"",
            marks:{},
            Seriescolor:[],//当前使用的额颜色
            innerVisible:false,//内层dialog
            innerBackgroundColor:'rgba(255,255,255,1)',//内框背景色
            backgroundColor:'f5f7fa',//背景色
            stdIndex:{//显示指标
                1:["STANDARDV","标准值"],
                2:["UPPERLIMITV","上限"],
                3:["LOWERLIMITV","下限"],
                4:["AVGV","均值"],
                5:["STDV","标偏"],
                6:["CVV","变异系数"],
                7:["CPKV","Cpk值"],
                8:["CPV","CP值"],
                9:["CAV","CA值"],
                10:["MAXV","最大值"],
                11:["MINV","最小值"],
                12:["QUAV","合格率"],
                13:["PARAID","信息点"]
            },

            isparaTabShow:false,//任务页面是否可使用
            activeTab:'RealPara',//tab

            isShowAll:false,//是否展示所有的单元

            //查找管理系统中所有单元的批次、品牌、班次信息点对象数组
            batchid:$.Enumerable.From(loaddata("PDS_EQUIPPROPERTY", [{ "cn": "PROPERTYFLAG", "cp": "=", "v1": "BatchIDNow", "v2": null }]).d).OrderBy("$.PROPERTYID").ToArray(),//当前批次号
            producid:$.Enumerable.From(loaddata("PDS_EQUIPPROPERTY", [{ "cn": "PROPERTYFLAG", "cp": "=", "v1": "ProductIDNow", "v2": null }]).d).OrderBy("$.PROPERTYID").ToArray(),//当前品牌
            taskid:$.Enumerable.From(loaddata("PDS_EQUIPPROPERTY", [{ "cn": "PROPERTYFLAG", "cp": "=", "v1": "TaskIDNow", "v2": null }]).d).OrderBy("$.PROPERTYID").ToArray(),//当前工单号

            //用于过滤中文名字，避免频繁向数据库发起请求
            ShiftOptions:$.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "APP_CONFIG_ITEMS", [{ "cn": "PARENTCFG", "cp": "=", "v1": "+SYSBC", "v2": null }])).d).OrderBy("$.PROPERTYID").ToArray(),//班次列表
            MaterialOptions:$.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "MAT_MATERIAL", [])).d).OrderBy("$.MAT_ID").ToArray(),//品牌列表
            
            //查找管理系统中所有单元的批次、品牌、班次信息点ID
            AllUnitBatchID: [], //所有的单元propertyid
            AllProductID: [], //所有单元的牌号ID
            AllTaskID: [], //所有单元的牌号ID

            tableDataAll: [], //所有生产单元
            tableDataLeft:[], //用于展示的左侧表格数据
            tableDataRight:[], //用于展示的右侧表格数据

            NowName: "", //上方显示的名字

            TaskParas: [], //任务参数设定值数据源
            DocParas: [], //产耗参数 实际值数据源
            RecipParas: [], //配方参数 设定值数据源
            StandardParas: [], //工艺指标参数  上下限 设定值数据源
            choseBatch: null, //选中的当前需要监视的生产单元
            nowTaskID: [], //当前 任务参数点ID
            nowTaskData: [], //当前 任务参数实时值
            nowResID: [], //当前 产耗参数点ID
            nowRecipID: [], //当前 配方参数ID
            nowRecipData: [], //当前 配方参数实时值
            nowTecID: [], //当前 工艺参数ID
            nowTecData: [], //当前 工艺参数实时值
            showTask: true,
            color: "#105a96",
            productingbatchs:[],//记录现在所有在生产的批次
            fullscreenLoading:false,//loading覆盖层
        }
    },
    watch:{
        innerVisible(val){
            if(!val){
                clearTimeout();
                this.timerRefresh(this.choseBatch);
            }
        }
    },
    created() {
        this.InitData("ProdArea");
    },
    mounted() {
        this.marks = {
            0:'2s趋势图',
            1:'6s趋势图',
            2:'6s彩虹图'
        }

        this.refreshUnitInfo();

        //历史工序任务管理
        this.getBatchMaterialOptions();
        const end = new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000-1);
        const start = new Date();
        var year = start.getFullYear();
        var month = start.getMonth();
        var date = start.getDate();
        this.batchTime = [new Date(year, month, date), end];
        this.batchTimepick();
    },
    methods: {
        // 任务参数点-加载
        load_taskpara(row){
            var _cons = [
                { "cn": "PROPERTYID", "cp": "=", "v1": row.PROPERTYID, "v2": null }
            ]; 
            var temp = loaddata("BXT_EQUIPPROPERTY",_cons).d[0];
            var _cons = [
                { "cn": "PARENTCFG", "cp": "=", "v1": temp.PROPERTYVALUESOURCECFG_ID, "v2": null }
            ]; 
            var temp = $.Enumerable.From(loaddata("APP_CONFIG_ITEMS",_cons).d).OrderBy("$.PROPERTYID").ToArray();
            return temp;
        },
        //任务参数过滤器
        taskpara_filter:function(row){
            if(row.STANDARDVALUE){
                var _cons = [
                    { "cn": "PROPERTYID", "cp": "=", "v1": row.PROPERTYID, "v2": null }
                ]; 
                var temp = loaddata("BXT_EQUIPPROPERTY",_cons).d[0];
                var _cons = [
                    { "cn": "PARENTCFG", "cp": "=", "v1": temp.PROPERTYVALUESOURCECFG_ID, "v2": null }
                ]; 
                var temp = loaddata("APP_CONFIG_ITEMS",_cons).d
                return temp.find(a => a.PROPERTYVALUE == row.STANDARDVALUE).PROPERTYNAME;
            }else{
                return null;
            }
        },
        // 任务参数点-变更
        change_taskpara(receive){
            const {row,item,method} = receive;
            var obj = {};
            obj.AUTHOR = top.LogInfor.UserName;
            var _cons = [
                { "cn": "TASKID", "cp": "=", "v1": this.selCmdTask.TASKID, "v2": null },
                { "cn": "PROPERTYID", "cp": "=", "v1": row.PROPERTYID, "v2": null }
            ]; 
            if(item && item.PROPERTYVALUE){
                obj.STANDARDVALUE = item.PROPERTYVALUE;
            }else{
                obj.STANDARDVALUE = null;
            }
            var ismain = loaddata("BXT_EQUIPPROPERTY",[{ "cn": "PROPERTYID", "cp": "=", "v1": row.PROPERTYID, "v2": null }]).d[0]
            if(ismain.PROPERTYFLAG == "SILO_OUT_MAIN"){
                if(item)
                    var savetask = RequestHd(saveData("PRD_CELLTASK", {"AUTHOR":top.LogInfor.UserName,"SILOPLANOUT":item.PROPERTYNAME}, [{ "cn": "TASKID", "cp": "=", "v1": this.selCmdTask.TASKID, "v2": null }]));
                else
                    var savetask = RequestHd(saveData("PRD_CELLTASK", {"AUTHOR":top.LogInfor.UserName,"SILOPLANOUT":null}, [{ "cn": "TASKID", "cp": "=", "v1": this.selCmdTask.TASKID, "v2": null }]));
            }else if(ismain.PROPERTYFLAG == "SILO_IN_MAIN"){
                if(item)
                    var savetask = RequestHd(saveData("PRD_CELLTASK", {"AUTHOR":top.LogInfor.UserName,"SILOPLANIN":item.PROPERTYNAME}, [{ "cn": "TASKID", "cp": "=", "v1": this.selCmdTask.TASKID, "v2": null }]));
                else
                    var savetask = RequestHd(saveData("PRD_CELLTASK", {"AUTHOR":top.LogInfor.UserName,"SILOPLANIN":null}, [{ "cn": "TASKID", "cp": "=", "v1": this.selCmdTask.TASKID, "v2": null }]));
            }
            var datas = saveData("PRD_CELLTASK_PARAS", obj, _cons);
            var re = RequestHd(datas);
            if (re.s == 0 && savetask.s == 0) {
                this.$message({
                    message: '任务参数变更成功！',
                    type: 'success'
                });
                addUserOperLog( "在【生产任务计划管理】页面，在【" + this.selCmdTask.BATCHID + "】批次的【" + this.selCmdTask.TASKID + "】工段任务下【变更】任务参数【" + row.PROPERTYNAME + "】为【"+(item?item.PROPERTYNAME:'null')+"】");
                
                var index =this.TaskParaDatas.indexOf(this.TaskParaDatas.find(item => item.PROPERTYID == row.PROPERTYID));
                if(index != -1){
                    this.TaskParaDatas[index].STANDARDVALUE = item.PROPERTYVALUE;
                }
            }else{ 
                this.$message.error('单元状态变更失败！' + re.m); 
                return
            };
        },

        //单元列表点击事件
        showHisPara() {
            this.$nextTick(function () {
                // 加载批次—配方参数信息表
                this.TechnologyDatas = [];
                var _cons = [
                    { "cn": "CMDID", "cp": "=", "v1": this.selCmdTask.CMDID, "v2": null },
                    { "cn": "ISRECIPEPARA", "cp": "=", "v1": 1, "v2": null },
                    { "cn": "ISOUT", "cp": "=", "v1": 1, "v2": null },
                ];
                var modeldata = GetorDelData("mdb\\get", "V_PRD_UNITCMD_PARAS", _cons);
                this.TechnologyDatas = $.Enumerable.From(RequestHd(modeldata).d).OrderBy("$.DATAITEMNUM").ToArray();
                // 加载批次--工艺标准信息表
                this.ParameterDatas = [];
                var _cons = [
                    { "cn": "CMDID", "cp": "=", "v1": this.selCmdTask.CMDID, "v2": null },
                    { "cn": "ISRECIPEPARA", "cp": "=", "v1": 0, "v2": null },
                    { "cn": "ISOUT", "cp": "=", "v1": 0, "v2": null },
                ];
                var modeldata = GetorDelData("mdb\\get", "V_PRD_UNITCMD_PARAS", _cons);
                this.ParameterDatas =  $.Enumerable.From(RequestHd(modeldata).d).OrderBy("$.DATAITEMNUM").ToArray();
                // 加载批次--任务参数信息表
                this.TaskParaDatas = [];
                var _cons = [
                    { "cn": "TASKID", "cp": "=", "v1": this.selCmdTask.TASKID, "v2": null }
                ];
                var modeldata = loaddata("V_PRD_CELLTASK_PARAS_SORT", _cons).d;
                this.TaskParaDatas = $.Enumerable.From(modeldata).OrderBy("$.SHOWINDEX").ToArray();
            });
        },
        cmsRowClassName({ row, rowIndex }) {
            if (row.CMDSCHEDSTATUS == 3) {
                return 'inPMSWaiting'; 
            } else if (row.CMDSCHEDSTATUS == 2) {
                return 'inPMSRunning';
            } else if (row.CMDSCHEDSTATUS == 1) {
                return 'inPMSEnd';
            }
        },

        changeCmdInf(item,viewTime,tableTime,FileName){
            var obj = {};
            if(item[viewTime]){
                obj[tableTime] = "datetime(" + dateTrans(item[viewTime]) + ")";
                obj.AUTHOR = top.LogInfor.UserName;
            }else{
                this.$message.error(FileName+"禁止为空，请重新选择！");
                return;
            };
            var cons = [{ "cn": "CMDID", "cp": "=", "v1": item.CMDID, "v2": null }];
            var datas = saveData("PRD_UNITCMD", obj, cons);
            var re = RequestHd(datas);
            if (re.s === 0) {
                this.$message({
                    message: '单元信息修改成功！',
                    type: 'success'
                });
                addUserOperLog( "在【实际生产单元任务监视】页面，批次【"+item.BATCHID+"】下的工段【"+item.TASKID+"】下的单元【"+item.CMDID+"】下【修改】了的【"+FileName+"】为"+"【"+dateTrans(item[viewTime])+"】",top.LogInfor.UserName);
                var index =this.cmdDatas.indexOf(this.cmdDatas.find(item => item.CMDID == rowData.CMDID));
                if(index != -1){
                    this.cmdDatas[index].CMDAUTHOR = top.LogInfor.UserName;
                }
            }else{ 
                this.$message.error('单元信息修改失败！' + re.m); 
            };
        },

        // 打包参数[行记录、视图显示字段、视图显示编码字段、表编码字段]
        commandValue(newSel,rowData,PROPERTYNAME,PROPERTYVALUE,ViewColName,ViewColID,TableColID,fieldName){
            return {
                'rowData':rowData,
                'newSel': newSel,
                'PROPERTYVALUE':PROPERTYVALUE,
                'PROPERTYNAME':PROPERTYNAME,
                'ViewColName':ViewColName,
                'ViewColID':ViewColID,
                'TableColID':TableColID,
                'fieldName':fieldName
            }
        },
        // 计划开始时间、实际开始时间、实际结束时间变更
        changeCmdbc(recive){
            const {newSel,rowData,PROPERTYNAME,PROPERTYVALUE,ViewColName,ViewColID,TableColID,fieldName} = recive;

            var obj = {};
            if(newSel[PROPERTYVALUE]){
                obj[TableColID] = newSel[PROPERTYVALUE];
                obj.AUTHOR = top.LogInfor.UserName;
            }else{
                this.$message.error(fieldName+"禁止为空，请重新选择！");
                return;
            };
            var cons = [{ "cn": "CMDID", "cp": "=", "v1": rowData.CMDID, "v2": null }];
            var datas = saveData("PRD_UNITCMD", obj, cons);
            var re = RequestHd(datas);
            if (re.s === 0) {
                this.$message({
                    message: '单元信息修改成功！',
                    type: 'success'
                });
                addUserOperLog( "在【实际生产单元任务监视】页面，批次【"+rowData.BATCHID+"】下的工段【"+rowData.TASKID+"】下的单元【"+rowData.CMDID+"】下【修改】了的【"+fieldName+"】为"+"【"+newSel[PROPERTYNAME]+"】",top.LogInfor.UserName);
                var index =this.cmdDatas.indexOf(this.cmdDatas.find(item => item.CMDID == rowData.CMDID));
                if(index != -1){
                    this.cmdDatas[index][ViewColName] = newSel[PROPERTYNAME];
                    this.cmdDatas[index][ViewColID] = newSel[PROPERTYVALUE];
                    this.cmdDatas[index].CMDAUTHOR = top.LogInfor.UserName;
                }

            }else{ 
                this.$message.error('单元信息修改失败！' + re.m); 
            };
        },
        // 状态变更
        change_Status(recive){
            const {newSel,rowData,PROPERTYNAME,PROPERTYVALUE,ViewColName,ViewColID,TableColID,fieldName} = recive;
            var obj = {};
            obj.AUTHOR = top.LogInfor.UserName;
            var check_stats = loaddata("PRD_UNITCMD",[{ "cn": "CMDID", "cp": "=", "v1": rowData.CMDID, "v2": null }]).d[0];
            if(check_stats.SCHEDSTATUS == newSel[PROPERTYVALUE])
                return;
            if(check_stats.SCHEDSTATUS == 2 && newSel[PROPERTYVALUE] == 6){
                this.$message({
                    message: '禁止从状态【下达】跳转至状态【完成】,请按顺序进行！',
                    type: 'error'
                });
                return ;
            }else{
                var cons = [{ "cn": "CMDID", "cp": "=", "v1": rowData.CMDID, "v2": null }];
                obj[TableColID] = newSel[PROPERTYVALUE];
                obj.AUTHOR = top.LogInfor.UserName;
                var datas = saveData("PRD_UNITCMD", obj, cons);
                var re = RequestHd(datas);
                if (re.s == 0) {
                    this.$message({
                        message: '单元状态变更成功！',
                        type: 'success'
                    });
                    addUserOperLog( "在【实际生产单元任务监视】页面，在【" + rowData.BATCHID + "】批次的【" + rowData.TASKID + "】工段任务下【变更】了单元任务【" + rowData.CMDID + "】的"+fieldName+"为【"+newSel[PROPERTYNAME]+"】");
                    var index =this.cmdDatas.indexOf(this.cmdDatas.find(item => item.CMDID == rowData.CMDID));
                    if(index != -1){
                        this.cmdDatas[index][ViewColID] = newSel[PROPERTYVALUE];
                        this.cmdDatas[index].CMDAUTHOR = top.LogInfor.UserName;
                    }
                }else{ 
                    this.$message.error('单元状态变更失败！' + re.m); 
                };
            };
        },
        cmdClick(row){
            this.selCmdTask = row;
        },
        
        // 任务状态过滤器
        status_filter:function(row, column, cellValue){
            if (cellValue == null)
                return null;
            for(var i = 0;i < this.status_filt.length; i++){
                if(cellValue == this.status_filt[i].ENUMVALUE)
                    return this.status_filt[i].ENUMSTRING;
            };
            return cellValue;
        },
        //分页 每页条数改变时触发,选择一页显示多少行
		handleSizeChange(val) {
			this.currentPage = 1;
			this.pageSize = val;
		},
        //当前页改变时触发,跳转其他页
		handleCurrentChange(val) {
			this.currentPage = val;
		},
        // 导出当前面板数据
        Outputpanel(){
            const tempsize = JSON.parse(JSON.stringify(this.pageSize))
            const tempcur = JSON.parse(JSON.stringify(this.currentPage))
            this.currentPage = 1
            this.pageSize = this.cmdDatas.length;
            this.$nextTick(()=>{
                try {
                    let wb = new Workbook();
                    wb.SheetNames.push("生产工序任务");
                    const $e1 = this.$refs['cmdTableRef'].$el
                    let $table = $e1.querySelector('.el-table__fixed')
                    if(!$table) {
                        $table = $e1
                    }
                    wb.Sheets["生产工序任务"] = XLSX.utils.table_to_sheet($table,{raw:true})

                    //设置数值为数字类型和列宽
                    for(var key in wb.Sheets){
                        wb.Sheets[key]["!cols"] =  [
                        { wpx : 50},//序号
                        {},//查看
                        { wpx : 140},//工序编码
                        { wpx : 160},//牌号
                        { wpx : 100},//批次号
                        { wpx : 120},//工蛋号
                        { wpx : 100},//生产单元
                        { wpx : 130},//实际开始
                        { wpx : 130},//实际结束
                        { wpx : 50},//班次
                        { wpx : 100},//任务状态
                        { wpx : 130},//计划开始
                        { wpx : 70},//执行人
                    ]
                    }

                    const wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST:true, type: 'array'})
                    saveAs(new Blob([wbout],{type: 'application/octet-stream'}),`生产工序任务.xlsx`,)
                    this.currentPage = tempcur
                    this.pageSize = tempsize
                } catch (e) {
                    if (typeof console !== 'undefined') console.error(e)
                }
            })
        },

        //获取批次添加、编辑表单中的产成品/物料集合
        getBatchMaterialOptions() {
            //获取最上层数据
            var parent = $.Enumerable.From(loaddata("MAT_CLASS", [{ "cn": "PARENTCLASS", "cp": "is not", "v1": null, "v2": null }]).d).OrderBy("$.CLASSSORTNUM").ToArray();//获取顶层
            this.BatchMaterialOptions = [];//第一级
            parent.forEach(item => {
                var obj = {};
                obj.value = item.MAT_CLASS_ID;
                obj.label = item.MAT_CLASSNAME;
                this.BatchMaterialOptions.push(obj);
            });
            this.BatchMaterialOptions.forEach(item2 => {
                //var tmp_mat = $.Enumerable.From(this.mat_filt.filter(a => a.MAT_CLASS_ID == item2.MAT_CLASS_ID)).OrderBy("$.SORTNUM").ToArray();
                item2.children = this.getMat(item2)
            });
        },

        //产成品/物料集合最底层数据
        getMat(data) {
            var childe = [];
            var cons = [{ "cn": "MAT_CLASS_ID", "cp": "=", "v1": data.value, "v2": null }];
            var datas = $.Enumerable.From(loaddata("MAT_MATERIAL", cons).d).OrderBy("$.SORTNUM").ToArray() ;//获取物料编码
            datas.forEach(item => {
                var obj = {};
                var tempID = item.MAT_LEVEL ? item.MAT_LEVEL : "";
                var tempName = $.Enumerable.From(this.matLevelList).Where(pro=>pro.ENUMVALUE==tempID).ToArray();
                obj.levelID = tempID;
                obj.levelName = ((tempName && tempName.length>0) ? tempName[0].ENUMSTRING : "");
                obj.value = item.MAT_ID;
                obj.label = item.MAT_NAME;
                childe.push(obj);
            });
            return childe;
        },

        //查询工序任务
        search_cmdtask(mark){
            var fieldChar = mark==0?'CMDSCHEDSTARTTIME':(mark==1?'CMDEXESTARTTIME':(mark==2 || mark ==3?'CMDSCHEDSTATUS':null));
            var fieldValue1 = (mark==0 ||mark == 1)?"datetime(" + this.batchtime_s + ")":(mark==2?2:(mark ==3?3:null));
            var fieldValue2 = (mark==0 ||mark == 1)?"datetime(" + this.batchtime_e + ")":null;
            var conditionStr = (mark==0 ||mark == 1)?"between":"=";
            if(!fieldChar)
                return;
            
            var cons=[{ "cn": fieldChar, "cp": conditionStr, "v1": fieldValue1, "v2": fieldValue2 },
                { "cn": "UNITID", "cp": "=", "v1": this.selTask.EQUIPMENTID, "v2": null }];
            this.cmdDatas = $.Enumerable.From(loaddata("V_PRDPLAN", cons).d).OrderBy("$.BATCHID").OrderBy("$.CMDEXESTARTTIME").ToArray();

        },

        //选择时间改变事件
        batchTimepick() {
            if(this.batchTime){
                this.batchtime_s = dateTrans(this.batchTime[0]);
                this.batchtime_e = dateTrans(this.batchTime[1]);
            };   
        },

        // 自定义列背景色
        columnStyle({ row, column, rowIndex, columnIndex }) {
            if(columnIndex>0)
                return "color:"+this.Seriescolor[columnIndex-1]+";font-weight:550;";
            else
                return "";
        },

        //切换趋势图
        sliderchange(val){
            this.changemyview(val);
        },

        //切换趋势图
        formatTooltip(val){
            return this.marks[val];
        },

        //切换图
        changemyview(val){
            //切换图表
            switch(val){//切换视图
                case 0:
                    this.isFullLine = false;
                    this.isTwoLine = true;
                    this.isRainbow = false;
                    if(this.isTwoReDraw)
                        this.GetTwoChart(this.getTrendVal);
                    break; 
                case 1:
                    this.isTwoLine = false;
                    this.isRainbow = false;
                    this.isFullLine = true;
                    break; 
                case 2:
                    this.isRainbow = true;
                    this.isTwoLine = false; 
                    this.isFullLine = false; 
                    break;             
            }
        },

        //加载趋势图
        TrendSearch(val) {
            clearTimeout();
            
            this.isTwoLine = false;
            this.isRainbow = true;
            this.isFullLine = false;

            var tempOb = {
                BATCHID:this.selTask.nowbatch,
                EQUIPMENTID:this.selTask.EQUIPMENTID,
                EQUIPMENTNAME:this.selTask.EQUIPMENTNAME,
                PROPERTYID:val.PROPERTYID,
                SHIFTNAME:this.selTask.nowtask,
                MATNAME:this.selTask.nowproduct,
                PROPERTYNAME:val.PROPERTYNAME
            }

            this.typewindow = 2;

            //初次加载或者上次选中的点和本次选中的是同一个点则不需要重新加载图
            if(!this.getTrendVal ||(this.getTrendVal && (this.getTrendVal.BATCHID != tempOb.BATCHID || this.getTrendVal.EQUIPMENTID != tempOb.EQUIPMENTID || this.getTrendVal.PROPERTYID != tempOb.PROPERTYID))){
                //如果不是初次加载，趋势彩虹图只有在换点的时候才进行重绘
                this.isTwoReDraw = true;

                this.getTrendVal = tempOb;
                this.GetSpcAnalysis(tempOb);
                this.GetSixAnalysis(tempOb);
                return;
            }
            else{
                this.isTwoReDraw = false;
                return;
            }
        },

        //切换tab
        tabClick(){
            if(this.activeTab =='HisTask' && this.selTask){
                if(this.cmdDatas.length == 0){
                    this.cmdDatas = $.Enumerable.From(loaddata("V_PRDPLAN", [{ "cn": "CMDSCHEDSTATUS", "cp": "=", "v1": 2, "v2": null },
                { "cn": "UNITID", "cp": "=", "v1": this.selTask.EQUIPMENTID, "v2": null }]).d).OrderBy("$.BATCHID").OrderBy("$.CMDEXESTARTTIME").ToArray();
                }

            }
            else if(this.activeTab =='RealPara' && this.selTask){
                this.timerRefresh(this.choseBatch);
            }
        },
        
        // 初始化生产线-段-单元
        InitData(rootName) {
            var datacell = [];
            var dataArea = [];
            //区域根节点
            var tempdata = $.Enumerable.From(loaddata("APP_CONFIG", [{ "cn": "CFG_ID", "cp": "=", "v1": rootName, "v2": null }]).d).OrderBy("$.CFG_ID").ToArray();
            //区域分类节点
            var tempAreaData = $.Enumerable.From(getTreeNodedata("APP_CONFIG", "PARENTCFG", tempdata[0].CFG_ID, true, null, "CFG_ID", "CFG_NAME")).OrderBy("$.CFG_ID").ToArray();
            if (tempAreaData && tempAreaData.length > 0) {
                tempAreaData.forEach(area => {
                    dataArea.push({ id: area.CFG_NAME, CFG_ID: area.CFG_ID, CFG_NAME: area.CFG_NAME });
                })
            }
            //区域下配置的工段
            $.each(dataArea, function(index, data) {
                if (data.CFG_ID) {
                    var tempCmdData = $.Enumerable.From(getTreeNodedata("APP_CONFIG_ITEMS", "PARENTCFG", data.CFG_ID, true, null, "PROPERTYID", "PROPERTYNAME")).OrderBy("$.PROPERTYID").ToArray();
                    var singleArea = [];
                    if (tempCmdData && tempCmdData.length > 0) {
                        tempCmdData.forEach(cell => {
                            singleArea.push({ value: cell.PROPERTYVALUE, label: cell.PROPERTYNAME, parentsid: data.CFG_NAME })
                        })
                    }
                    datacell.push({ id: data.CFG_NAME, cell: singleArea });
                }
            });

            var unitdata = [];
            $.each(datacell, function(index, data) {
                if (data) {
                    if (data.cell.length > 0) {
                        var dataunit = [];
                        data.cell.forEach(item => {
                            var tempunitdata = $.Enumerable.From(loaddata("BXT_EQUIPELEMENT", [{ "cn": "CONTAINEDIN", "cp": "=", "v1": item.value, "v2": null }]).d).OrderBy("$.EQUIPMENTID").OrderBy("$.SHOWINDEX").ToArray();
                            if (tempunitdata && tempunitdata.length > 0) {
                                tempunitdata.forEach(unit => {
                                    dataunit.push({ EQUIPMENTID: unit.EQUIPMENTID, EQUIPMENTNAME: unit.EQUIPMENTNAME,plcHaveTask:true, nowbatch: "", nowproduct: "", nowtask:"", parentsid: data.id,unitInNewSystem:false,unitStatus:null})
                                })
                            }
                        });
                        unitdata.push({ id: data.id, unitvalue: dataunit });
                    }
                }
            });
            this.tableDataAll = unitdata;

            //批次和牌号ID列表初始化
            if (this.batchid && this.batchid.length > 0) {
                this.batchid.forEach(ele => {
                    this.AllUnitBatchID.push(ele.PROPERTYID); //所有单元的批次信息点编码
                })
            } else {
                this.AllUnitBatchID = [];
            }

            if (this.producid && this.producid.length > 0) {
                this.producid.forEach(elep => {
                    this.AllProductID.push(elep.PROPERTYID) //所有单元的牌号信息点编码
                })
            } else {
                this.AllProductID = [];
            }

            if (this.taskid && this.taskid.length > 0) {
                this.taskid.forEach(elep => {
                    this.AllTaskID.push(elep.PROPERTYID) //所有单元的牌号信息点编码
                })
            } else {
                this.AllTaskID = [];
            }
        },

        //任务刷新按钮
        refreshUnitInfo(){
            this.fullscreenLoading = true;
            setTimeout(() => {
                this.GetProID();
                setTimeout(() => {
                    this.fullscreenLoading = false;
                }, 50);
            }, 50);
        },

        GetProID() {
            //获取管理系统中批次状态是生产中的所有单元任务
            this.productingbatchs = $.Enumerable.From(selfSql_One("select * from V_PRDPLAN where BATCHSCHEDSTATUS = 3 or BATCHSCHEDSTATUS = 2").d).OrderBy("$.BATCHID").ToArray();

            //一次性读取地址上所有的批次号和品牌值
            var tempNowBatchValue = loaddataCDB(0, this.AllUnitBatchID).d;
            var tempNowProductValue = loaddataCDB(0, this.AllProductID).d;
            var tempNowTaskValue = loaddataCDB(0, this.AllTaskID).d;

            this.tableDataLeft =[];
            this.tableDataRight = [];

            this.tableDataAll.forEach((area,index) => {
                area.unitvalue.forEach(item => {
                    var singleBatchId = this.batchid.filter(x=>x.EQUIPMENTID == item.EQUIPMENTID && x.PROPERTYFLAG =="BatchIDNow");
                    var singleMatId = this.producid.filter(x=>x.EQUIPMENTID == item.EQUIPMENTID && x.PROPERTYFLAG =="ProductIDNow");
                    var singleTaskId = this.taskid.filter(x=>x.EQUIPMENTID == item.EQUIPMENTID && x.PROPERTYFLAG =="TaskIDNow")

                    item.nowbatch = singleBatchId.length>0?tempNowBatchValue[singleBatchId[0].PROPERTYID]:"";
                    item.nowtask = singleTaskId.length>0?tempNowTaskValue[singleTaskId[0].PROPERTYID]:"";

                    var isInPms = this.productingbatchs.filter(x=>x.UNITID == item.EQUIPMENTID && x.BATCHID == item.nowbatch);
                    if(isInPms.length > 0){
                        item.unitInNewSystem = true;
                        item.unitStatus = isInPms[0].CMDSCHEDSTATUS;
                    }

                    item.nowproduct = singleMatId.length>0?this.GetNowProduct(tempNowProductValue[singleMatId[0].PROPERTYID]):"--";

                    //地址上能读到品牌和批次号则判定为plc上当前有生产任务
                    item.plcHaveTask=(item.nowbatch==""||item.nowbatch=="0"||item.nowbatch==null)?false:((item.nowproduct==""||item.nowproduct=="0"||item.nowproduct==null)?false:
                    ((item.nowtask==""||item.nowtask=="0"||item.nowtask==null)?false:true));
                });

                if(index <= Math.ceil(this.tableDataAll.length/2)-1){
                    this.tableDataLeft.push(area);
                }
                else{
                    this.tableDataRight.push(area);
                }
            });
        },

        /*获取当前正在生产班次的名称 */
        GetNowShift(shiftid) {
            var temp = this.ShiftOptions.filter(x=>x.PROPERTYVALUE == shiftid);
            if(temp.length>0){
                return temp[0].PROPERTYNAME;
            }
            else
                return "";
        },

        /*获取当前正在生产品牌的名称 */
        GetNowProduct(productid) {
            var temp = this.MaterialOptions.filter(x=>x.MAT_ID == productid);
            if(temp.length>0){
                return temp[0].MAT_NAME;
            }
            else
                return "";
        },

        //设置行样式，无论如何只显示地址上的实时任务
        rowStyle({ row, rowIndex }) {
            //plc上有任务,不管isShowAll是什么都要显示,判断任务在plc上是否存在
            if (row.plcHaveTask) {
                //plc有任务而且pms存在此单元任务则不管状态都是蓝色，否则是红色
                if(row.unitInNewSystem){
                    if(row.unitStatus == 2){
                        return 'inPMSRunning'
                    }
                    if(row.unitStatus == 3){
                        return 'inPMSWaiting'
                    }
                    else
                        return 'inPMSEnd'
                }else{
                    return 'notInPMS'
                }
            }
            //plc上没有任务且只显示正在生产中的任务则不显示
            else  if (!row.plcHaveTask && !this.isShowAll) {
                return 'hidden_row';
            }
            //plc上没有任务,但是要显示所有的任务
            else  if (!row.plcHaveTask && this.isShowAll) {
                return '';
            }
        },

        //参数的单元格信息
        cellStyleTag(data) {
            if (data.columnIndex === 0) {
                return 'color:#2b4c6f;font-size:14px;font-weight:600;'
            }
        },
        
        handleNodeClick(data) {
            this.selTask = data;
            this.TaskParas = [];
            this.RecipParas = [];
            this.StandardParas = [];
            this.DocParas = [];
            this.nowTaskID = [];
            this.nowRecipID = [];
            this.nowResID = [];
            this.nowTecID = [];
            this.NowName = "";
            var tempCellID = "";

            this.showTask = false;

            if (data && data.plcHaveTask) {
                this.cmdDatas = [];
                this.isparaTabShow = true;
                this.activeTab = 'RealPara';

                this.choseBatch = data;
                this.NowName = data.parentsid + "  /  " + data.EQUIPMENTNAME + "  /  " + data.nowbatch + "  /  " + data.nowproduct;
                var choseBatchid = data.nowbatch;
                //工艺标准任务参数
                var tempTecParas = $.Enumerable.From(this.loadUnitParas(choseBatchid, data.EQUIPMENTID, "V_PRD_UNITCMD_PARAS")).Where(a => a.ISOUT == 0).ToArray(); //该批次的工艺

                //获取当前批次的配方参数喝任务参数
                var tempCmdData = this.loadUnitParas(choseBatchid, data.EQUIPMENTID, "V_PRD_CELLTASK_PARAS");
                var tempTaskParas = $.Enumerable.From(tempCmdData).Where(a => a.ISTASKPARA === 1 && a.ISRECIPEPARA ===0).ToArray(); //该批次的任务参数
                var tempRecipParas = $.Enumerable.From(tempCmdData).Where(a => a.ISTASKPARA === 0 && a.ISRECIPEPARA ===1).ToArray(); //该批次的任务参数

                tempCellID = this.getParentCell(data.EQUIPMENTID);
                if (tempCmdData) {
                    //任务参数按照段显示
                    if (tempTaskParas && tempTaskParas.length > 0) {
                        tempTaskParas.forEach(elementTask => {
                            var tempsp = "";
                            this.nowTaskID.push(elementTask.FEEDBACKPROPERTYID);
                            if (elementTask.PROPERTYVALUESOURCECFG_ID) {
                                var tempvalue = elementTask.PROPERTYVALUESOURCE.toString();
                                var _cons = [{ "cn": "PARENTCFG", "cp": "=", "v1": elementTask.PROPERTYVALUESOURCECFG_ID, "v2": null }, { "cn": "PROPERTYVALUE", "cp": "=", "v1": tempvalue, "v2": null }]
                                var getparaname = loaddata("APP_CONFIG_ITEMS", _cons).d;
                                if (getparaname && getparaname.length === 1)
                                    tempsp = getparaname[0].PROPERTYNAME;
                            } else {
                                tempsp = "";
                            }
                            var tempinuse = elementTask.ISINUSE === 1 ? "启用" : "未启用"
                            this.TaskParas.push({ CellID: elementTask.PROCESSCELLID, PROPERTYNAME: elementTask.FEEDBACKPROPERTYNAME, PROPERTYID: elementTask.FEEDBACKPROPERTYID, PROPERTYVALUESOURCENAME: tempsp, PROPERTYVALUESOURCECFG_ID: elementTask.PROPERTYVALUESOURCECFG_ID, PROPERTYINUSE: tempinuse })
                        });
                        this.TaskParas = $.Enumerable.From(this.TaskParas).Where(a => a.CellID == tempCellID).OrderBy("$.PROPERTYID").ToArray();
                    } else {
                        this.TaskParas = [];
                    }

                    //配方参数
                    if (tempRecipParas && tempRecipParas.length > 0) {
                        tempRecipParas.forEach(elementRecip => {
                            if(elementRecip.ISRECIPEPARA==1){
                                this.RecipParas.push({ EQUIPMENTID: elementRecip.EQUIPMENTID, PROPERTYNAME: elementRecip.PROPERTYNAME, PROPERTYID: elementRecip.PROPERTYID, STANDARDVALUE: elementRecip.STANDARDVALUE });
                            }
                        });
                        this.RecipParas = $.Enumerable.From(this.RecipParas).OrderBy("$.PROPERTYID").ToArray();

                    } else {
                        this.RecipParas = [];
                    }

                    //工艺指标
                    if (tempTecParas && tempTecParas.length > 0) {
                        this.StandardParas = $.Enumerable.From(tempTecParas).ToArray();
                        this.StandardParas.forEach(element => {
                            this.nowTecID.push(element.PROPERTYID);
                        });
                    } else {
                        this.StandardParas = [];
                    }
    
                    //产耗信息
                    var tempResPara = this.loadUnitParas(choseBatchid, data.EQUIPMENTID, "V_PRD_CELLTASK_PRODDOC"); //该批次的产耗参数
                    if (tempResPara && tempResPara.length > 0) {
                        tempResPara.forEach(elementRes => {
                            this.nowResID.push(elementRes.PROID);
                            this.DocParas.push({ EQUIPMENTID: elementRes.EQUIPMENTID, PROPERTYNAME: elementRes.PROPERTYNAME, PROPERTYID: elementRes.PROID, NowData: elementRes.PROV })
    
                        });
                        this.DocParas = $.Enumerable.From(this.DocParas).Where(a => a.EQUIPMENTID == data.EQUIPMENTID).ToArray();
                    } else {
                        this.DocParas = [];
                    }
    
                    //刷新工艺指标实时值
                    this.timerRefresh(this.choseBatch);
                }
            } else {
                this.cmdDatas = $.Enumerable.From(loaddata("V_PRDPLAN", [{ "cn": "CMDSCHEDSTATUS", "cp": "=", "v1": 2, "v2": null },
                { "cn": "UNITID", "cp": "=", "v1": this.selTask.EQUIPMENTID, "v2": null }]).d).OrderBy("$.BATCHID").OrderBy("$.CMDEXESTARTTIME").ToArray();
                const end = new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000-1);
                const start = new Date();
                var year = start.getFullYear();
                var month = start.getMonth();
                var date = start.getDate();
                this.batchTime = [new Date(year, month, date), end];
                this.batchTimepick();
                this.batchText = "";
                this.brandText = "";
                
                this.NowName = data.parentsid + "  /  " + data.EQUIPMENTNAME;
                this.isparaTabShow = false;
                this.activeTab = 'HisTask';
            }
        },

        timerRefresh(data) {
            if (data && this.activeTab == 'RealPara') {
                this.inloadNowData();
                var timer = setTimeout(() => {
                    this.timerRefresh(this.choseBatch)
                }, 2000);

            } else {
                clearTimeout();
            }
        },

        inloadNowData() {
            if (this.choseBatch) {
                try {
                    this.loadNowData(this.choseBatch);
                } catch (error) {
                    try {
                        setTimeout(function name(params) {
                            this.loadNowData(this.choseBatch);
                        }, 3000);
                    } catch (error) { }

                }
            }
        },

        loadNowData(data) {
            if (data) {
                if (this.TaskParas.length > 0) {
                    this.TaskParas = this.getNowParas(this.nowTaskID, this.TaskParas, 1);
                }
                if (this.StandardParas.length > 0) {
                    this.StandardParas = this.getNowTecPara(this.nowTecID, this.StandardParas);
                }
                if (this.DocParas.length > 0) {
                    this.DocParas = this.getNowTecPara(this.nowResID, this.DocParas);
                }
                if (this.RecipParas.length > 0) {
                    this.RecipParas = this.getNowResPara(this.nowRecipID, this.RecipParas);
                }
            }
        },

        //点击上方文字，控制任务和信息点点隐藏和显示
        deptogglePanel(event) {
            !this.showTask ? this.taskShow() : this.taskHide()
        },

        taskShow() {
            this.showTask = true;
            this.NowName = null;
        },

        taskHide() {
            this.showTask = true;
        },
        
        //tag标签获取类型  工艺参数
        TecTagType(NowData, upperdata, lowdata) {
            var tempNowData = parseFloat(NowData);
            var tempUpperData = parseFloat(upperdata);
            var tempLowData = parseFloat(lowdata);
            if (tempNowData > tempUpperData) return 'danger'
            else if (tempNowData < tempLowData) return 'danger'
            else return 'success'
        },
        
        //tag标签获取类型  配方参数 任务参数  
        RecTagType(Nowdata, StaData) {
            var xsd = StaData.toString().split(".");
            if (xsd.length == 1) {
                StaData = StaData.toString() + ".00";
            }
            if (xsd.length > 1) {
                if (xsd[1].length < 2) {
                    StaData = StaData.toString() + "0";
                }
            }
            if (Nowdata === StaData)
                return 'success';
            else
                return 'warning'
        },
        
        //获取该单元的上一层段ID
        getParentCell(unitid) {
            var return_id = "";
            if (unitid && unitid != "") {
                var con = [{ "cn": "EQUIPMENTID", "cp": "=", "v1": unitid, "v2": null }];
                var getdata = $.Enumerable.From(loaddata("BXT_EQUIPELEMENT", con).d).OrderBy("$.EQUIPMENTID").OrderBy("$.SHOWINDEX").ToArray();
                if (getdata) {
                    return_id = getdata[0].CONTAINEDIN;
                    return return_id;
                } else {
                    return return_id;
                }
            }

        },
        
        //加载数据 段上数据点 batchid-批次id viewName-视图、数据库表名称 
        loadUnitParas(batchid,unitid,viewName) {
            var return_data = [];
            if (batchid && batchid != "") {
                var _cons = [{ "cn": "BATCHID", "cp": "=", "v1": batchid, "v2": null },{"cn": "EQUIPMENTID", "cp": "=", "v1": unitid, "v2": null}];
                var tempAllTag = loaddata(viewName, _cons).d;
                if (tempAllTag && tempAllTag.length > 0) {
                    return_data = $.Enumerable.From(tempAllTag).OrderBy("$.PROPERTYID").ToArray();
                }
                return return_data;
            }
        },

        /*获取当前生产批次 生产单元  任务参数实时值  nowidarr-当前的的ID组  nowdataarr-当前的配方数据组 -datatype:用来区分任务参数和配方参数*/
        getNowParas(nowidarr, nowdataarr, datatype) {
            var tempTaskID = loaddataCDB(0, nowidarr).d;
            var tabtas = $.Enumerable.From(nowdataarr).ToArray();
            //任务参数
            $.each(tempTaskID, function(index) {
                for (var i = 0; i < tabtas.length; i++) {
                    if (tabtas[i].PROPERTYID === index) {
                        tabtas[i].NowData = "";
                        var _cons = [{ "cn": "PARENTCFG", "cp": "=", "v1": tabtas[i].PROPERTYVALUESOURCECFG_ID, "v2": null }, { "cn": "PROPERTYVALUE", "cp": "=", "v1": tempTaskID[index], "v2": null }]
                        var getparaname = loaddata("APP_CONFIG_ITEMS", _cons).d;
                        if (getparaname && getparaname.length === 1) {
                            tabtas[i].NowData = getparaname[0].PROPERTYNAME;
                        }
                    }
                }
            });
            return tabtas;

        },

        /*获取当前生产批次 生产单元  工艺参数/产耗实时值  nowidarr-当前的的ID组  nowdataarr-当前的配方数据组 */
        getNowTecPara(nowidarr, nowdataarr) {
            var tempTecID = loaddataCDB(0, nowidarr).d;
            var tabtas = $.Enumerable.From(nowdataarr).ToArray();
            $.each(tempTecID, function(index) {
                for (var i = 0; i < tabtas.length; i++) {
                    if (tabtas[i].PROPERTYID === index) {
                        tabtas[i].NowData = "";
                        tabtas[i].NowData = tempTecID[index];
                    }
                }
            });
            return tabtas;
        },

        /*获取当前生产批次 配方参数实时值  nowidarr-当前的的ID组  nowdataarr-当前的配方数据组 */
        getNowResPara(nowidarr, nowdataarr) {
            var tempTecID = loaddataCDB(0, nowidarr).d;
            var tabtas = $.Enumerable.From(nowdataarr).ToArray();
            $.each(tabtas, function(rowdata) {
                $.each(tempTecID, function(index) {
                    if (tabtas[rowdata].PROPERTYID === index) {
                        tabtas[rowdata].NowData = "";
                        tabtas[rowdata].NowData = tempTecID[index];
                    }

                });
            });
            return tabtas;
        },

        //2s趋势图
        GetTwoChart(val){
            this.$nextTick(function () {
                var chartDom = document.getElementById('TwoEcharts');
                var myChart = echarts.init(chartDom, 'dom');
                var option;
                var data = [];
    
                //获取HDB数据
                //批次号、工单号、工序任务号、是否清洗、获取质量数据、重计算、保存结果、分组、输出结果、数据点列表、格式
                var Datas = loaddataHDB_batch(val.BATCHID, null, null, null, false, 0, 0, [val.PROPERTYID]).d;

                if(!Datas || Datas.length == 0){
                    return;
                }
                var timeData = [];//横坐标时间
                var instantData = [];//y轴时序数值
                var instantData_cleartag = [];//有效标签
    
                Datas[0].VT.forEach(d=>{
                    timeData.push(d[0]);
                    instantData.push(d[1]);
                    instantData_cleartag.push(d[2]);
                })
    
                //构造y轴数据，并设置折线点颜色
                for (var i = 0; i < instantData.length; i++) {
                    data[i] = {
                        value: instantData[i],
                        itemStyle: {
                            color: instantData_cleartag[i] ? '#386db3' : '#c00'//根据每个时序数据有效标签，无效数据显示红色，有效蓝色
                        }
                    }
                }
    
                var option = {
                    grid: {//设置图周围的间距，为了能够同时放下缩放工具和图例等，可以按需调整，再配合图例等部分的位置调整
                        top: '15%',//图距离div距离
                        bottom: '18%',
                        left: '3%',
                        right: '5%',
                        containLabel: true,//grid区域是否包含坐标轴的刻度标签
                    },
                    title: {//趋势的title显示
                        text: '【' + val.SHIFTNAME + '】 ' + val.MATNAME + val.BATCHID + ' / ' + val.EQUIPMENTNAME + ' / ' + val.PROPERTYNAME,
                        left: 'center'
                    },
                    tooltip: {//鼠标焦点气泡显示X/Y数值
                        show: true,
                        trigger: 'axis',//Y轴虚线跟随
                    },
                    dataZoom: [//缩放工具
                        // 作用在直角坐标系上
                        { type: 'slider', xAxisIndex: 0, left: '3%', right: '5%', bottom: 40, },
                    ],
                    xAxis: {//x轴
                        type: 'category',
                        data: timeData,
                        splitLine: {
                            show: false
                        },
                        axisLabel:{
                            rotate: 30,
                            show: true,
                            textStyle: {
                              color: '#47576A'   //这里用参数代替了
                            },
                            interval:'auto',
                        }
                    },
                    yAxis: {//y轴，Y轴数据在series对象中设置
                        type: 'value',
                    },
                    toolbox: {//右上角小工具：缩放、缩放还原、还原、下载
                        right: 100,
                        feature: {
                            dataZoom: {
                                yAxisIndex: 'none'
                            },
                            restore: {},
                            saveAsImage: {}
                        }
                    },
                    //图例组件
                    legend: {
                        show: true,
                        bottom: 0,
                        textStyle: { color: "#386db3", fontSize: 13, }
                    },
    
                    series: [
                        {
                            data: data,//y轴数据
                            type: 'line',
                            symbolSize: 4,   //折线点的大小
                            itemStyle: {
                                normal: {
                                    color: "#386db3",//折线点的颜色
                                    lineStyle: {
                                        color: "#386db3"//折线的颜色
                                    }
                                }
                            },
    
                            name: this.qmsmessage_trend,//图例样式文字
                            icon: 'circle',//图例的样式，坨坨
    
                        }
                    ],
                };
                myChart.setOption(option);
            });
        },

        //指标趋势图
        GetSixAnalysis(val){
            this.$nextTick(function () {
                //选中参数
                this.paraIDselected = [val.PROPERTYID];
                this.paraNameselected = [val.PROPERTYNAME];
                this.analysisResult=[];
                //获取结果数据
                var analysisData =loaddataQUA(val.BATCHID,null,null,0,this.paraIDselected).d;
                if(analysisData){
                    for(var i=0;i<13;i++){
                        var temp=new Object();
                        for(var j=0;j<6;j++){
                            if(j==0)
                                temp["para0"] = this.stdIndex[i+1][1];
                            temp["para"+(j+1).toString()] = (j<analysisData.length? analysisData[j][this.stdIndex[i+1][0]]+(i==11?"%":""):"");
                        }
                        this.analysisResult.push(temp);
                    }
                }

                //获取选中数据点的历史批次信息
                var hdbdabta = loaddataHQUA(val.BATCHID, null, null, false, false, false, false, 0, true,this.paraIDselected).d;

                var singleData = null;
                var AllData = [];

                var yStyleSingleData = null;
                var yStyleAllData = [];
                var flag = 0;//标记X轴的时间是否已经加载

                // 基于准备好的dom，初始化echarts实例
                var x = document.getElementById('SixEcharts');
                myChart = echarts.init(x);
                myChart.clear();//清空绘画内容，重新绘制

                hdbdabta.forEach((element,i) => {
                    var PointColor=[];
                    var tempLineData = [];
                    (element.VT).forEach((data,index) => {
                        tempLineData.push({value: [data[0], data[1]],validFlag:data[2]});
                        if(!data[2])
                            PointColor[index]='red';
                    });

                    singleData = {
                        cursor: 'pointer',
                        // 曲线数据配置
                        data: tempLineData,
                        //降采样策略
                        //sampling: 'average',
                        // 曲线名
                        name: this.paraNameselected[flag],//鼠标放在折线点上显示的名称
                        // 设置参数对应的y坐标轴的索引
                        type: 'line',//折线图
                        symbolSize: 6,   //折线点的大小
                        symbol: 'circle',//折线点设置为实心点
                        // 曲线平滑设置
                        //smooth: true,
                        yAxisIndex: flag,
                        itemStyle: {
                            normal: {
                                //折线点的颜色
                                color: (params)=> {
                                    var colorList = PointColor;
                                    if(colorList[params.dataIndex]==null)
                                        return this.Seriescolor[i];
                                    else
                                        return colorList[params.dataIndex]
                                },
                                lineStyle: {
                                    //color: "#386db3"//折线的颜色
                                }
                            }
                        },
                        areaStyle:{
                            opacity:0.05,

                        }
                    };

                    yStyleSingleData = {
                        markPoint: {
                            data: [{
                                type: 'max',
                                name: '最大值'
                            },
                            {
                                type: 'min',
                                name: '最小值'
                            }]
                        },
                        markLine: { //均值线
                            data: [{
                                type: 'average',
                                name: '平均值'
                            }]
                        },
                        splitArea:{
                            show:true,
                            areaStyle:{
                                color:this.innerBackgroundColor
                            }
                        },
                        name: this.paraNameselected[flag],
                        nameTextStyle:{
                            color:this.Seriescolor[i]
                        },
                        nameLocation: 'center',
                        position: (this.paraNameselected.length % 2) == 0 ? (flag < (this.paraNameselected.length / 2) ? 'left' : 'right') : (flag <= parseInt(this.paraNameselected.length / 2) ? 'left' : 'right'),
                        type: 'value',
                        // max: 700,
                        min: 0,
                        // 让表格的刻度向靠里侧显示
                        axisTick: {
                            inside: true
                        },
                        //坐标值
                        axisLabel: {
                            inside: true,
                            color:this.Seriescolor[i]
                        },
                        // 设置刻度线的颜色等样式
                        axisRainbow: {
                            lineStyle: {
                                color:this.Seriescolor[i],//y轴的颜色
                                width: 3//轴线的宽度
                            }
                        },
                        //网格线
                        splitLine: {
                            show: true,
                            lineStyle: {
                                type: 'dashed'//虚线
                            }
                        },
                        label:{
                            color:this.Seriescolor[i]
                        },
                        //不同的纵坐标坐标轴之间的偏移距离
                        offset: (this.paraNameselected.length % 2) == 0 ? (flag < (this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70)//选中基数个点
                            : (flag <= parseInt(this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70),//选中偶数个点
                    }
                    flag++;
                    AllData.push(singleData);
                    yStyleAllData.push(yStyleSingleData);
                });

                option = {
                    backgroundColor:`#${this.backgroundColor}`,
                    title:{
                        text:val.BATCHID+"-"+val.MATNAME+"-"+val.PROPERTYNAME,
                        padding: [20,20,100,100],
                        textStyle: { //主标题文本样式{"fontSize": 18,"fontWeight": "bolder","color": "#333"}
                            // fontFamily: 'Arial, Verdana, sans...',
                            // fontSize: 20,
                            // fontStyle: 'normal',
                            // fontWeight: 'bold',
                        }
                    },
                    //图例
                    legend: {
                        show:true,
                        itemWidth:10,
                        itemHeight:10
                    },
                    //设置打印格式
                    toolbox: {
                        // itemSize:20,
                        // top:20,
                        // iconStyle:{
                        //     normal:{
                        //         textPosition:'left'
                        //     },
                        //     emphasis:{
                        //         textPosition:'top'
                        //     }
                        // },
                        show: true,
                        feature: {
                            mark:{show:true},
                            dataZoom: { //数据缩放视图
                                show: true,
                                iconStyle:{
                                    normal:{
                                        //color:'lightblue',//设置颜色
                                        borderColor:'#1dd2d9',
                                    }
                                },
                            },
                            //自定义工具条
                            myRestore:{
                                show:true,//是否显示    
                                title:'重置', //鼠标移动上去显示的文字    
                                icon:'image://images/restore.png', //图标
                                onclick:function(option1) {//点击事件,这里的option1是chart的option信息 
                                    myChart.clear(),  
                                    myChart.setOption(option);
                                }
                            },
                            //白天模式
                            mySun:{
                                show:true,//是否显示    
                                title:'白天模式', //鼠标移动上去显示的文字    
                                icon:'image://images/sun.png', //图标
                                onclick:(option1)=> {//点击事件,这里的option1是chart的option信息 
                                    myChart.clear();
                                    this.backgroundColor='f5f7fa';
                                    this.Seriescolor=this.sunSeriescolor;
                                    this.innerBackgroundColor='rgba(255,255,255,1)';
                                    myChart.clear;
                                    this.TrendSearch();
                                }
                            },
                            //黑夜模式
                            myMoon:{
                                show:true,//是否显示    
                                title:'黑夜模式', //鼠标移动上去显示的文字    
                                icon:'image://images/moon.png', //图标
                                onclick:(option1)=>{//点击事件,这里的option1是chart的option信息 
                                    myChart.clear();
                                    this.backgroundColor='656d78';  
                                    this.Seriescolor=this.moonSeriescolor;
                                    this.innerBackgroundColor='rgba(170,178,189,0.5)';
                                    myChart.clear;
                                    this.TrendSearch();
                                }
                            },
                            dataView: { //数据视图
                                show: true,                         //是否显示该工具。
                                title:"历史数据一览表",
                                readOnly: true,
                                icon:'image://images/datalist.png', //图标
                                lang: ['数据视图', '关闭','刷新'],  //数据视图上有三个话术，默认是['数据视图', '关闭', '刷新']
                                backgroundColor:"#fff",             //数据视图浮层背景色。
                                textareaColor:"#fff",               //数据视图浮层文本输入区背景色
                                textareaBorderColor:"#333",         //数据视图浮层文本输入区边框颜色
                                textColor:"#000",                    //文本颜色。
                                buttonColor:"#c23531",              //按钮颜色。
                                buttonTextColor:"#fff",             //按钮文本颜色。

                                optionToContent:(opt)=>{
                                    var axisData = opt.series[0].data; //坐标数据
                                    var series = opt.series; //折线图数据
                                    var yAxis=opt.yAxis;
                                    var tdHeads = '<td style="background-color: #ccd1d9;padding: 0 10px;line-height: 31px;border:1px solid #9DB3C5;">时间</td>'; //表头
                                    var tdBodys = ''; //数据
                                    series.forEach(function (item) {
                                        //组装表头
                                        tdHeads += `<td style="background-color: #ccd1d9;padding: 0 10px;line-height: 31px;border:1px solid #9DB3C5;">${item.name}</td>`;
                                    });

                                    var table = `<div style="overflow-y:auto;height: 100%;"><table border="1" 
                                    style="margin-left:20px;border-collapse:collapse;font-size:14px;text-align:center"><tbody><tr>${tdHeads} </tr>`;
                                    for (var i = 0;i< axisData.length; i++) {
                                        for (var j = 0; j < series.length; j++) {
                                            //组装右边的表数据
                                            var colColor=series[j].data[i].validFlag?yAxis[j].nameTextStyle.color:'rgb(255,0,0)';
                                            var colbkColor=series[j].data[i].validFlag?'rgb(255,255,255)':'rgb(230,233,237)';
                                            tdBodys += (`<td style="color:`+colColor+`;background-color:`+colbkColor+`;line-height: 25px;border:1px solid #cad9ea;">${ series[j].data[i].value[1]}</td>`);
                                        }
                                        //组装左侧时间的数据
                                        table += `<tr><td style="padding: 0 10px;border:1px solid #cad9ea;line-height: 25px;">${axisData[i].value[0]}</td>${tdBodys}</tr>`;
                                        tdBodys = '';
                                    }
                                    table += '</tbody></table></div>';
                                    return table;
                                } 
                            },
                            //下载
                            saveAsImage: {
                                icon:'image://images/download.png', //图标
                                show:true,//是否显示工具栏
                                excludeComponents :['toolbox'],//保存为图片时忽略的工具栏
                                pixelRatio: 2,//保存图片的分辨率比例，默认跟容器相同大小，如果需要保存更高分辨率的，可以设置为大于 1 的值
                                title: '导出成图片', 
                                name: 'hisData', 
                                type:'png'
                            },
                        }
                    },
                    // 设置 x 轴的样式
                    xAxis: {
                        name: '时间',
                        type: 'time',
                        // boundaryGap: false, //x下标在刻度处显示
                        splitLine: {
                            show: true, //想要不显示网格线，改为false
                            lineStyle: {
                                // 设置网格为虚线
                                type: 'dashed'
                            }
                        },
                        // splitArea: { show: true }, //保留网格区域
                        // 设置刻度线的颜色等样式
                        axisRainbow: {
                            lineStyle: {
                                color: 'black',//x轴的颜色
                                width: 2//轴线的宽度
                            }
                        }
                    },
                    // 设置 y 轴的样式
                    yAxis: yStyleAllData,
                    // 设置每条曲线的数据和样式
                    series: AllData,
                    // 设置鼠标hover时的提示信息
                    tooltip: {
                        trigger: 'axis', // 有3个属性值 axis   item   none
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#6a7985' //配置展示方块的背景颜色
                            }
                        },
                        //提示文字
                        // formatter:function(params){
                        //     var tipText="";
                        //     params.forEach(function(item,index){
                        //         tipText+="111";
                        //         });
                        //     return tipText;
                        // }
                    },
                    // 定义图样和每条曲线的颜色
                    color: this.Seriescolor,
                    // 调整表格两边空白的区域
                    grid: {
                        x: (this.paraNameselected.length % 2) == 0 ? (flag < (this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70)//选中基数个点
                            : (flag <= parseInt(this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70),//选中偶数个点
                        y: '10%',//上
                        x2: (this.paraNameselected.length % 2) == 0 ? (flag < (this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70)//选中基数个点
                            : (flag <= parseInt(this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70),//选中偶数个点
                        y2: '15%'//下
                    },
                    //添加缩放滚动
                    dataZoom: [{  //于区域缩放
                        type: 'inside',
                        start: 0,
                        end: 100
                    }, {
                        start: 0,
                        end: 10,
                        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                        handleSize: '80%',
                        handleStyle: {
                            color: '#fff',
                            shadowBlur: 3,
                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        }
                    }],
                };
                myChart.setOption(option);
                $(window).resize(function(){
                    myChart.resize();
                });

                window.onresize = myChart.resize;
            });
        },

        //趋势彩虹图
        GetSpcAnalysis(val){
            this.$nextTick(function () {
                this.stopTips = "";
                if(val.BATCHID && val.PROPERTYID){
                    var isNowStop = selfSql_One("select v.CmdID,v.TaskID,v.BatchID,s.FLOWDATAITEMID from V_PRDPLAN v left join PRD_CELL_STOPCONFIG s on s.unitid = v.UnitID where v.cmdSchedStatus = 2 and s.isalarming =1 and v.taskid like '"+val.BATCHID+"__' and v.UnitID ='"+val.PROPERTYID+"'");
                    var stopAns = selfSql_One("select distinct stopclass from PRD_CELLTASK_STOPRECORD where TASKID like '"+val.BATCHID+"__' and EQUIPMENTID ='"+val.PROPERTYID+"' order by stopclass");
                    //正在生产的任务存在断料或流量波动
                    if(isNowStop.d.length >0){
                        var realflow = loaddataCDB(0, [isNowStop.d[0]['FLOWDATAITEMID']]);
                        if(realflow.s == 0){
                            if(realflow.d[isNowStop.d[0]['FLOWDATAITEMID']] < 30)
                                this.stopTips+='正在断料';
                            else
                                this.stopTips+='正在流量波动';
                        }
                        else{
                            this.stopTips+='读流量异常';
                        }
                    }
                    else if(stopAns.d.length>0){
                        stopAns.d.forEach((item,i)=>{
                            if(item.STOPCLASS ==1)
                                this.stopTips+='断料';
                            else if(item.STOPCLASS ==2){
                                if(i>0) this.stopTips+='+';
                                this.stopTips+='流量波动';
                            }

                        })
                    }
                    else{
                        this.stopTips = '无异常';
                    }
                }
                
                this.SpcData = loaddataQSPC(val.BATCHID, null, null, -1, val.PROPERTYID);
                
                if(!this.SpcData) {
                    this.$message({
                        type: 'warning',
                        message: "该数据点未进行数据采集！"
                    });
                    return;
                }
                else{
                    this.SpcData = this.SpcData.d;
                }

                if (this.SpcData) {
                    var chart = $('#RainbowChart').highcharts();
                    if(chart){
                        for (var n = 0; n < chart.series.length;) {
                            chart.series[n].remove();//是否在删除数据列后对图表进行重绘操作
                        }
                    }
                    chart = Highcharts.chart('RainbowChart', {
                        chart: {
                            zoomType: 'x',//沿X缩放
                            panning: true,//平移
                            panKey: 'shift',//平移键
                            animation:false,//取消动画
                        },
                        title: {
                            text: val.BATCHID+"-"+val.MATNAME+"-"+val.PROPERTYNAME,
                            style: {
                                color: '#1b7a8f',
                                fontWeight: 800,
                                fontSize: '20px'
                            },
                        },
                        credits: {
                            enabled: false //去除版权信息
                        },
                        exporting: {//导出
                            buttons: {
                                contextButton: {
                                    menuItems: ['printChart', 'downloadPNG', 'downloadCSV']
                                }
                            },
                        },
                        plotOptions: {//数据列配置
                            series: {
                                turboThreshold: 100000,//性能阈值
                                cursor: 'default',//光标形状
                                events: {//事件
                                    click: function (p) {
                                    }
                                }
                            }
                        },
                        xAxis: {
                            title: {
                                formatter:function(){
                                    return '';//去除横坐标标识
                                }
                            },
                            labels:{
                                style:{
                                    fontSize:'14px'
                                },
                            },
                            type: 'datetime',
                            dateTimeLabelFormats: {
                                second: '%H:%M:%S'
                            }
                        },
                        yAxis: {
                            lineWidth: 2,//基线宽度
                            title: {
                                text: ".",
                                style:{
                                    fontSize:'12px',
                                    color:"#fff",
                                },
                            },
                            //使图形中没有空白区域
                            endOnTick: false,//不强制结束于刻度线
                            startOnTick: false,//不强制开始于刻度线
                            labels: {
                                formatter:function(){
                                    return '';//去除纵坐标
                                }
                            }
                        },
                        tooltip: {//数据提示框
                            shared: true,//当提示框被共享时，整个绘图区都将捕捉鼠标指针的移动
                            crosshairs: [true, true],//十字准心
                            //valueDecimals: 5,
                            xDateFormat: '%Y-%m-%d %H:%M:%S',//时间轴格式化
                        },
                        legend: {//图例
                            enabled: false//图例开关
                        }
                    });
                    
                    chart.yAxis[0].update({
                        gridLineColor: '#C0C0C0',//去除网格线
                        gridLineWidth: 0,//去除网格线
                    });
                    //移除标识区
                    chart.yAxis[0].removePlotBand('band1');
                    chart.yAxis[0].removePlotBand('band2');
                    chart.yAxis[0].removePlotBand('band3');
                    chart.yAxis[0].removePlotBand('band4');
                    chart.yAxis[0].removePlotBand('band5');
                    //移除标示线
                    chart.yAxis[0].removePlotLine('mark1');
                    chart.yAxis[0].removePlotLine('mark2');
                    chart.yAxis[0].removePlotLine('mark3');
                    chart.yAxis[0].removePlotLine('mark4');
                    chart.yAxis[0].removePlotLine('mark5');
                    //添加标示线
                    //标准线
                    chart.yAxis[0].addPlotLine({
                        color: '#0005c9',
                        dashStyle: 'Dot',//样式
                        width: 1.5,
                        value: TaskSchedule.SpcData.CtlDataInfo.CL,
                        zIndex: 3, //标示线的层叠
                        label: {
                            text: /* '控制标准线CL=' +  */TaskSchedule.SpcData.CtlDataInfo.CL,
                            align: 'left',//文本显示在右边
                            x: -38, //标签相对于被定位的位置水平偏移的像素，重新定位，水平居右10px
                            style: {
                                color: '#000',//字体颜色
                                // fontWeight: 'bold', //字体加粗
                                fontSize:'10px'
                            }
                        },
                        id: 'mark1'
                    });
                    //上限
                    chart.yAxis[0].addPlotLine({
                        color: '#FF4040',
                        dashStyle: 'Dash',//样式
                        width: 0,
                        value: TaskSchedule.SpcData.CtlDataInfo.UCL,
                        zIndex: 3, //标示线的层叠
                        label: {
                            text: /* '控制上限UCL=' +  */TaskSchedule.SpcData.CtlDataInfo.UCL,
                            align: 'left',//文本显示在右边
                            x: -38, //标签相对于被定位的位置水平偏移的像素，重新定位，水平居右10px
                            style: {
                                color: '#000',
                                // fontWeight: 'bold',
                                fontSize:'10px'
                            }
                        },
                        id: 'mark2'
                    });
                    //下限
                    chart.yAxis[0].addPlotLine({
                        color: '#FF4040',
                        dashStyle: 'Dash',//样式
                        width: 0,
                        value: TaskSchedule.SpcData.CtlDataInfo.LCL,
                        zIndex: 3, //标示线的层叠
                        label: {
                            text: /* '控制下限LCL=' +  */TaskSchedule.SpcData.CtlDataInfo.LCL,
                            align: 'left',//文本显示在右边
                            x: -38, //标签相对于被定位的位置水平偏移的像素，重新定位，水平居右10px
                            style: {
                                color: '#000',
                                // fontWeight: 'bold',
                                fontSize:'10px'
                            }
                        },
                        id: 'mark3'
                    });
                    var max = TaskSchedule.SpcData.QuaDataInfo.UPPERLIMITV;
                    var min = TaskSchedule.SpcData.QuaDataInfo.LOWERLIMITV;
                    var num = 0;
                    if (parseInt(max) !== parseFloat(max) && parseInt(min) !== parseFloat(min)){//是小数
                        num = Math.max((max.toString().split(".")[1].length),(min.toString().split(".")[1].length)) + 1//在最大值或最小值里面取位数最长的一个
                    }else if(parseInt(max) === parseFloat(max) && parseInt(min) !== parseFloat(min)){//如果最大值是整数，看最小值的位数
                        num = min.toString().split(".")[1].length + 1;
                    }else if(parseInt(max) !== parseFloat(max) && parseInt(min) === parseFloat(min)){//如果最小值是整数，看最大值的位数
                        num = max.toString().split(".")[1].length + 1;
                    }else{
                        num = 2;
                    }
                    //上警示线
                    chart.yAxis[0].addPlotLine({
                        color: '#FF4040',
                        dashStyle: 'Dash',//样式
                        width: 1,
                        value: (TaskSchedule.SpcData.CtlDataInfo.UCL + TaskSchedule.SpcData.CtlDataInfo.CL) / 2,
                        zIndex: 3, //标示线的层叠
                        label: {
                            text: ((TaskSchedule.SpcData.CtlDataInfo.UCL + TaskSchedule.SpcData.CtlDataInfo.CL) / 2).toFixed(num),
                            align: 'left',//文本显示在右边
                            x: -38, //标签相对于被定位的位置水平偏移的像素，重新定位，水平居右10px
                            style: {
                                color: '#000',
                                // fontWeight: 'bold',
                                fontSize:'10px'
                            }
                        },
                        id: 'mark4'
                    });
                    //下警示线
                    chart.yAxis[0].addPlotLine({
                        color: '#FF4040',
                        dashStyle: 'Dash',//样式
                        width: 1,
                        value: (TaskSchedule.SpcData.CtlDataInfo.LCL + TaskSchedule.SpcData.CtlDataInfo.CL) / 2,
                        zIndex: 3, //标示线的层叠
                        label: {
                            text: ((TaskSchedule.SpcData.CtlDataInfo.LCL + TaskSchedule.SpcData.CtlDataInfo.CL) / 2).toFixed(num),
                            align: 'left',//文本显示在右边
                            x: -38, //标签相对于被定位的位置水平偏移的像素，重新定位，水平居右10px
                            style: {
                                color: '#000',
                                // fontWeight: 'bold',
                                fontSize:'10px'
                            }
                        },
                        id: 'mark5'
                    });

                    //上绿区下，上线
                    var greenFrom1 = TaskSchedule.SpcData.CtlDataInfo.CL;//标准
                    var greenTO1 = (TaskSchedule.SpcData.CtlDataInfo.UCL + TaskSchedule.SpcData.CtlDataInfo.CL) / 2;//（上限+标准）/2
                    //下绿区下，上线
                    var greenFrom2 = (TaskSchedule.SpcData.CtlDataInfo.LCL + TaskSchedule.SpcData.CtlDataInfo.CL) / 2;//（下限+标准）/2
                    var greenTO2 = TaskSchedule.SpcData.CtlDataInfo.CL;//标准
                    //上黄区下，上线
                    var yellowFrom1 = (TaskSchedule.SpcData.CtlDataInfo.UCL + TaskSchedule.SpcData.CtlDataInfo.CL) / 2;//（上限+标准）/2
                    var yellowTO1 = TaskSchedule.SpcData.CtlDataInfo.UCL;//上限
                    //下黄区下，上线
                    var yellowFrom2 = TaskSchedule.SpcData.CtlDataInfo.LCL;//下限
                    var yellowTO2 = (TaskSchedule.SpcData.CtlDataInfo.LCL + TaskSchedule.SpcData.CtlDataInfo.CL) / 2;//（下限+标准）/2

                    //上红区 下，上 线
                    var redFrom1 = TaskSchedule.SpcData.CtlDataInfo.UCL;//上限
                    //最大值 > (3*上限-标准)/2 ? 最大值 : (3*上限-标准)/2
                    var redTO1 = (3 * TaskSchedule.SpcData.CtlDataInfo.UCL - TaskSchedule.SpcData.CtlDataInfo.CL) / 2;
                    var redTO1 = TaskSchedule.SpcData.QuaDataInfo.MAXV > redTO1 ? TaskSchedule.SpcData.QuaDataInfo.MAXV : redTO1;
                    //下红区 下，上 线
                    //最小值<(3*下限-标准)/2?最小值:(3*下限-标准)/2
                    var redFrom2 = (3 * TaskSchedule.SpcData.CtlDataInfo.LCL - TaskSchedule.SpcData.CtlDataInfo.CL) / 2;
                    var redFrom2 = TaskSchedule.SpcData.QuaDataInfo.MINV < redFrom2 ? TaskSchedule.SpcData.QuaDataInfo.MINV : redFrom2;
                    var redTO2 = TaskSchedule.SpcData.CtlDataInfo.LCL;//下限


                    //绿区
                    chart.yAxis[0].addPlotBand({//动态添加标识区
                        from: greenFrom1,//标准
                        to: greenTO1,//（上限+标准）/2
                        color: '#00ff00',
                        label: {
                            zIndex:1024,
                            // text: '目标区上：数量=' + (TaskSchedule.SpcData.QuaDataInfo.QUATUCOUNT?TaskSchedule.SpcData.QuaDataInfo.QUATUCOUNT:0) + "  比例=" + TaskSchedule.SpcData.QuaDataInfo.QUATUV + "%",
                            style:{
                                fontSize:'12px'
                            }
                        },
                        id: 'band1'
                    });
                    chart.yAxis[0].addPlotBand({//动态添加标识区
                        from: greenFrom2,//（下限+标准）/2
                        to: greenTO2,//标准
                        color: '#00ff00',
                        label: {
                            zIndex:1024,
                            // text: '目标区下：数量=' + (TaskSchedule.SpcData.QuaDataInfo.QUATLCOUNT?TaskSchedule.SpcData.QuaDataInfo.QUATLCOUNT:0) + "比例=" + TaskSchedule.SpcData.QuaDataInfo.QUATLV + "%",
                            style:{
                                fontSize:'12px',
                            }
                        },
                        id: 'band1'
                    });
                    //黄区
                    chart.yAxis[0].addPlotBand({
                        from: yellowFrom1,// （上限+标准）/ 2
                        to: yellowTO1,//上限
                        color: '#ffff00',
                        label: {
                            zIndex:1024,
                            // text: '预警区上：数量=' + (TaskSchedule.SpcData.QuaDataInfo.QUAUCOUNT?TaskSchedule.SpcData.QuaDataInfo.QUAUCOUNT:0) + "  比例=" + TaskSchedule.SpcData.QuaDataInfo.QUAUV + "%",
                            style:{
                                fontSize:'12px'
                            }
                        },
                        id: 'band2'
                    });
                    
                    chart.yAxis[0].addPlotBand({
                        from: yellowFrom2,//（下限+标准）/2
                        to: yellowTO2,//下限
                        color: '#ffff00',
                        label: {
                            zIndex:1024,
                            // text: '预警区下：数量=' + (TaskSchedule.SpcData.QuaDataInfo.QUALCOUNT?TaskSchedule.SpcData.QuaDataInfo.QUALCOUNT:0) + "  比例=" + TaskSchedule.SpcData.QuaDataInfo.QUALV + "%",
                            style:{
                                fontSize:'12px'
                            }
                        },
                        id: 'band3'
                    });

                    //红区
                    if(TaskSchedule.SpcData.QuaDataInfo.OVERUCOUNT){
                        chart.yAxis[0].addPlotBand({
                            from: redFrom1,//上线
                            to: redTO1,//最大值>(3*上限-标准)/2?最大值:(3*上限-标准)/2
                            color: '#ff0000',
                            label: {
                                zIndex:1024,
                                // text: '超上限区：数量=' + (TaskSchedule.SpcData.QuaDataInfo.OVERUCOUNT?TaskSchedule.SpcData.QuaDataInfo.OVERUCOUNT:0) + "  比例=" + TaskSchedule.SpcData.QuaDataInfo.OVERUV + "%",
                                style:{
                                    fontSize:'12px'
                                }
                            },
                            id: 'band4'
                        });
                    }
                    
                    if(TaskSchedule.SpcData.QuaDataInfo.OVERLCOUNT){
                        chart.yAxis[0].addPlotBand({
                            from: redFrom2,//最小值<(3*下限-标准)/2?最小值:(3*下限-标准)/2
                            to: redTO2,//下线
                            color: '#ff0000',
                            label: {
                                zIndex:1024,
                                // text: '超下限区：数量=' + (TaskSchedule.SpcData.QuaDataInfo.OVERLCOUNT?TaskSchedule.SpcData.QuaDataInfo.OVERLCOUNT:0) + "  比例=" + TaskSchedule.SpcData.QuaDataInfo.OVERLV + "%",
                                style:{
                                    fontSize:'12px'
                                }
                            },
                            id: 'band5'
                        });
                    }
                    //设置y轴的最大最小值，保证所有的超上下限区位置
                    if(TaskSchedule.SpcData.QuaDataInfo.OVERUCOUNT == 0){//上红区没值也保留上黄区
                        chart.yAxis[0].update({ max: yellowTO1 });
                    }
                    if(TaskSchedule.SpcData.QuaDataInfo.OVERLCOUNT == 0){//下红区没值也保留到下黄区
                        chart.yAxis[0].update({ min: yellowFrom2, });
                    }

                    var obj = new Object();
                    obj.name = "【" + val.PROPERTYNAME + "】";
                    obj.data = new Array();
                    for (var i = 0; i < this.SpcData.CtlDataInfo.DocTimes.length; i++) {
                        var point = new Object();
                        point.x = Date.parse(this.SpcData.CtlDataInfo.DocTimes[i], "yyyy-MM-dd HH:mm:ss") + 8 * 60 * 60 * 1000;
                        point.y = this.SpcData.CtlDataInfo.Datas[i];
                        point.color = "#0005c9";
                        obj.data.push(point);
                    }
                    obj.lineColor = "#0005c9";

                    chart.addSeries(obj);//添加数据
                } else {
                    $('#RainbowChart').highcharts().destroy();
                }
            });
        }
    }
});

/*构造table中的数据 */
function getTreeNodedata(tablename, parentcol, parentvalue, istreenode, isinuse, idcol, labelcol) {
    var nodedata = [];
    var strfilter = [{ "cn": parentcol, "cp": (parentvalue == null) ? "is" : "=", "v1": parentvalue, "v2": null }];
    if (isinuse != null) {
        strfilter.push({ "cn": "ISINUSE", "cp": "=", "v1": isinuse, "v2": null });
    }
    nodedata = loaddata(tablename, strfilter).d;
    if (nodedata == null) //任何情况下若nodedata为null，则重新初始化数组
        nodedata = [];
    else {
        if (nodedata.length > 0 && istreenode) { //若不是树节点了，则不需要修改json对象
            nodedata.forEach(n => { //修改json对象以符合树控件数据源要求
                n.value = n[idcol];
                n.label = n[labelcol]; //树控件显示
                n.children = []; //初始化子节点对象
            })
        }
    }
    return nodedata;
}