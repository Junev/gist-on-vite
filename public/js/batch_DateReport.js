
window.onload = () => {
    var bodyel = document.getElementsByTagName("body")[0];
    var bodyheight = document.body.clientHeight;
    bodyel.style.height = (bodyheight).toString() + "px";
}


var equiptagconfig = new Vue({//树的VUE对象
    el: "#trendrainbow",
    data() {
        return {
            datList: [],
            datList_label: [],
            tableHeight: 500,
            seldate: '',

            line_sel: 'B线',
            lineID_sel: 'prlineB',//当前生产段选择id
            lineList: [],

            batchTableList: [],
            timepick: '',


            qmmodel: [],
            qmsdata: [],
            qmmodel_all: [],
            daycol: [],
            modelID_sel: '0',
            modelText: '',
            modelList: [],

            spanArr: [],
            spanArr_all: [],
            posion: 0,

            bdhead: [],
            bdhead2: [],

            bdhead_shift: [],
            bdhead2_shift: [],
            //scorecol: [],
            //valuecol: [],
            valuecol: [],
            daycount: 0,
            radio: 0,

            isshift: true,
            isshiftScore: false,
        };
    },

    mounted() {
        this.tableHeight = window.getComputedStyle(this.$refs.tablediv).height;
        this.tableWidth = window.getComputedStyle(this.$refs.tablediv).width - 10;
        this.$nextTick(() => {
            var divh2 = window.getComputedStyle(this.$refs.tablediv).height;
            this.tableHeight = parseInt(divh2) - 2;
        });
        this.initData();

    },

    watch: {

    },

    methods: {
        styleBack({ row, column, rowIndex, columnIndex }) {
            if (this.radio === 4) {
                var score_target = parseFloat(row.NODESCORE).toFixed(0);
                var score_real1 = parseFloat(row.TARGETSCORE_AVG1).toFixed(0);
                var score_real2 = parseFloat(row.TARGETSCORE_AVG2).toFixed(0);
                var score_real3 = parseFloat(row.TARGETSCORE_AVG3).toFixed(0);
                if (row.PNODEID != 'totalscore') {
                    if (score_target != score_real1 && columnIndex == 6) {
                        return { backgroundColor: "#fcfddede" };
                    }
                    else if (score_target != score_real2 && columnIndex == 8) {
                        return { backgroundColor: "#fcfddede" };
                    }
                    else if (score_target != score_real3 && columnIndex == 10) {
                        return { backgroundColor: "#fcfddede" };
                    }
                }

                if (columnIndex == 4) {
                    return { backgroundColor: "#d2ebff48" };
                }

            }
            else {
                var score_target = parseFloat(row.NODESCORE).toFixed(0);
                var score_real = parseFloat(row.TARGETSCORE_AVG).toFixed(0);
                if (row.PNODEID != 'totalscore') {
                    if (score_real != score_target && columnIndex == 7) {
                        return { backgroundColor: "#fcfddede" };
                    }
                }

                if (columnIndex == 4) {
                    return { backgroundColor: "#d2ebff48" };
                }
            }

            // } else if (columnIndex == 1) {
            //     return { backgroundColor: "#FDD56A" };
            // }
        },
        shiftcheckChange(value) {
            var shiftscore = 0;
            if (this.radio === 0) {
                this.isshiftScore = false;
                this.qmmodel = JSON.parse(JSON.stringify(this.qmmodel_all));
                this.spanArr = JSON.parse(JSON.stringify(this.spanArr_all));

            }
            else if (this.radio == 4) {
                this.isshiftScore = true;
                this.qmmodel = JSON.parse(JSON.stringify(this.qmmodel_all));
                this.setShiftScore();
                this.rowspan();
                this.bdhead_shift = ['生产线', '工序', '检测指标', '判定参数', '考核值', '权重', '一班完成值', '一班得分', '二班完成值', '二班得分', '三班完成值', '三班得分'];//平均值、平均得分
                this.bdhead2_shift = ['LINENAME', 'PNODETEXT', 'NODETEXT', 'QVFIELDNAME', 'NODERULDESCRIPTION', 'NODESCORE', 'TARGETVALUE_AVG1', 'TARGETSCORE_AVG1', 'TARGETVALUE_AVG2', 'TARGETSCORE_AVG2', 'TARGETVALUE_AVG3', 'TARGETSCORE_AVG3'];//TARGETVALUE//TARGETSCORE
            }
            else {
                this.isshiftScore = false;
                this.spanArr = [];
                var shiftda_temp = [];
                shiftda_temp = $.Enumerable.From(this.qmmodel_all).Where(qm => qm.SHIFTID == this.radio).ToArray();
                this.qmmodel = JSON.parse(JSON.stringify(shiftda_temp));

                this.qmmodel.forEach(qm => {
                    if (qm.TARGETSCORE_AVG) {
                        var score_temp = parseFloat(qm.TARGETSCORE_AVG);
                        shiftscore = shiftscore + score_temp;
                    }

                })
                shiftscore = shiftscore.toFixed(2);
                var totaslscore = {};
                totaslscore.PNODETEXT = '累计得分';
                totaslscore.PNODEID = 'totalscore';
                totaslscore.TARGETSCORE_AVG = shiftscore;
                this.qmmodel.push(totaslscore);
                this.rowspan();

            }
        },

        setExcelHead() {

            if (this.radio == 4) {

            } else {
                this.bdhead = ['生产线', '工序', '检测指标', '判定参数', '考核值', '权重', '班组', '总平均值', '总平均得分'];//平均值、平均得分
                this.bdhead2 = ['LINENAME', 'PNODETEXT', 'NODETEXT', 'QVFIELDNAME', 'NODERULDESCRIPTION', 'NODESCORE', 'SHIFTNAME', 'TARGETVALUE_AVG', 'TARGETSCORE_AVG'];//TARGETVALUE//TARGETSCORE
            }
        },

        setShiftScore() {
            var shiftmodel_temp = [];
            var shiftArray = [];
            shiftArray = getDistinctList(this.qmmodel_all, 'SHIFTID', 'SHIFTNAME');
            shiftmodel_temp = $.Enumerable.From(this.qmmodel_all).Where(qm => qm.SHIFTID == 1).ToArray();
            this.qmmodel = JSON.parse(JSON.stringify(shiftmodel_temp));
            var totaslscore = {};
            shiftArray.forEach(sh => {
                var shiftda_temp = [];
                shiftda_temp = $.Enumerable.From(this.qmmodel_all).Where(qm => qm.SHIFTID == sh.value).ToArray();
                var shiftda = [];
                var shiftscore = 0;
                var score_temp = 0;
                this.qmmodel.forEach(qm => {
                    shiftda = $.Enumerable.From(this.qmmodel_all).Where(qa => qa.SHIFTID == sh.value && qa.NODEUID == qm.NODEUID).ToArray();
                    if (shiftda)
                        if (shiftda.length > 0) {
                            qm['TARGETVALUE_AVG' + sh.value] = shiftda[0].TARGETVALUE_AVG;//TARGETSCORE_AVG
                            qm['TARGETSCORE_AVG' + sh.value] = shiftda[0].TARGETSCORE_AVG;//TARGETVALUE_AVG
                            if (shiftda[0].TARGETSCORE_AVG)
                                score_temp = parseFloat(shiftda[0].TARGETSCORE_AVG);
                            else
                                score_temp = 0;
                        }

                    shiftscore = shiftscore + score_temp;
                });
                shiftscore = shiftscore.toFixed(2);

                totaslscore.PNODETEXT = '累计得分';
                totaslscore.PNODEID = 'totalscore';
                totaslscore['TARGETSCORE_AVG' + sh.value] = shiftscore;

            })
            this.qmmodel.push(totaslscore);
            //return totaslscore;

        },

        exportExcel() {
            if (this.qmsdata)
                if (this.qmmodel.length > 0) {
                    if (this.radio == 4) {
                        this.getExcel(this.qmmodel, '质量日报表', this.bdhead_shift, this.bdhead2_shift);
                    }
                    else {
                        this.getExcel(this.qmmodel, '质量日报表', this.bdhead, this.bdhead2);
                    }
                }
        },
        getExcel(excelarr, exlname, head, head2) {//准备好格式化过的excel数据内容，再调用exprotex，实现
            var bdbody = [];
            var excelbody = [];
            excelarr.forEach(d => {
                var bditem = {};
                head2.forEach(bd => {
                    bditem[bd] = d[bd];
                });
                bdbody.push(bditem);
            });

            excelbody = formatJson_excelex(head2, bdbody);
            export_json_to_excel(head, excelbody, exlname);//传入表头、数据内容、文件名，来导出excel文件
        },
        //查询按钮点击事件，获取qms
        getQMSClick() {
            this.radio = 0;
            this.isshiftScore = false;
            this.qmmodel_all = [];
            this.setQMSDataTable();
            this.qmmodel_all = JSON.parse(JSON.stringify(this.qmmodel));
            this.spanArr_all = JSON.parse(JSON.stringify(this.spanArr));
        },
        reportClick(value) {
            this.dateList = [];
            this.dateList = loaddata('DAYLIST', [{ 'cn': 'DAYX', 'cp': 'between', 'v1': 'datetime(' + value[0] + ' 00:00:00)', 'v2': 'datetime(' + value[1] + ' 00:00:00)' }]).d;
        },
        setQMSDataTable() {//获取考核报表数据
            if (this.dateList) {
                if (this.dateList.length > 0) {
                    this.daycount = 0;
                    this.daycol = [];
                    this.valuecol = [];
                    this.qmmodel = [];
                    this.qmmodel = this.getQMSmodel(this.lineID_sel, this.modelID_sel, this.dateList[0].DAYX)//获取考核模型列头
                    this.rowspan();//构造单元格合并标记数组


                    this.dateList.forEach((dl, i) => {
                        var dcitem = {};
                        var qmsdata = [];
                        var valuecolitme = {};
                        if (dl.TASKDAY == '1') {
                            this.daycount++;

                            var dlabel = dl.DAYX.substring(0, 10);
                            var dtag = dlabel.replace(/-/g, "");
                            dcitem.id = 'date' + i.toString();
                            dcitem.name = dlabel;
                            dcitem.TARGETVALUE = 'TARGETVALUE' + dtag;
                            dcitem.TARGETSCORE = 'TARGETSCORE' + dtag;
                            dcitem.TARGETVALUE_TOTAL = 'TARGETVALUE_TOTAL' + dtag;
                            dcitem.TARGETSCORE_TOTAL = 'TARGETSCORE_TOTAL' + dtag;
                            dcitem.TASKCOUNT= 'TASKCOUNT' + dtag;
                            dcitem.TASKCOUNT_SHIFT = 'TASKCOUNT_SHIFT' + dtag;


                            valuecolitme.vcol = dcitem.TARGETVALUE;
                            valuecolitme.scol = dcitem.TARGETSCORE;
                            valuecolitme.vcol_total = dcitem.TARGETVALUE_TOTAL;
                            valuecolitme.scol_total = dcitem.TARGETSCORE_TOTAL;
                            valuecolitme.vcount = dcitem.TASKCOUNT;
                            valuecolitme.scount = dcitem.TASKCOUNT_SHIFT;

                            this.valuecol.push(valuecolitme);
                            //datestr = m.DAYX.toString().substring(0, 10);
                            this.bdhead.push('平均值' + dtag);
                            this.bdhead2.push('TARGETVALUE' + dtag);
                            this.bdhead.push('平均得分' + dtag);
                            this.bdhead2.push('TARGETSCORE' + dtag);
                            qmsdata = this.getQMSdata(this.lineID_sel, this.modelID_sel, dlabel);
                            this.daycol.push(dcitem);
                            this.setQMSTarget(dcitem.TARGETVALUE, dcitem.TARGETSCORE, dcitem.TARGETVALUE_TOTAL, dcitem.TARGETSCORE_TOTAL,dcitem.TASKCOUNT,dcitem.TASKCOUNT_SHIFT, qmsdata);

                            // if (qmsdata['TARGETVALUE' + dtag] != null) {
                            //     daycount++;
                            //     scoretotal = scoretotal + qmsdata[i].TARGETSCORE;
                            //     valuetotal = scoretotal + qmsdata[i].TARGETVALUE;
                            // }
                        }

                    });
                    this.getavgData();

                }

                else
                    this.warningUnselected();
            }
            else
                this.warningUnselected();
        },
        getPRODayCount() {

        },
        getavgData() {
            var scoretotal = 0;
            var valuetotal = 0;
            var score_avg = 0;
            var value_avg = 0;
            var valuecount = 0;
            var scorecount = 0;
            if (this.qmmodel)
                if (this.qmmodel.length > 0) {
                    this.qmmodel.forEach(qm => {////TARGETVALUE//TARGETSCORE
                        scoretotal = 0;
                        valuetotal = 0;
                        valuecount = 0;
                        scorecount = 0;

                        if (this.valuecol)
                            if (this.valuecol.length > 0) {
                                this.valuecol.forEach(sc => {

                                    if (qm[sc.vcol_total] != undefined && qm[sc.vcol_total] != null) {
                                        valuecount = valuecount + qm[sc.vcount];
                                        valuetotal = valuetotal + qm[sc.vcol_total];//指标实际值的加总
                                    }
                                    if (qm[sc.scol] != null) {
                                        scorecount=scorecount + qm[sc.scount];
                                        scoretotal = scoretotal + qm[sc.scol_total];//指标得分的加总

                                    }

                                    //     valuetotal = scoretotal + qmsdata[i].TARGETVALUE;
                                })
                            }

                        if (valuecount > 0) {
                            score_avg = scoretotal / scorecount;
                            qm.TARGETSCORE_AVG = score_avg.toFixed(2);
                            value_avg = valuetotal / valuecount;
                            qm.TARGETVALUE_AVG = value_avg.toFixed(2);
                        }
                        else {
                            qm.TARGETVALUE_AVG = null;
                        }
                    })
                }
        },
        getQMSdata(lineid, modelid, qmsday) {
            var data = [];
            var data = loaddata('V_QMS_REPORT_STAVALUES', [
                { 'cn': 'LINEID', 'cp': '=', 'v1': lineid, 'v2': null },//lineid
                { 'cn': 'ASESSMENTUID', 'cp': '=', 'v1': modelid, 'v2': null },//modelid
                { 'cn': 'DAYX', 'cp': '=', 'v1': 'datetime(' + qmsday + ' 00:00:00)', 'v2': null }]).d;//qmsdate[datetime(2021-4-07 00:00:00)]
            return data;
        },
        getQMSmodel(lineid, modelid, qmsday) {
            var data = [];
            data = loaddata('V_QMS_REPORT_TITLE', [
                { 'cn': 'LINEID', 'cp': '=', 'v1': lineid, 'v2': null },
                { 'cn': 'ASESSMENTUID', 'cp': '=', 'v1': modelid, 'v2': null },
                { 'cn': 'DAYX', 'cp': '=', 'v1': 'datetime(' + qmsday + ')', 'v2': null }]).d;
            return data;
        },
        setQMSTarget(colTARGETVALUE, colTARGETSCORE, colTARGETVALUE_TOTAL, colTARGETSCORE_TOTAL,colTASKCOUNT,colTASKCOUNT_SHIFT, qmsdata) {

            this.qmmodel.forEach((m, i) => {
                var datestr = '';
                m[colTARGETVALUE] = qmsdata[i].TARGETVALUE;//日报表日均完成值
                m[colTARGETSCORE] = qmsdata[i].TARGETSCORE;//日报表日均得分

                m[colTARGETVALUE_TOTAL] = qmsdata[i].TARGETVALUE_TOTAL;//按天完成值总计（时间区间报表基础数据）
                m[colTARGETSCORE_TOTAL] = qmsdata[i].TARGETSCORE_TOTAL;//按天得分（时间区间报表月报基础数据）
                
                m[colTASKCOUNT] = qmsdata[i].TASKCOUNT;//按天批次取整总计（时间区间报表月报基础数据）
                m[colTASKCOUNT_SHIFT] = qmsdata[i].TASKCOUNT_SHIFT;//按天（占班百分比）批次总计（时间区间报表月报基础数据）
            });

        },
        modelChange(value) {
            this.modelID_sel = value;
            var modelitem = $.Enumerable.From(this.modelList).Where(model => (model.RUID === value)).ToArray();
            if (modelitem)
                if (modelitem.length > 0)
                    this.modelText = modelitem[0].ASESSMENTNAME;

        },

        initData() {
            this.lineList = loaddata('APP_CONFIG', [{ 'cn': 'parentcfg', 'cp': '=', 'v1': 'KYProdLine', 'v2': null }]).d;
            if (this.lineID_sel)
                this.setlinemodel(this.lineID_sel);
            this.bdhead = ['生产线', '工序', '检测指标', '判定参数', '考核值', '权重', '班组', '总平均值', '总平均得分'];//平均值、平均得分
            this.bdhead2 = ['LINENAME', 'PNODETEXT', 'NODETEXT', 'QVFIELDNAME', 'NODERULDESCRIPTION', 'NODESCORE', 'SHIFTNAME', 'TARGETVALUE_AVG', 'TARGETSCORE_AVG'];//TARGETVALUE//TARGETSCORE
            //this.modelList = loaddata('QMS_ASESSMENT', [{ 'cn': 'ISINUSE', 'cp': '=', 'v1': 1, 'v2': null }]).d;

        },

        handleSelectionChange(value) {

        },
        getModelList(lineqmList) {
            if (lineqmList)
                if (lineqmList.length > 0) {
                    this.modelList = [];
                    lineqmList.forEach(lq => {
                        var modelitem = loaddata('QMS_ASESSMENT', [{ 'cn': 'RUID', 'cp': '=', 'v1': lq.PROPERTYVALUE, 'v2': null }]).d;
                        if (modelitem)
                            if (modelitem.length > 0)
                                this.modelList.push(modelitem[0]);
                    })
                }

        },
        //生产线选择事件
        lineClick(value) {
            this.lineID_sel = value;
            var lineitem = $.Enumerable.From(this.lineList).Where(line => (line.CFG_ID === value)).ToArray();
            if (lineitem)
                if (lineitem.length > 0)
                    this.line_sel = lineitem[0].CFG_NAME;

            this.setlinemodel(value);
        },
        setlinemodel(lineid) {
            var lineqm = loaddata('APP_CONFIG_ITEMS', [{ 'cn': 'parentcfg', 'cp': '=', 'v1': 'qm_' + lineid, 'v2': null }]).d;
            if (lineqm)
                if (lineqm.length > 0) {
                    this.modelID_sel = lineqm[0].PROPERTYVALUE;
                    this.modelText = this.getitemname('QMS_ASESSMENT', 'RUID', 'ASESSMENTNAME', this.modelID_sel);
                    this.getModelList(lineqm);
                }
                else {
                    this.modelID_sel = '0';
                    this.modelText = '该线无考核模板';
                }
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
        warningUnselected() {
            this.$message({
                showClose: true,
                type: 'warning',
                message: "请选择报表时间范围后再试"
            });
        },

        //数据点列表为空用户提示
        warningUnselectedBatch() {
            this.$message({
                showClose: true,
                type: 'warning',
                message: "当前暂无生产中的批次。"
            });
        },

        //操作数据成功用户提示
        successInfo_popWin() {
            this.$message({
                showClose: true,
                type: 'success',
                message: "操作成功！"
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
        //获取id对应的name
        /**
         * 
         * @param {} tablename //查询的表名
         * @param {} itemcol //id所在的列名
         * @param {} itmetextcol //name所在的列名
         * @param {} itemid //id值
         */
        getitemname(tablename, itemcol, itmetextcol, itemid) {
            var itemtext = '';
            var iteminfo = [];
            iteminfo = loaddata(tablename, [{ 'cn': itemcol, 'cp': '=', 'v1': itemid, 'v2': null }]).d;
            if (iteminfo)
                if (iteminfo.length > 0)
                    itemtext = iteminfo[0][itmetextcol];
            return itemtext;
        },
        //如果字符中出现PM则+12小时，转换为24小时制时间
        /**
         * @param {} timestr //字符串格式的时间，通过el-date-picker获取，控件中必须设置format="yyyy-MM-dd hh:mm:ss A"
         */
        timeAPM(timestr) {
            var hh24 = "";
            var strhh24 = timestr;
            var amp = timestr.substring(20, 22);
            var hh = timestr.substring(11, 13);
            var strhh = " " + hh.toString() + ":";
            hh = parseInt(timestr.substring(11, 13));//把小时取出并转数字
            if (hh != 0 || hh != "00") {
                if (amp == "PM") {
                    hh24 = (hh + 12).toString();
                    if (hh24 === "24")
                        hh24 = "12";
                    var strhh24 = " " + hh24 + ":";
                    var strhh24 = timestr.replace(strhh, strhh24);
                }
                else if (amp == 'AM' & hh === 12) {
                    hh24 = "00";
                    var strhh24 = " " + hh24 + ":";
                    var strhh24 = timestr.replace(strhh, strhh24);
                }
                strhh24 = strhh24.substring(0, 19);
            }
            return strhh24;
        },
        //系统时间格式化，仅时:分:秒
        getsystimenow() {
            var timenow = myDate.toLocaleString('chinese', { hour12: false });
            timenow = timenow.substring(timenow.length - 8, timenow.length);
            return timenow;
        },
        getbeforedatetime(num) {
            var timestr = '';
            var timenow = (new Date()).toLocaleString('chinese', { hour12: false });
            timenow = timenow.substring(timenow.length - 8, timenow.length);
            timestr = this.beforeDay(num)[0] + ' ' + timenow;//获取当前往前2天的日期+时间
            return timestr;
        },

        //设置日期，当前日期的前num天
        beforeDay(num) {
            var myDate = new Date(); //获取今天日期
            myDate.setDate(myDate.getDate() - (num));
            var dateArray = [];
            var dateTemp;
            var flag = 1;
            for (var i = 0; i < num; i++) {
                dateTemp = myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + "-" + myDate.getDate();
                dateArray.push(dateTemp);
                myDate.setDate(myDate.getDate() + flag);
            }
            return dateArray
        },

        rowspan() {
            if (this.qmmodel)
                if (this.qmmodel.length > 0) {
                    this.spanArr = [];
                    this.position = 0;

                    this.qmmodel.forEach((item, index) => {
                        if (index === 0) {
                            this.spanArr.push(1);
                            this.position = 0;
                            //item.sequence = index + 1
                        } else {
                            if (this.qmmodel[index].PNODEID === this.qmmodel[index - 1].PNODEID) {
                                this.spanArr[this.position] += 1;
                                this.spanArr.push(0);
                                //this.qmmodel[index].sequence = this.qmmodel[index - 1].sequence
                            } else {
                                this.spanArr.push(1);
                                this.position = index;
                                //this.qmmodel[index].sequence = this.qmmodel[index - 1].sequence + 1
                            }
                        }
                    });
                }
        },

        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0) {
                var x = this.spanArr[rowIndex];
                if (this.spanArr[rowIndex] > 0) {
                    return {
                        rowspan: this.spanArr[rowIndex],
                        colspan: 1
                    }
                } else {
                    return {
                        rowspan: 0,
                        colspan: 0
                    }
                }
            }


            // if (columnIndex === 1 || columnIndex === 2 || columnIndex === 3 || columnIndex === 4) {
            //     if (rowIndex % 3 === 0) {//能被三整除
            //         return {
            //             rowspan: 3,
            //             colspan: 1
            //         };
            //     }

            //     else {
            //         return {
            //             rowspan: 0,
            //             colspan: 0
            //         };
            //     }
            // }



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



        //JSdatetime时间格式化，使参数为zsio的api可用
        formatJSdatetime_v(datetime) {
            //获取当前年
            var year = datetime.getFullYear();
            //获取当前月
            var month = (datetime.getMonth() + 1).toString();
            month = (month.length === 1) ? ('0' + month) : month; //不足两位的补0
            //获取当前日
            var date = datetime.getDate().toString();
            date = (date.length === 1) ? ('0' + date) : date;

            var timenow = datetime.toLocaleString('chinese', { hour12: false });
            timenow = timenow.substring(timenow.length - 8, timenow.length);
            var fdatetime = year + '-' + month + '-' + date + ' ' + timenow;
            return fdatetime;
        },

    }
});

//JSdatetime时间格式化，使参数为zsio的api可用
function formatJSdatetime(datetime) {
    //获取当前年
    var year = datetime.getFullYear();
    //获取当前月
    var month = (datetime.getMonth() + 1).toString();
    month = (month.length === 1) ? ('0' + month) : month; //不足两位的补0
    //获取当前日
    var date = datetime.getDate().toString();
    date = (date.length === 1) ? ('0' + date) : date;

    var timenow = datetime.toLocaleString('chinese', { hour12: false });
    timenow = timenow.substring(timenow.length - 8, timenow.length);
    var fdatetime = year + '-' + month + '-' + date + ' ' + timenow;
    return fdatetime;
    //var date2before = this.beforeDay(3)[0] + ' ' + timenow;//获取当前往前2天的日期+时间
    //var tbatch1 = loaddata('PRD_BATCH', [{ "cn": "EXESTARTTIME", "cp": "between", "v1": "datetime(" + date2before + ")", "v2": "datetime(" + datetimenow + ")" }]);
}




