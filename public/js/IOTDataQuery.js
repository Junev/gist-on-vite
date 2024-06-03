var iotdataquaery = new Vue({ //树的VUE对象
    el: "#iotdataquaery",
    data() {
        return {
          isclean: false, //是否进行数据清洗
          iseasy: false, //是否用简单模式展示
          isanlys: false, //是否统计分析

          controShow: false, //对于时间和批次号的选择做一个标记

          curbatchid: "", //选中的批次ID
          curtaskid: "", //选中的工单ID

          dialogVisible: false, //统计分析的时候填写
          fullscreenLoading: false, //数据加载框

          upval: null, //统计标准上限值
          lowval: null, //统计标准下限值
          standval: null, //统计标准中心值
          bestcenterval: null,//统计最优中心值

          nowhdbdata: [], //当前条件下的时序数据信息

          messagedialog: false, //详细信息展示的抽屉控制
          nowSize: 0, //弹出框中当前选择的点数

          myChart: null, //图
          analysisData: [], //统计分析数据表格
          diffResult: [], //非简易模式下的批次号、工单号、牌号的数据列表
          tableData: [], //动态加载的表格数据

          cols: [], //列数据

          sunSeriescolor: ["#85c1c1", "#c3a783", "#af8cba", "#838ac3", "#c383a1", "#cb927b"], //白天模式
          Seriescolor: [], //当前使用的颜色
          backgroundColor: "f5f7fa", //背景色
          innerBackgroundColor: "rgba(255,255,255,1)", //内框背景色

          RangeTime: [new Date(Date.now() - 3600 * 10), new Date()], //选取时间
          pickerMinDate: null,
          pickerMaxDate: null,
          pickerOptions: {
            onPick: (obj) => {
              this.pickerMinDate = new Date(obj.minDate).getTime();
              this.pickerMaxDate = obj.maxDate ? new Date(obj.maxDate).getTime() : null;
            },
            disabledDate: (time) => {
              if (this.pickerMinDate) {
                const day1 = 1 * 24 * 3600 * 1000;
                let maxTime = this.pickerMinDate + day1;
                let minTime = this.pickerMinDate - day1;

                if (this.pickerMaxDate) this.pickerMinDate = null;
                return (
                  time.getTime() > maxTime ||
                  time.getTime() < minTime ||
                  time.getTime() > new Date(new Date(Date.now()).toLocaleDateString() + " 23:59:59").getTime()
                );
              } else {
                return time.getTime() > new Date(new Date(Date.now()).toLocaleDateString() + " 23:59:59").getTime();
              }
            },
          },

          time_s: "", //选择开始时间
          time_e: "", //选择结束时间

          tablewindialog: false, //控制添加数据点列表弹窗弹窗打开

          //数据点表单筛选
          queryForm: {}, //刷新数据点表的表单
          PropertyGroup: [], //所属分组
          choseTagGro: null, //改变分组后获取分组的编码

          treedata: [], //车间设备树
          selnode: null, //选中的树节点
          curtreetag: [], //树节点对应tag的列表
          paraselected: [], //当前用户选中的数据点
          paraIDselected: [], //用户选中的所有数据点编码
          paraNameselected: [], //用户选中的所有数据点名称

          treeprops: {
            label: "nlabel",
            children: "children",
          },

          condictionAllow: true, //所选择的时间范围是否符合要求
        };
    },

    mounted() {
        this.RangeTimepick();
        this.InitTreeData();
        this.PropertyGroup = this.getProperGro();
        this.Seriescolor = this.sunSeriescolor;
    },
    beforeDestroy() {
        this.myChart.clear();
    },
    watch: {
        //curtreetag：加点弹窗，数据点列表table数据源
        curtreetag: function () {
            this.$nextTick(function () {
                //新的数据作用到DOM的更新之后，调用模板数据点的选中样式改变事件
                if (this.curtreetag.length > 0) {
                    if (this.iscurdata) {
                        if (this.seltagtable)
                            if (this.seltagtable.length > 0)
                                this.setmodeltagselected(this.seltagtable, this.curtreetag);
                    } else {
                        if (this.modeltaglist)
                            if (this.modeltaglist.length > 0)
                                this.setmodeltagselected(this.modeltaglist, this.curtreetag);
                    }
                }
            })
        },
        isanlys: function (isanlys) {
            if (isanlys) {
                this.dialogVisible = true;
            } else {
                this.dialogVisible = false;
                this.standval = null;
                this.upval = null;
                this.lowval = null;
                this.bestcenterval = null;
                this.analysisData = [];
            }
        },
        curbatchid(){
            this.conditionChange();
        },
        curtaskid(){
            this.conditionChange();
        }
    },

    methods: {
        //条件改变后判断是否符合规范
        conditionChange(){
            if (!this.RangeTime) {
                if((!this.curbatchid || this.curbatchid === "") && (!this.curtaskid || this.curtaskid === "")){
                    this.condictionAllow = false;
                    this.$message({
                        "message": "时间范围、批次号、工单号不能同时为空！",
                        "type": "error",
                        "showClose": true,
                    })
                }
                else{
                    this.condictionAllow = true;
                }
            } 
            else {
                var tempflag = this.timeDiff(this.time_s, this.time_e);
                if (!tempflag) {
                    this.$message({
                        "message": "时间范围需在5小时以内！请重新配置时间范围",
                        "type": "warning",
                        "showClose": true,
                    })
                }
            }
        },
        //选择时间改变事件
        RangeTimepick() {
            this.time_s = '';
            this.time_e = '';
            if (!this.RangeTime) {
                this.controShow = true;
            } 
            else {
                this.controShow = false;
                this.time_s = dateTrans(this.RangeTime[0]);
                this.time_e = dateTrans(this.RangeTime[1]);
            }

            this.conditionChange();
        },
        //打开添加数据点列表弹窗事件
        openAddTagWin() {
            this.tablewindialog = true;
            var temp =this.paraselected;
            this.nowSize = 0;
            this.$nextTick(function () {
                this.$refs.propertyTable.clearSelection();
                temp.forEach(item=>{
                    this.$refs.propertyTable.toggleRowSelection(item);
                });
            });
        },
        //更换tag样式
        TecTagType(rowkey) {
            if (rowkey === 'STANDARDV') {
                return 'success'
            }
            if (rowkey === 'UPPERLIMITV') {
                return 'danger'
            }
            if (rowkey === 'LOWERLIMITV') {
                return 'warning'
            }

        },
        //为了防止切换单元之后数据点的选中状态就消失
        getRowKey(row) {
            return row.PROPERTYID;
        },
        //点击打开
        openmesdialog() {
            this.messagedialog = true;
        },
        //意外关闭编辑框
        handleClose(done) {
            if (this.standval === null && this.upval === null && this.lowval === null&& this.bestcenterval === null) {
                this.isanlys = false;
                done();
            }
            this.dialogVisible = false;
        },

        //初始化树节点
        InitTreeData() {
            //查找物理模型的根节点，没有添加任何节点的时候就算没有选中父节点，也允许添加新节点
            this.treedata = $.Enumerable.From(loaddata("BXT_EQUIPELEMENT", [ { "cn": "CONTAINEDIN", "cp": "is", "v1": null, "v2": null }]).d).OrderBy("$.EQUIPMENTID").OrderBy("$.SHOWINDEX").ToArray();
            if (this.treedata)
                if (this.treedata.length > 0) {
                    var rootData = this.treedata[0];
                    rootData.nid = rootData.EQUIPMENTID;
                    rootData.nlabel = rootData.EQUIPMENTNAME;
                    rootData.nodeicon = 'iconpr iconfont icon-yewudanyuan ';
                    rootData.children = [];
                    rootData.children = $.Enumerable.From(this.getTreeNodedata_n("BXT_EQUIPELEMENT", "CONTAINEDIN", rootData.EQUIPMENTID, true, "EQUIPMENTID", "EQUIPMENTNAME")).OrderBy("$.EQUIPMENTID").OrderBy("$.SHOWINDEX").ToArray();
                    rootData.children.forEach(element => {
                        element.children = $.Enumerable.From(this.getTreeNodedata_n("BXT_EQUIPELEMENT", "CONTAINEDIN", element.EQUIPMENTID, true, "EQUIPMENTID", "EQUIPMENTNAME")).OrderBy("$.EQUIPMENTID").OrderBy("$.SHOWINDEX").ToArray();
                    });
                }
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
            if (nodedata == null) //任何情况下若nodedata为null，则重新初始化数组
                nodedata = [];
            else {
                if (nodedata.length > 0 && istreenode) { //若不是树节点了，则不需要修改json对象
                    nodedata.forEach(n => { //修改json对象以符合树控件数据源要求
                        n.nid = n[idcol];
                        n.nlabel = n[labelcol]; //树控件显示
                        n.children = []; //初始化子节点对象
                    })
                }
                if (idcol)
                    nodedata = $.Enumerable.From(nodedata).OrderBy("$." + idcol).ToArray();
            }
            return nodedata;
        },

        //树节点选中事件
        treenodeclick(ndata) {
            //树节点选中事件
            this.selnode = ndata;
            this.curtreetag = [];
            this.paraselected = [];
            this.nowSize = 0;
            this.$refs.propertyTable.clearSelection();
            if (ndata.children.length === 0) {
                var x = this.getTreeNodedata("PDS_EQUIPELEMENT", "PARENTID", ndata.EQUIPMENTID, true, "EQUIPMENTID", "EQUIPMENTNAME");
                ndata.children = $.Enumerable.From(x).OrderBy("$.EQUIPMENTID").ToArray();
            }
            if (!ndata.tags) {
                ndata.tags = [];
                if (ndata.tags.length === 0) {
                    var tempTsd = loaddata("PDS_V_TSDDATA", [{
                        "cn": "EQUIPMENTID",
                        "cp": "=",
                        "v1": this.selnode.EQUIPMENTID,
                        "v2": null
                    }]).d;
                    if (tempTsd) {
                        this.curtreetag = $.Enumerable.From(tempTsd).OrderBy("$.PROPERTYID").ToArray();
                        //console.log(this.curtreetag);
                        ndata.tags = this.curtreetag;
                    } else {
                        this.curtreetag = [];
                    }
                }
            } else {
                this.curtreetag = ndata.tags;
            }
        },
        //合并列
        objectSpanMethod({
            row,
            column,
            rowIndex,
            columnIndex
        }) {
            if (columnIndex > 1) {
                return {
                    rowcpan: 1,
                    colspan: 1
                };
            }

        },
        // 自定义列背景色
        columnStyle({
            row,
            column,
            rowIndex,
            columnIndex
        }) {
            if (columnIndex > 0)
                return "color:" + this.Seriescolor[columnIndex - 1] + ";font-weight:550;fons-size:12px";
            else
                return "";
        },
        //下载按钮点击事件
        downLoadClick() {
            var hisData = []; //历史数据
            var returndata = [];
            if (this.nowhdbdata && this.nowhdbdata != []) {
                returndata = this.nowhdbdata;
            }
            var vtHead = [];
            var cols = [];
            var data = [];

            returndata.d.forEach((item, index) => {
                if (index == 0)
                    vtHead.push("时间");
                vtHead.push(this.paraNameselected[index]);
                vtHead.push("是否有效");

                cols.push(cols.length);
                cols.push(cols.length);
                cols.push(cols.length);
            });
            returndata.d[0].VT.forEach((point, j) => {
                var temp = [];
                this.paraIDselected.forEach((data, k) => {
                    if (k == 0)
                        temp.push(point.TS);
                    if (returndata.d[k].VT[j]) {
                        if (returndata.d[k].VT[j].DV) {
                            temp.push(returndata.d[k].VT[j].DV);
                        }
                        else {
                            temp.push("")
                        }
                        if (returndata.d[k].VT[j].DF) {
                            temp.push(returndata.d[k].VT[j].DF);

                        }
                        else {
                            temp.push("")
                        }
                    }
                });
                data.push(temp);
            });

            var body = this.formatJson(cols, data);
            //console.log(body)
            var obj = {
                th: vtHead, //表头
                data: body, //数据
                sheetTitle: "时序数据" //工作簿名
            }
            hisData.push(obj);
            var nowdate = newdate();
            var nowdate = new Date();
            var now = "";
            now = nowdate.getFullYear() + "-";
            now = now + mendZero(nowdate.getMonth() + 1) + "-";
            now = now + mendZero(nowdate.getDate()) + " ";
            this.exprotex(hisData, now + "_" + "时序数据");
        },
        //导出多个工作簿Excel
        //jsonData=[{th:[]表头,sheetTitle:工作簿名称，data:[]数据}]
        exprotex(jsonData, defaultTitle) {
            this.export2ExcelMultiSheet(jsonData, defaultTitle)
        },
        export2ExcelMultiSheet(jsonData, defaultTitle) {
            let data = jsonData;
            for (let item of data) {
                item.data.unshift(item.th);
            }

            let wb = new Workbook();
            //生成多个sheet
            for (let item of data) {
                wb.SheetNames.push(item.sheetTitle);
                wb.Sheets[item.sheetTitle] = sheet_from_array_of_arrays(item.data);
            }

            var wbout = XLSX.write(wb, {
                bookType: 'xlsx',
                bookSST: false,
                type: 'binary'
            });
            var title = defaultTitle // || '' //这里去掉注释可以默认一个表名
            saveAs(new Blob([s2ab(wbout)], {
                type: "application/octet-stream"
            }), title + ".xlsx")
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => v[j]))
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
        //信息点列表行点中事件
        propertyRowClick(data) {
            if (data) {
                this.$refs.propertyTable.toggleRowSelection(data);
            } else {
                this.$refs.propertyTable.clearSelection();
            }
        },
        /**获取树结构的每一层，角色点击时才加载子节点时用,20210917更新
         * 
         * @param {*} tablename //数据库表名
         * @param {*} nodecol //父节点id字段名
         * @param {*} nodevalue //父节id值
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
        getTreeNodedata(tablename, nodecol, nodevalue, istreenode, idcol, labelcol, confitem) {
            //labelcol, lableicon, ischeckdisabled, isenablesortcol, sortcol
            var nodedata = [];
            if (nodevalue == null || nodevalue != 'not null')
                var strfilter = [{
                    "cn": nodecol,
                    "cp": (nodevalue == null) ? "is" : "=",
                    "v1": nodevalue,
                    "v2": null
                }];
            else if (nodevalue == 'not null') {
                var strfilter = [{
                    "cn": nodecol,
                    "cp": "is not",
                    "v1": null,
                    "v2": null
                }];
            }
            if (confitem) {
                if (confitem.otfilter) {
                    confitem.otfilter.forEach(fi => {
                        strfilter.push(fi);
                    })
                }
            }
            nodedata_tRole = loaddata(tablename, strfilter).d;
            if (nodedata_tRole == null) //任何情况下若nodedata为null，则重新初始化数组
                nodedata = [];
            else {
                if (nodedata_tRole.length > 0 && istreenode) { //若不是树节点了，则不需要修改json对象
                    nodedata_tRole.forEach(n => { //修改json对象以符合树控件数据源要求
                        n.nid = n[idcol];
                        n.nlabel = n[labelcol]; //树控件显示
                        if (confitem) {
                            if (confitem.lableicon)
                                n.nodeicon = confitem.lableicon; //树控件的图标
                            if (confitem.ischeckdisabled == 1)
                                n.disabled = true;
                        }
                        n.children = []; //初始化子节点对象
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
                    } else
                        nodedata = $.Enumerable.From(nodedata).OrderBy("$." + idcol).ToArray();
                }
            }
            return nodedata;
        },
        //表头格式
        getRowClass({
            row,
            column,
            rowIndex,
            columnIndex
        }) {
            return {
                background: '#f5f7fa',
                fontFamily: 'Helvetica',
                fontSize: '12px',
                border: '1px solid white'
            };
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
        //刷新table数据的按钮事件
        refreshData() {
            var temptags = this.selnode.tags; //基于选中的单元节点进行刷新
            //筛选条件
            var value = {
                groupid: this.choseTagGro,
                tagid: this.queryForm.tagid === null ? "" : this.queryForm.tagid,
                tagname: this.queryForm.tagname === null ? "" : this.queryForm.tagname,
            }

            this.curtreetag = temptags;
            //按信息所属分组筛选
            if (value.groupid != null && value.groupid != "") {
                this.curtreetag = this.curtreetag.filter(x => x.PROPERTYGROUP === value.groupid);
            }

            //基于分组筛选后，再按数据点编码筛选
            if (value.tagid != null && value.tagid != "") {
                this.curtreetag = this.curtreetag.filter(x => {
                    return x.PROPERTYID.match(new RegExp(value.tagid))
                });
            }

            //基于数据点编码筛选后，再按按数据点名称筛选
            if (value.tagname != null && value.tagname != "") {
                this.curtreetag = this.curtreetag.filter(x => {
                    return x.PROPERTYNAME.match(new RegExp(value.tagname))
                });
            }
        },

        //加点弹窗，数据选取列表SelectionChange
        treeTagSelectionChange(val) {
            this.paraselected = [];
            if (val && val.length > 0) {
                val.forEach(element => {
                    if (element) {
                        this.paraselected.push(element);
                    }
                })
                if (this.paraselected.length > 6) {
                    this.$refs.propertyTable.toggleRowSelection(this.paraselected[this.paraselected.length - 1]);
                    if (this.paraselected.length === 6) {
                        this.$message({
                            showClose: true,
                            type: 'warning',
                            message: "最多只能选择6个点"
                        });
                    }
                }
                this.nowSize = this.paraselected.length;
            }
        },

        //参数点选取确认
        chooseSure() {
            //提炼图标中需要的信息
            this.paraIDselected = [];
            this.paraNameselected = [];
            
            this.paraselected.forEach(element => {
                this.paraIDselected.push(element.PROPERTYID);
                this.paraNameselected.push(element.PROPERTYNAME);
            });
            this.tablewindialog = false;
        },

        //去除重复
        /**
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
                    discArray.push(JSON.parse(JSON.stringify(a))); //赋值为新对象
                }
            });
            return discArray;
        },
        //判断时间范围，TDS的数据请求时间范围不可大于3小时
        /**
         * 注意！！最好通过控件获取到的时间，经过timeAPM方法处理过后（使格式符合），再调用此方法
         * @param {开始时间，数据格式举例：2020-12-25 16:40:00} stime 
         * @param {结束时间} etime 
         */
        timeDiff(stime, etime) {
            var date_s = stime.replace(/-/g, '/');
            var date_e = etime.replace(/-/g, '/');

            var timestamp_s = (new Date(date_s)).getTime();
            var timestamp_e = (new Date(date_e)).getTime();
            var dateDiff = (timestamp_e - timestamp_s) / 3600000;
            if (dateDiff <= 5){ //判断时间差是否在五小时以内
                this.condictionAllow = true;
                return true;
            }
            else{
                this.condictionAllow = false;
                return false;
            }
        },
        //查询操作绘制多坐标趋势图
        TrendSearch() {
            this.fullscreenLoading = true;
            this.nowhdbdata = [];
            this.tableData = [];
            this.analysisData = [];
            this.diffResult = [];
            //console.log(this.paraselected)
            if (this.curbatchid == '' && this.curtaskid == '' && this.time_e == '') {
                this.$message({
                    "message": "时间范围、批次号、工单号不能同时为空！",
                    "type": "error"
                })
                setTimeout(() => {
                    this.fullscreenLoading = false;
                }, 100);
                return;
            }
            var tempflag = this.timeDiff(this.time_s, this.time_e);
            if (!tempflag && (this.curbatchid == '' && this.curtaskid == '')) {
                this.$message({
                    "message": "时间范围需在5小时以内！请重新配置时间范围",
                    "type": "warning"
                })
                setTimeout(() => {
                    this.fullscreenLoading = false;
                }, 100);
                return;
            }
            if (this.paraIDselected.length <= 0) {
                this.$message({
                    "message": "请选择时序点之后再进行查询操作！！",
                    "type": "warning"
                })
                setTimeout(() => {
                    this.fullscreenLoading = false;
                }, 100);
                return;
            }
            if (this.paraIDselected.length > 6) {
                this.$message({
                    "message": "最多可选择6个点！！",
                    "type": "warning"
                })
                setTimeout(() => {
                    this.fullscreenLoading = false;
                }, 100);
                return;
            }

            //获取选中数据点的时序数据信息
            //如果不进行统计分析的情况下
            if (!this.isanlys) {
                this.standval = null;
                this.upval = null;
                this.lowval = null;
                this.bestcenterval = null;
            } else {
                this.standval = this.standval == null ? null : parseFloat(this.standval);
                this.upval = this.upval == null ? null : parseFloat(this.upval);
                this.lowval = this.lowval == null ? null : parseFloat(this.lowval);
                this.bestcenterval = this.bestcenterval == null?null:parseFloat(this.bestcenterval);
            }

            setTimeout(() => {
                try {
                    var ts = this.time_s === ""?null:this.time_s;
                    var te = this.time_e === ""?null:this.time_e;
                    var hdbdabta = loadHDB_ALL(this.curbatchid, this.curtaskid, ts, te, this.isclean, 1, !this.iseasy, this.isanlys, this.standval, this.upval, this.lowval,this.bestcenterval, 0, this.paraIDselected);
                    if (hdbdabta.s == 0) {
                        this.nowhdbdata = hdbdabta;
                    }
                    //console.log(hdbdabta)
                    this.analysisData = [];

                    var singleData = null;
                    var AllData = [];

                    var yStyleSingleData = null;

                    var yStyleAllData = [];

                    var flag = 0; //标记X轴的时间是否已经加载
                    // 基于准备好的dom，初始化echarts实例
                    myChart = echarts.init(document.getElementById('newEcharts'));
                    myChart.clear(); //清空绘画内容，重新绘制
                    var tempdiffdatas = []; //暂存工单批次那些信息
                    var tempanlydatas = []; //暂存统计分析结果
                    hdbdabta.d.forEach((element, i) => {
                        var PointColor = [];
                        var tempLineData = [];
                        (element.VT).forEach((data, index) => {
                            tempLineData.push({
                                value: [data.TS, data.DV],
                                validFlag: data.DF
                            });
                            //如果是在非简易模式下则去构造该数据点对应的批次号 工单号 品牌号
                            if (this.iseasy)
                                tempdiffdatas.push({
                                    propertyid: element.DID,
                                    batchid: data.BID,
                                    taskcmdid: data.WID,
                                    productid: data.PID
                                })
                            if (!data.DF)
                                PointColor[index] = 'red';
                        });
                        //如果是统计分析的话，构造出该数据点对应的统计分析结果 在结合是否是简易模式下的
                        var sourcedata = element.ST;
                        if (this.isanlys && sourcedata != null) {
                            for (item in sourcedata) {
                                tempanlydatas.push({
                                    propertyid: element.DID,
                                    key: item,
                                    value: sourcedata[item]
                                })
                            }
                        }
                        singleData = {
                            cursor: 'pointer',
                            // 曲线数据配置
                            data: tempLineData,
                            //降采样策略
                            //sampling: 'average',
                            // 曲线名
                            name: this.paraNameselected[flag], //鼠标放在折线点上显示的名称
                            // 设置参数对应的y坐标轴的索引
                            type: 'line', //折线图
                            symbolSize: 6, //折线点的大小
                            symbol: 'circle', //折线点设置为实心点
                            // 曲线平滑设置
                            //smooth: true,
                            yAxisIndex: flag,
                            itemStyle: {
                                normal: {
                                    //折线点的颜色
                                    color: (params) => {
                                        var colorList = PointColor;
                                        if (colorList[params.dataIndex] == null)
                                            return this.Seriescolor[i];
                                        else
                                            return colorList[params.dataIndex]
                                    },
                                    lineStyle: {
                                        //color: "#386db3"//折线的颜色
                                    }
                                }
                            },
                            areaStyle: {
                                opacity: 0.05,

                            }
                        };

                        yStyleSingleData = {
                            splitArea: {
                                show: true,
                                areaStyle: {
                                    color: this.innerBackgroundColor
                                }
                            },
                            name: this.paraNameselected[flag],
                            nameTextStyle: {
                                color: this.Seriescolor[i]
                            },
                            nameLocation: 'center',
                            position: (this.paraNameselected.length % 2) == 0 ? (flag < (this.paraNameselected.length / 2) ? 'left' : 'right') : (flag <= parseInt(this.paraNameselected.length / 2) ? 'left' : 'right'),
                            type: 'value',
                            // max: 700,
                            //min: -20,
                            // 让表格的刻度向靠里侧显示
                            axisTick: {
                                inside: true
                            },
                            //坐标值
                            axisLabel: {
                                inside: true,
                                color: this.Seriescolor[i]
                            },
                            // 设置刻度线的颜色等样式
                            axisLine: {
                                lineStyle: {
                                    color: this.Seriescolor[i], //y轴的颜色
                                    width: 3 //轴线的宽度
                                }
                            },
                            //网格线
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    type: 'dashed' //虚线
                                }
                            },
                            label: {
                                color: this.Seriescolor[i]
                            },
                            //不同的纵坐标坐标轴之间的偏移距离
                            offset: (this.paraNameselected.length % 2) == 0 ? (flag < (this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70) //选中基数个点
                                :
                                (flag <= parseInt(this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70), //选中偶数个点
                        }
                        flag++;
                        AllData.push(singleData);
                        yStyleAllData.push(yStyleSingleData);

                    });
                    if (tempdiffdatas && this.iseasy) {
                        this.diffResult = tempdiffdatas;
                        this.diffResult = this.distinctArray(this.diffResult, "propertyid", true);
                        this.diffResult.forEach(diff => {
                            this.paraselected.forEach(para => {
                                if (diff.propertyid === para.PROPERTYID) {
                                    diff.propertyname = para.PROPERTYNAME;
                                }
                            });
                        })
                    }
                    if (tempanlydatas && this.isanlys) {
                        var tempandatas = JSON.parse(JSON.stringify(tempanlydatas));
                        this.analysisData = $.Enumerable.From(tempandatas).ToArray();
                        this.paraselected.forEach(para => {
                            this.analysisData.forEach((analy, i) => {
                                if (para.PROPERTYID === analy.propertyid) {
                                    analy.propertyname = para.PROPERTYNAME;
                                }
                            })
                        });
                        var tempdatas = JSON.parse(JSON.stringify(this.analysisData));
                        //console.log(tempdatas);
                        this.analysisData.forEach(ele3 => {
                            ele3.tables = [];
                            tempdatas.forEach(ele4 => {
                                if (ele3.propertyid == ele4.propertyid) {
                                    ele3.tables.push({ key: ele4.key, value: ele4.value })
                                }
                            })
                        })
                    }
                    //用户同时需要复杂模式、统计分析结果的时候才进行这个操作
                    if (this.diffResult && this.diffResult.length > 0 && this.analysisData && this.analysisData.length > 0) {
                        this.diffResult.forEach(ele1 => {
                            ele1.tables = [];
                            this.analysisData.forEach(ele2 => {
                                if (ele1.propertyid == ele2.propertyid) {
                                    ele1.tables = ele2.tables;
                                }
                            })
                        })
                    }


                    // console.log(this.analysisData);
                    if (this.iseasy) {
                        this.tableData = JSON.parse(JSON.stringify(this.diffResult));
                    } else {
                        this.analysisData = this.distinctArray(this.analysisData, "propertyid", true)
                        this.tableData = JSON.parse(JSON.stringify(this.analysisData));
                    }

                    option = {
                        backgroundColor: `#${this.backgroundColor}`,
                        title: {
                            //text: "多数采点时序数据" + this.stopTips,
                            padding: [20, 20, 100, 100],
                        },
                        //图例
                        legend: {
                            show: true,
                            top: "10px"
                        },
                        //设置打印格式
                        toolbox: {
                            show: true,
                            top: "1%",
                            right: "1%",
                            feature: {
                                mark: {
                                    show: true
                                },
                                dataZoom: { //数据缩放视图
                                    show: true,
                                    iconStyle: {
                                        normal: {
                                            //color:'lightblue',//设置颜色
                                            borderColor: '#00adb4',
                                        }
                                    },
                                },
                                //自定义工具条
                                myRestore: {
                                    show: true, //是否显示    
                                    title: '重置', //鼠标移动上去显示的文字    
                                    icon: 'image://image/restore.png', //图标
                                    onclick: function (option1) { //点击事件,这里的option1是chart的option信息 
                                        myChart.clear(),
                                            myChart.setOption(option);
                                    }
                                },
                                dataView: { //数据视图
                                    show: true, //是否显示该工具。
                                    title: "时序数据一览表",
                                    readOnly: true,
                                    icon: 'image://image/datalist.png', //图标
                                    lang: ['数据视图', '关闭', '刷新'], //数据视图上有三个话术，默认是['数据视图', '关闭', '刷新']
                                    backgroundColor: "#fff", //数据视图浮层背景色。
                                    textareaColor: "#fff", //数据视图浮层文本输入区背景色
                                    textareaBorderColor: "#333", //数据视图浮层文本输入区边框颜色
                                    textColor: "#000", //文本颜色。
                                    buttonColor: "#c23531", //按钮颜色。
                                    buttonTextColor: "#fff", //按钮文本颜色。

                                    optionToContent: (opt) => {
                                        var axisData = opt.series[0].data; //坐标数据
                                        var series = opt.series; //折线图数据
                                        var yAxis = opt.yAxis;
                                        var tdHeads = '<td style="background-color: #ccd1d9;padding: 0 10px;line-height: 31px;border:1px solid #9DB3C5;">时间</td>'; //表头
                                        var tdBodys = ''; //数据
                                        series.forEach(function (item) {
                                            //组装表头
                                            tdHeads += `<td style="background-color: #ccd1d9;padding: 0 10px;line-height: 31px;border:1px solid #9DB3C5;">${item.name}</td>`;
                                        });

                                        var table = `<div style="overflow-y:auto;height: 100%;width:100%;display:block"><table border="1" style="margin-left:20px;border-collapse:collapse;font-size:14px;text-align:center"><tbody><tr>${tdHeads} </tr>`;
                                        for (var i = 0; i < axisData.length; i++) {
                                            for (var j = 0; j < series.length; j++) {
                                                //组装右边的表数据
                                                if (series[j].data[i]) {
                                                    if (series[j].data[i].validFlag) {
                                                        var colColor = yAxis[j].nameTextStyle.color;
                                                        var colbkColor = 'rgb(255,255,255)';
                                                        tdBodys += (`<td style="color:` + colColor + `;background-color:` + colbkColor + `;line-height: 25px;border:1px solid #cad9ea;">${series[j].data[i].value[1]}</td>`);

                                                    }
                                                    else {
                                                        var colColor = 'rgb(255,0,0)';
                                                        var colbkColor = 'rgb(230,233,237)';
                                                        tdBodys += (`<td style="color:` + colColor + `;background-color:` + colbkColor + `;line-height: 25px;border:1px solid #cad9ea;">${series[j].data[i].value[1]}</td>`);

                                                    }
                                                }
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
                                    icon: 'image://image/download.png', //图标
                                    show: true, //是否显示工具栏
                                    excludeComponents: ['toolbox'], //保存为图片时忽略的工具栏
                                    pixelRatio: 2, //保存图片的分辨率比例，默认跟容器相同大小，如果需要保存更高分辨率的，可以设置为大于 1 的值
                                    title: '导出成图片',
                                    name: 'hisData',
                                    type: 'png'
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
                            axisLine: {
                                lineStyle: {
                                    color: 'black', //x轴的颜色
                                    width: 2 //轴线的宽度
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
                        },
                        // 定义图样和每条曲线的颜色
                        color: this.Seriescolor,
                        // 调整表格两边空白的区域
                        grid: {
                            x: (this.paraNameselected.length % 2) == 0 ? (flag < (this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70) //选中基数个点
                                :
                                (flag <= parseInt(this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70), //选中偶数个点
                            y: '10%', //上
                            x2: (this.paraNameselected.length % 2) == 0 ? (flag < (this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70) //选中基数个点
                                :
                                (flag <= parseInt(this.paraNameselected.length / 2) ? 70 * (flag + 1) : (flag + 1 - (this.paraNameselected.length / 2)) * 70), //选中偶数个点
                            y2: '15%' //下
                        },
                        //添加缩放滚动
                        dataZoom: [{ //于区域缩放
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
                    $(window).resize(function () {
                        myChart.resize();
                    });
                    window.onresize = myChart.resize;





                } catch (e) {
                    setTimeout(() => {
                        this.fullscreenLoading = false;
                    }, 100);
                    return;
                }
                setTimeout(() => {
                    this.fullscreenLoading = false;
                }, 500);
            }, 50)

            this.condictionAllow = true;
        },
    }
});