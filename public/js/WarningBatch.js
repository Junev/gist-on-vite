
window.onload = () => {
    var bodyel = document.getElementsByTagName("body")[0];
    var bodyheight = document.body.clientHeight;
    bodyel.style.height = (bodyheight - 5).toString() + "px";
    var tabledivheight = document.getElementById("tablediv");
}


var equiptagconfig = new Vue({//树的VUE对象
    el: "#trendrainbow",
    data() {
        return {
            waitewindialog: false,

            batch_part: '',
            shift1pre: '',
            shift12pre: '',
            shift1: '',
            shift12: '',
            reportData: [],
            reportTable: [],
            shiftlist: [],
            paratypelist: [],

            timepick: '',
            batchTableList: [],
            seltask: {},
            bclist: [],//班次
            batchid: '',

            celllist: [],
            matlist: [],
            addtypelist: [],
            isalarmlist: [],
            dealtypeList: [],

            inoutlist: [],
            paratypelist: [],
            tableHeight: 500,
            filerlist: [
                { 'MAT_ID': [] },
                { 'PROCESSCELLID': [] },
                { 'ADDMAT_TYPE': [] },
                { 'ISALARM': [] },
                { 'DISPOSETYPE': [] }],

            filteritem: [//tcname和colname的对照JSON
                { "elname": "el-table_1_column_1", "colname": "MAT_ID" },
                { "elname": "el-table_1_column_4", "colname": "PROCESSCELLID" },
                { "elname": "el-table_1_column_5", "colname": "ADDMAT_TYPE" },
                { "elname": "el-table_1_column_8", "colname": "ISALARM" },
                { "elname": "el-table_1_column_13", "colname": "DISPOSETYPE" }
            ],
            gsdbhead:
                ['牌号名称', '生产日期', '批次号', '生产工序', '添加物类别', '实际整批掺配精度(%)', '设定整批掺配精度上限(%)', '是否异常批次', '实际掺配比例(%)', '设定掺配比例(%)',
                    '主秤累计量(kg)', '添加物累计量(kg)', '处置类别', '处置描述', '处置人', '更新时间', '说明'],
            gsdbhead2:
                ['MAT_NAME', 'PRDDATE_TXT', 'BATCHIDSHORT', 'CELLNAME', 'ADDMAT_TYPENAME', 'BPREALVALUE', 'BPLIMIT', 'ISALARM_TXT', 'BPERREALVALUE', 'BPSETVALUE',
                    'MAINWV', 'ADDWV', 'DISPOSETYPENAME', 'DISPOSETXT', 'DOCMAN', 'DOCTIME', 'DESCRIPTION'],
            disposeTypeList: [],
            disposeTypeText: '',
            disposeTypeID: '',
            isbp: true,
            iswarning: false,

            dealtxt: '',//异常批次处置结论
            disposeDescrip: '',//备注
            currentrow: [],//当前双击选中的行
            currentbatch: '',//当前行批次信息
            currentbatchcell: '',//当前行工序名称
            currentbatchdetail: '',//当前行其他添加精度计算细节等
            newDisposeFlag: '0',

            warningbatchdealwindialog: false,
            refreshbatchwindialog: false,
            isrealRefresh: false,

            alarmbatch_old: [],
            alarmbatch_new: [],
            alarmbatch_refresh: [],
        };
    },

    mounted() {
        this.initFilterList();
        this.alarmbatch_old = this.getReportData_bp(false, true);
        this.$nextTick(() => {
            var divh2 = window.getComputedStyle(this.$refs.tablediv).height;
            this.tableHeight = parseInt(divh2) - 5;
        });
    },

    watch: {


    },

    methods: {
        initFilterList() {
            if (this.reportData) {
                this.matlist = getDistinctList(this.reportTable, 'MAT_ID', 'MAT_NAME');
                this.celllist = getDistinctList(this.reportTable, 'PROCESSCELLID', 'CELLNAME');
                this.addtypelist = getDistinctList(this.reportTable, 'ADDMAT_TYPE', 'ADDMAT_TYPENAME');
                this.dealtypeList = [{ 'value': '0', 'text': '未处置' },
                { 'value': '1', 'text': '待处置' },
                { 'value': '2', 'text': '已处置' }]
            }

            this.disposeTypeList = this.getEnumCompareList('WarningBatchDisposeType', false);
            this.isalarmlist = [{ 'value': 1, 'text': '异常' }]
        },

        //获取由于掺兑精度异常原因所产生的异常批次
        getReportData_bp(isalarm, isalarmonly, isUnPublished) {
            var reportTable_temp = [];
            if (isalarm) {//用于实时预警，仅显示未处置和待处置的掺兑条目
                this.reportTable = [];
                var table_null = loaddata('V_BLENDPRECISION', [
                    { 'cn': 'ISALARM', 'cp': '=', 'v1': 1, 'v2': null },
                    { 'cn': 'DISPOSETYPE', 'cp': 'is', 'v1': null, 'v2': null }]).d;//异常批次处置(0未处置1已处置2待处置)

                var table_01 = loaddata('V_BLENDPRECISION', [
                    { 'cn': 'ISALARM', 'cp': '=', 'v1': 1, 'v2': null },
                    { 'cn': 'DISPOSETYPE', 'cp': '<', 'v1': 2, 'v2': null }]).d;//DISPOSETYPE
                reportTable_temp = $.Enumerable.From(table_null).Union(table_01).ToArray();//取并集（以间接实现sql中的or条件）
                this.reportTable = JSON.parse(JSON.stringify(reportTable_temp));

                this.initFilterList();
            }
            else if (isalarmonly) {//显示所有异常批次
                this.reportTable = [];
                reportTable_temp = loaddata('V_BLENDPRECISION', [
                    { 'cn': 'ISALARM', 'cp': '=', 'v1': 1, 'v2': null }]).d;//DISPOSETYPE
                this.reportTable = JSON.parse(JSON.stringify(reportTable_temp));
                this.initFilterList();
            }
            else if (isUnPublished) {
                reportTable_temp = loaddata('V_BLENDPRECISION', [
                    { 'cn': 'ISALARM', 'cp': '=', 'v1': 1, 'v2': null },
                    { 'cn': 'PUBLISHSTATUS', 'cp': 'is', 'v1': null, 'v2': null }]).d;//未推送过的异常批次数据
                //
            }
            return reportTable_temp;
        },
        getReportData_avg() {

        },
        getExcelClick() {
            if (this.reportTable)
                if (this.reportTable.length > 0) {
                    this.exportExcel(this.reportTable);
                }
        },
        exportExcel(tableData) {
            var excelarr = [];
            excelarr = JSON.parse(JSON.stringify(tableData));//初始化excelarr数据
            if (this.filerlist) {
                if (this.filerlist.length > 0) {//若所有列条件筛选不为空
                    var befarr_ex = [];

                    this.filerlist.forEach(fil => {
                        var finame = '';
                        var nowarr_ex = [];
                        for (var obj in fil) {
                            finame = obj;
                        }
                        if (fil[finame])
                            if (fil[finame].length > 0) {//若当前列条件不为空
                                var befarr = [];
                                var unionarr = [];

                                fil[finame].forEach(ficol => {
                                    var nowarr = [];
                                    nowarr = $.Enumerable.From(excelarr).Where(da => da[finame].indexOf(ficol.value, 0) >= 0).ToArray();//不同类条件求交集
                                    unionarr = $.Enumerable.From(nowarr).Union(befarr).ToArray();//同类条件，求并集，
                                    befarr = unionarr;
                                });
                                excelarr = unionarr;
                            }
                    });
                    if (excelarr) {
                        if (excelarr.length > 0) {
                            this.getExcel(this.gsdbhead, this.gsdbhead2, excelarr, '批次添加物掺兑精度报表');
                        }
                    }
                } else {
                    this.getExcel(this.gsdbhead, this.gsdbhead2, excelarr, '批次添加物掺兑精度报表');
                }
            } else {
                this.getExcel(this.gsdbhead, this.gsdbhead2, excelarr, '批次添加物掺兑精度报表');
            }
        },




        getTimeAreaData(save_s, save_e) {
            this.reportTable = loaddata('V_BLENDPRECISION', [
                { 'cn': 'EXESTARTTIME', 'cp': 'between', 'v1': 'datetime(' + save_s + ' 00:00:00)', 'v2': 'datetime(' + save_e + ' 23:59:59)' }]).d;
            this.initFilterList();
        },

        setFILTERlist(sourceJson, colid, colname) {
            var filterlist = [];
            var tempArray = [];
            sourceJson.forEach((item) => {
                tempArray.push([item[colid], item[colname]]); // 转化成Map结构，通过键名查找score
            })
            var distMap = new Map(tempArray);
            let obj = Object.create(null);
            for (let [k, v] of distMap) {
                obj[k] = v;
                var x1 = k;
                var x2 = v;
                filterlist.push({ 'value': k, 'text': v });
            }
            return filterlist;
        },

        getExcel(excelnamehead, datahead, excelarr, excelname) {//准备好格式化过的excel数据内容，再调用exportExcel，实现
            var databody = [];
            var excelbody = [];
            excelarr.forEach(da => {
                var dataitem = {};
                datahead.forEach(dh => {
                    dataitem[dh] = da[dh];
                });
                databody.push(dataitem);
            });
            excelbody = formatJson_excelex(datahead, databody);
            export_json_to_excel(excelnamehead, excelbody, excelname);//传入表头、数据内容、文件名，来导出excel文件
        },

        tablefilter(filteritem) {//table控件filter-change方法，用于更新当前table列筛选的最新条件列表filerlist
            var tcname = '';//table控件中的条件数组对象名称，如【el-table_1_column_1】
            var colname = '';//table列绑定的列名，如【MAT_ID】
            var filtemp = {};
            for (var obj in filteritem) {//获取当前传入的tcname
                tcname = obj;
            }
            filtemp = $.Enumerable.From(this.filteritem).Where(f => f.elname == tcname).ToArray();//在tcname和colname的对照JSON中查找当前的对应
            if (filtemp)
                if (filtemp.length > 0) {
                    colname = filtemp[0].colname;
                }
            this.filerlist.forEach(filt => {
                var filtname = ''
                for (var obj in filt) {//获取当前传入的tcname
                    filtname = obj;
                }
                if (filtname == colname) {
                    filt[colname] = [];
                    if (filteritem[tcname])//根据当前的传入条件进行储存（重置后再存相当于保持最新）
                        if (filteritem[tcname].length > 0) {
                            filteritem[tcname].forEach(fi => {
                                filt[colname].push({ 'value': fi });
                            });
                        }
                }
            })
        },

        getBATCHClick() {
            if (this.batch_part) {
                var strLength = this.batch_part.toString().length;
                if (strLength > 3) {
                    this.reportTable = [];
                    this.reportTable = loaddata('V_BLENDPRECISION', [
                        { 'cn': 'BATCHID', 'cp': 'like', 'v1': '%' + this.batch_part + '%', 'v2': null }]).d;
                    this.initFilterList();
                } else {
                    this.warningInfo_popWin('输入数字不能小于4位');
                }

            } else {
                this.warningInfo_popWin('输入条件不能为空');
            }

        },
        matfilter(value, row) {
            return row.MAT_ID === value;
        },

        cellfilter(value, row) {
            return row.PROCESSCELLID === value;
        },

        addtypefilter(value, row) {
            return row.ADDMAT_TYPE === value;
        },

        isalarmfilter(value, row) {
            return row.ISALARM === value;
        },

        dealtypefilter(value, row) {
            return row.DISPOSETYPE === value;
        },



        paratypefilter(value, row) {
            var x = row.ZFINFOTYPEID.substring(row.ZFINFOTYPEID.length - 2, row.ZFINFOTYPEID.length);
            return row.ZFINFOTYPEID.substring(row.ZFINFOTYPEID.length - 2, row.ZFINFOTYPEID.length) === value;
        },

        clearFilter() {
            this.$refs.batchinfo.clearFilter();
            //this.reportTable = [];
            //this.reportTable = JSON.parse(JSON.stringify(this.reportData));
            this.filerlist = [];
            this.filteritem = [];
            filerlist = [
                { 'MAT_ID': [] },
                { 'PROCESSCELLID': [] },
                { 'ADDMAT_TYPE': [] },
                { 'ISALARM': [] },
                { 'DISPOSETYPE': [] }];

            filteritem = [//tcname和colname的对照JSON
                { "elname": "el-table_1_column_1", "colname": "MAT_ID" },
                { "elname": "el-table_1_column_4", "colname": "PROCESSCELLID" },
                { "elname": "el-table_1_column_5", "colname": "ADDMAT_TYPE" },
                { "elname": "el-table_1_column_8", "colname": "ISALARM" },
                { "elname": "el-table_1_column_13", "colname": "DISPOSETYPE" }
            ];
        },
        //取消确认（更新）
        updateDisposeData(batchid, taskid, elementid) {
            var dealitem = {};
            var updateresult = [];
            dealitem.DISPOSETYPE = this.disposeTypeID.toString();
            dealitem.DISPOSETXT = this.dealtxt;
            dealitem.DESCRIPTION = this.disposeDescrip;
            dealitem.DOCMAN = top.LogInfor.UserName;
            dealitem.DOCTIME = 'datetime(' + formatJSdatetime(new Date()) + ')';
            var updatereq = saveData("WARNINGBATCH_RECORD",
                dealitem,
                [{ "cn": "BATCHID", "cp": "=", "v1": batchid, "v2": null },
                { "cn": "TASKID", "cp": "=", "v1": taskid, "v2": null },
                { "cn": "ELEMENTID", "cp": "=", "v1": elementid, "v2": null }]);
            updateresult = RequestHd(updatereq);
            return updateresult.s;
        },
        //保存确认
        addDisposeData(batchid, taskid, elementid, publishSta) {
            var dealitem = {};
            var addresult = [];
            dealitem.BATCHID = batchid;
            dealitem.TASKID = taskid;
            dealitem.ELEMENTID = elementid;
            dealitem.WARNINGTYPEID = '1';
            dealitem.DISPOSETYPE = this.disposeTypeID.toString();
            dealitem.DISPOSETXT = this.dealtxt;
            dealitem.DESCRIPTION = this.disposeDescrip;
            dealitem.PUBLISHSTATUS = publishSta;
            var addreq = addData("mdb\\add", "WARNINGBATCH_RECORD", dealitem);
            addresult = RequestHd(addreq);
            return addresult.s;

        },
        //数据点表，行点击事件
        dtypeChange(value) {
            this.disposeTypeID = value;
        },
        tableRowClick(data) {
            if (data.ISALARM == 1) {
                this.warningbatchdealwindialog = true;
                this.currentrow = data;
                this.currentbatch = data.PRDDATE_TXT + data.MAT_NAME + data.BATCHIDSHORT;
                this.currentbatchcell = data.CELLNAME;
                this.currentbatchdetail = data.ADDMAT_TYPENAME + '实际掺配精度:' + data.BPREALVALUE + '(精度上限：' + data.BPLIMIT + ')';
                this.newDisposeFlag = this.getNewDealFlag(this.currentrow.BATCHID, this.currentrow.TASKID, this.currentrow.ADDMAT_TYPE);
                if (this.newDisposeFlag == 2) {
                    this.disposeTypeText = this.getitemname_list(this.disposeTypeList, 'value', 'text', data.DISPOSETYPE);
                    this.dealtxt = data.DISPOSETXT;
                    this.disposeDescrip = data.DESCRIPTION;
                }
                else if (this.newDisposeFlag == 1) {
                    this.dealtxt = '';
                    this.disposeDescrip = '';
                    this.disposeTypeID = '0';
                    this.disposeTypeText = this.getitemname_list(this.disposeTypeList, 'value', 'text', this.disposeTypeID);
                }
            }
        },
        getNewDealFlag(batchid, taskid, elementid) {
            var disposeTask_temp = [];
            var newDisposeFlag = 0;//无操作
            disposeTask_temp = loaddata('WARNINGBATCH_RECORD', [
                { 'cn': 'BATCHID', 'cp': '=', 'v1': batchid, 'v2': null },
                { 'cn': 'TASKID', 'cp': '=', 'v1': taskid, 'v2': null },
                { 'cn': 'ELEMENTID', 'cp': '=', 'v1': elementid, 'v2': null }]).d;//qmsdate[datetime(2021-4-07 00:00:00)]
            if (disposeTask_temp) {
                if (disposeTask_temp.length == 0) {
                    newDisposeFlag = 1;//可以新增
                }
                else if (disposeTask_temp.length > 0) {
                    newDisposeFlag = 2;//只可修改
                }
            }
            return newDisposeFlag;
        },
        dealClick() {

        },
        saveDataClick() {
            var opresult = 0;
            opresult = this.updateDisposeData(this.currentrow.BATCHID, this.currentrow.TASKID, this.currentrow.ADDMAT_TYPE);
            // if (this.newDisposeFlag == 2)
            //     opresult = this.updateDisposeData(this.currentrow.BATCHID, this.currentrow.TASKID, this.currentrow.ADDMAT_TYPE);
            // else if (this.newDisposeFlag == 1)
            //     opresult = this.addDisposeData(this.currentrow.BATCHID, this.currentrow.TASKID, this.currentrow.ADDMAT_TYPE)

            this.newDisposeFlag = 0;
            this.warningbatchdealwindialog = false;
            if (opresult === 0)
                this.successInfo_popWin('保存');

            this.getReportData_bp(true);
            //验证id是否存在
            //

        },
        cancelSaveClick() {
            this.warningbatchdealwindialog = false;
        },

        isbpClick() {
            if (this.isbp)
                this.isbp = false;
            else
                this.isbp = true;
        },

        iswarningClick() {//实时预警开关按钮单击事件
            if (this.iswarning)
                this.iswarning = false;
            else {
                this.publishinit();
                this.iswarning = true;
                this.getReportData_bp(true);
                this.alarmbatch_old = this.getReportData_bp(false, true);//旧的异常批次数组，初始化/再次启动实时预警，则刷新
                this.alarmbatch_refresh = [];//弹窗提示的最新的异常批次数组，初始化/再次启动实时预警，则清空
                this.timerRefresh();
            }
        },



        setPublish(warrningData) {

            //this.publishWarningMsg(war);
            this.publishWarningMsg(warrningData).then(res => {
                if (res) {
                    if (res.status == 200) {

                        this.addDisposeData(warrningData.BATCHID, warrningData.TASKID, warrningData.ADDMAT_TYPE, 1);
                        //推送过后，WARNINGBATCH_RECORD写入数据
                    }
                    else {
                        this.addDisposeData(warrningData.BATCHID, warrningData.TASKID, warrningData.ADDMAT_TYPE, 0);
                    }
                }
                //return res;
            }).catch(err => {
                console.log(err.message);
            });
        },

        publishinit() {
            var warning_unpb = this.getReportData_bp(false, false, true);
            if (warning_unpb)
                if (warning_unpb.length > 0) {
                    warning_unpb.forEach(war => {
                        this.setPublish(war);
                    })
                }//每次刷新数据，看看如果有没推送成功的，再推送一次
        },

        //timeout500ms一次
        timerRefresh() {
            var timer;
            if (this.iswarning) {
                this.refreshAlarmBatch();//调用更新异常批次，并实时刷新
                timer = setTimeout(() => {
                    this.timerRefresh()
                }, 180000);//每3分钟刷新180000ms
            }
            else {
                clearTimeout();
            }
        },
        //更新异常批次
        refreshAlarmBatch() {

            var count_old = 0;
            var count_new = 0;
            var count_refresh = 0;
            this.alarmbatch_new = this.getReportData_bp(false, true);
            if (this.alarmbatch_old)//第一次进来为空
                count_old = this.alarmbatch_old.length;
            else
                count_old = 0
            if (this.alarmbatch_new)
                count_new = this.alarmbatch_new.length;

            count_refresh = count_new - count_old;//判断是否是新增的比原来的多,多几个
            if (count_refresh > 0) {
                this.alarmbatch_new = $.Enumerable.From(this.alarmbatch_new).OrderByDescending('$.EXESTARTTIME').ToArray();
                for (i = 0; i < count_refresh; i++) {
                    this.alarmbatch_refresh.push(this.alarmbatch_new[i]);
                    this.setPublish(this.alarmbatch_new[i]);
                }
                this.refreshbatchwindialog = true;
                //this.iswarning = false;//若产生了异常批次，进行弹窗提示，并终止实时刷新
            }

           var that = this;
           setTimeout(function () { that.publishinit(); }, "60000");

        },

        // publishWarningMsg(warningbatchinfo) {
        //     //牌号，日期，批次号，精度异常报警
        //     var msgcontent = warningbatchinfo.PRDDATE_TXT + warningbatchinfo.MAT_NAME + warningbatchinfo.BATCHIDSHORT
        //         + '(' + warningbatchinfo.BATCHID + ')' + warningbatchinfo.CELLNAME +
        //         '[' + warningbatchinfo.ADDMAT_TYPENAME + ']' + '精度异常报警';
        //     var publisStatus = 0;
        //     var postMsg = {
        //         "t": "kyapp\\bpwarning",
        //         "i": null,
        //         "d": warningbatchinfo
        //     };
        //     var posturl = 'http://10.98.59.11:59000/api/MessageCenter?title=异常批次推送&content=' + msgcontent
        //         + '&type=消息类型&pusher_id=109370&pusher_name=施洋&level=消息组&detail=测试组';
        //     console.log(postMsg);
        //     var x = axios.post(posturl,
        //         postMsg, {
        //         //changeOrigin: true,
        //         //responseType: 'blob'
        //     }).then(res => {
        //         //return res;
        //     }).catch(err => {
        //         console.log(err.message);
        //     })
        //     return x;
        // },

        publishWarningMsg(warningbatchinfo) {
            //牌号，日期，批次号，精度异常报警
            var msgtitle = warningbatchinfo.MAT_NAME + warningbatchinfo.BATCHIDSHORT + '批' + warningbatchinfo.ADDMAT_TYPENAME + '精度异常报警';
            var msgcontent = '生产二部智能检测小助手提醒您：' + warningbatchinfo.MAT_NAME + warningbatchinfo.BATCHIDSHORT
                + '批' + warningbatchinfo.CELLNAME + '【' + warningbatchinfo.ADDMAT_TYPENAME + '】掺配精度实际值为' + warningbatchinfo.BPREALVALUE
                + '%，已超出精度标准范围（标准值：±' + warningbatchinfo.BPLIMIT + '%）'
                + '，请及时关注处理！';
            var publisStatus = 0;
            var postMsg = {
                "t": "kyapp\\bpwarning",
                "i": null,
                "d": warningbatchinfo
            };
            var posturl = 'http://10.98.59.11:59000/api/MessageCenter?title=' + msgtitle + '&content=' + msgcontent
                + '&type=qty&pusher_id=900001&pusher_name=PMS&level=消息组&detail=异常批次推送组';
            return axios.post(posturl,
                postMsg, {})
        },





        datechange(value) {
            this.getTimeAreaData(value[0], value[1]);
        },

        styleBack({ row, column, rowIndex, columnIndex }) {
            //实际掺配精度
            if (row.ISALARM == 1 && columnIndex == 5) {
                return {
                    color: "#a11c27",
                    fontWeight: 600
                };
            }
            //实际掺配比例
            if (row.ISALARM == 1 && columnIndex == 7) {
                return {
                    color: "#a11c27"
                };
            }


            //异常批次标记
            if (row.ISALARM == 1 && columnIndex == 8) {
                return {
                    color: "#a11c27"
                };
            }

            //设定掺配精度
            if (row.ISALARM == 1 && columnIndex == 6) {
                return {
                    color: "#227bb6",
                    fontWeight: 600
                };
            }
            //设定掺配比例
            if (row.ISALARM == 1 && columnIndex == 9) {
                return {
                    color: "#227bb6",
                    fontWeight: 600
                };
            }




            // } else if (columnIndex == 1) {
            //     return { backgroundColor: "#FDD56A" };
            // }
        },
        //未选中数据用户提示
        warningUnselected() {
            this.$message({
                showClose: true,
                type: 'warning',
                message: "查询条件不完整，可能是[批次]或[数据点]未选择，请调整后再试！"
            });
        },

        //未选中数据用户提示
        errorData() {
            this.$message({
                showClose: true,
                type: 'warning',
                message: "数据格式有误，若无占比请填0，请调整后再试"
            });
        },
        //未选中数据用户提示
        errorShift() {
            this.$message({
                showClose: true,
                type: 'warning',
                message: "开始班次与换班班次不能相等，请调整后再试"
            });
        },

        //数据点列表为空用户提示
        errornot100() {
            this.$message({
                showClose: true,
                type: 'error',
                message: "班次占比之和必须等于100！请调整数据后再试"
            });
        },

        //操作数据成功用户提示
        warningInfo_popWin(optxt) {
            this.$message({
                showClose: true,
                type: 'warning',
                message: '【' + optxt + '】,请调整后再试'
            });
        },

        //操作数据成功用户提示
        successInfo_popWin(optxt) {
            this.$message({
                showClose: true,
                type: 'success',
                message: '【' + optxt + '】操作成功！'
            });
        },

        //去除重复
        /**
         * 
         * @param {} arr //需要去重的数组
         * @param {} item //指定进行去重的列
         * @param {} isIndexChange //是否重排index
         */
        distinctArray(arr, item, isIndexChange) {
            var discArray = [];
            var nid = 0;
            arr.forEach(a => {
                var existItem = [];
                existItem = $.Enumerable.From(discArray).Where(da => da[item] == a[item]).ToArray();
                if (existItem.length == 0) {
                    if (isIndexChange) {
                        var x = a.id;
                        a.id = nid;
                        nid++;
                    }
                    discArray.push(JSON.parse(JSON.stringify(a)));//赋值为新对象
                }
            });
            return discArray;
        },
        //获取id对应的name【从json对象中查询】
        /**
         * 
         * @param {} list //查询的列表对象
         * @param {} itemcol //id所在的列名
         * @param {} itmetextcol //name所在的列名
         * @param {} itemid //id值
         */
        getitemname_list(list, itemcol, itmetextcol, itemid) {
            var itemtext = '';
            var iteminfo = [];
            iteminfo = $.Enumerable.From(list).Where(da => da[itemcol] == itemid).ToArray();
            if (iteminfo)
                if (iteminfo.length > 0)
                    itemtext = iteminfo[0][itmetextcol];
            return itemtext;
        },
        //获取BXT_ENUMERATION中的枚举值对照
        getEnumCompareList(enumName, isfilter, filtercol, filtercp, filterv1, filterv2) {
            var listData = [];
            if (!isfilter)
                listData = loaddata("BXT_ENUMERATION", [{ "cn": "ENUMSET", "cp": "=", "v1": enumName, "v2": null }]).d;
            else
                listData = loaddata("BXT_ENUMERATION", [{ "cn": "ENUMSET", "cp": "=", "v1": enumName, "v2": null },
                { "cn": filtercol, "cp": filtercp, "v1": filterv1, "v2": filterv2 }]).d;
            if (listData)
                if (listData.length > 0) {
                    listData.forEach(t => {
                        t.text = t.ENUMSTRING;//可能作为表头下拉筛选项，修改json对象以符合树控件数据源要求
                        t.value = t.ENUMVALUE;
                    });
                }
            return listData;
        },



        /**
         * 获取树结构的每一层，用户点击时才加载子节点时用
         * @param {} tablename //数据库表名
         * @param {} parentcol //父节点id字段名
         * @param {} parentvalue //父节id值
         * @param {} istreenode//如果不是，则后面的idcol、labelcol可以不必赋值
         * @param {} idcol //树节点id
         * @param {} labelcol //树节点名称，用于显示，与树控件的props属性中一致
         */
        getTreeNodedata_n(tablename, parentcol, parentvalue, istreenode, idcol, labelcol) {
            var nodedata = [];
            var childrennodes = [];
            var strfilter = [{ "cn": parentcol, "cp": (parentvalue == null) ? "is" : "=", "v1": parentvalue, "v2": null }];
            nodedata = loaddata(tablename, strfilter).d;
            if (nodedata == null)//任何情况下若nodedata为null，则重新初始化数组
                nodedata = [];
            else {
                if (nodedata.length > 0 && istreenode) {//若不是树节点了，则不需要修改json对象
                    nodedata.forEach(n => {//修改json对象以符合树控件数据源要求
                        n.nid = n[idcol];
                        n.nlabel = n[labelcol];//树控件显示
                        n.children = [];//初始化子节点对象
                    })
                    nodedata = $.Enumerable.From(nodedata).OrderBy("$." + idcol).ToArray();
                }
            }
            return nodedata;
        },

    }
});





