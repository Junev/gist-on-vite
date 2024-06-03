var hisdoc = new Vue({
    el: "#hisdoc",
    data: {
        ModelData: null, //模型数据源
        nowModelName: "", //当前模型名称
        nowModelUid: "", //当前模型ID
        nowRecordId: "", //当前类型的离线记录编码
        Areas: [], //生产线
        Mats: [], //物料品牌
        MatCls: [],
        SelArea: "", //选中的生产线
        SelMat: [], //选中的物料品牌
        SelBatch: "", //选中的批次ID
        SelShift: "", //选中的班次ID
        batchTime:"",//时间
        DescType: "", //当前类型的离线数采描述
        proddate:"",//生产日期
        BatchDatas: [], //批次数据
        ShiftDatas: [], //班次数据
        doctype: "", //归档类型

        BatchMaterialOptions:[],//物料集合
        mat_filt:$.Enumerable.From(loaddata("MAT_MATERIAL", []).d).OrderBy("$.SORTNUM").ToArray(), // 产成品/物料过滤
        havrecord: false, //标记该离线数采数据是新增还是修改
        isvalid: false, //标记是否符合条件下的添加 删除 修改操作

        CurMatName: "", //当前选中的物料名称

        HisDocBatch: null, //该条件下 数据库中的数据存储对象

        newData: null, //深度拷贝对象

        inputinsue: false, //输入离线数据的输入框是否能用

        DataItemsArr: [], //原DataItems
        UpdateItemsArr: [], //需要更新的数据
        DeldataItemsArr: [], //需要删除的数据
        matLevelList:$.Enumerable.From(loaddata("BXT_ENUMERATION",[{"cn": "ENUMSET", "cp": "=", "v1": "Mat_Level", "v2": null}]).d).ToArray(),
        theMat:[],//牌号离线数据牌号选项
    },
    created: function () {
        this.GetModel();
        this.newData = this.ModelData.DataGroups;
    },
    mounted: function () {
        if (this.doctype === 0 || this.doctype === 1) {
            this.Areas = $.Enumerable.From(loaddata("APP_CONFIG", [{ "cn": "PARENTCFG", "cp": "=", "v1": "LineType", "v2": null }]).d).OrderBy("$.CFG_ID").ToArray();
            this.Mats = $.Enumerable.From(loaddata("MAT_MATERIAL", []).d).OrderBy("$.MAT_ID").ToArray();
        }
        if (this.doctype === 1 || this.doctype === 3) {
            this.getBatchShift();
        }
        this.getBatchMaterialOptions()

        //初始化时间
        const end = new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000-1);
        const start = new Date(new Date().getTime()-24*60*60*1000);
        //const start = new Date();
        var year = start.getFullYear();
        var month = start.getMonth();
        var date = start.getDate();
        this.batchTime = [new Date(year, month, date), end];

        $('#pickupTime').val(new Date().getFullYear() + '-' + ((new Date().getMonth()+1)<10?'0'+(new Date().getMonth()+1):(new Date().getMonth()+1)) + '-' + (new Date().getDate()<10?('0'+new Date().getDate()):new Date().getDate()))

        this.getBatchData();
    },
    methods: {
        //获取产成品/物料集合
        getBatchMaterialOptions() {
            //获取最上层数据
            var parent = $.Enumerable.From(loaddata("MAT_CLASS", [{"cn":"PARENTCLASS","cp":"is not","v1":null,"v2":null}]).d).OrderBy("$.CLASSSORTNUM").ToArray();//获取顶层
            this.BatchMaterialOptions = [];//第一级
            parent.forEach(item => {
                    var obj = {};
                    obj.value = item.MAT_CLASS_ID;
                    obj.label = item.MAT_CLASSNAME;
                    this.BatchMaterialOptions.push(obj);
            });
            this.BatchMaterialOptions.forEach(item2 => {
                let temp = this.mat_filt.filter(a => a.MAT_CLASS_ID == item2.value)
                var mat_list = []
                temp.forEach(b => {
                    var obj = {};
                    var tempID = b.MAT_LEVEL ? b.MAT_LEVEL : "";
                    var tempName = $.Enumerable.From(this.matLevelList).Where(pro=>pro.ENUMVALUE==tempID).ToArray();
                    obj.levelID = tempID;
                    obj.levelName = ((tempName && tempName.length>0) ? tempName[0].ENUMSTRING : "");
                    obj.value = b.MAT_ID;
                    obj.label = b.MAT_NAME;
                    mat_list.push(obj)
                })
                item2.children = mat_list
            });
        },
        //获取选中产品物料
        handleChange(value) {
            if(this.SelMat && this.SelMat.length>0){
                //this.SelMat = this.SelMat[this.SelMat.length-1];
                selectOnmat(this.SelMat[1]);
            }else{
                hisdoc.getBatchData(hisdoc.SelArea, null);
            }
        },
        //自动获取groupid
        getGroupID() {
            var GroupIDg = [];
            var getData = loaddata("HISDOCFFLINE_RECORD", []);
            if (getData.d.length > 0) {
                getData.d.forEach(element => {
                    GroupIDg.push(element.RECORDID);
                });
                var numberArray = GroupIDg.map(Number);
                var max = numberArray[0];
                for (var i = 1; i < numberArray.length; i++) {
                    if (numberArray[i] > max) {
                        max = numberArray[i]
                    }
                }
                var keys = (max + 1).toString();
                return keys;
            } else {
                var key=0;
                return key;
            }
        },
        //设置单元格样式
        cellStyle(data) {
            if (data) {
                return 'font-weight:600;font-size:16px;'
            }
        },
        //选中批次
        handleNodeClick(data) {
            this.SelBatch = data.BATCHID;
        },
        //删除离线数据
        DelDI() {
            var _recordcon = [];
            if (hisdoc.nowRecordId && hisdoc.nowRecordId != "") {
                _recordcon.push({
                    "cn": "RECORDID",
                    "cp": "=",
                    "v1": hisdoc.nowRecordId,
                    "v2": null
                })
            }
            var delrecodpost = GetorDelData("mdb\\del", "HISDOCFFLINE_RECORD", _recordcon);
            var delrecodget = RequestHd(delrecodpost);
            if (delrecodget && delrecodget.d===1) {
                this.deldataLog();
                this.HisDocBatch = [];
                this.DescType = "";
                this.inputinsue = false;
                return;
            } else {
                this.deldataerrLog();
                return;
            }

        },
        //新增 或者修改某种模式下的离线数据
        SaveDI() {
            //用于记录当下 新增  修改离线数据的时间
            var docdate = new Date();
            var nowdoc = docdate.getFullYear() + '-' + (docdate.getMonth() + 1) + '-' + docdate.getDate() + ' ' + docdate.getHours() + ':' + docdate.getMinutes() + ':' + docdate.getSeconds();
            //用于  在新增 修改 关于日期的离线数据的选择的时间
            var starttime = "";
            var _cons = [{
                "cn": "MUID",
                "cp": "=",
                "v1": this.nowModelUid,
                "v2": null
            }];
            if (this.SelBatch && this.SelBatch != "") {
                _cons.push({
                    "cn": "BATCHID",
                    "cp": "=",
                    "v1": this.SelBatch,
                    "v2": null
                });
            }
            if (this.SelShift && this.SelShift != "") {
                _cons.push({
                    "cn": "PRDSHIFT",
                    "cp": "=",
                    "v1": this.SelShift,
                    "v2": null
                });
            }
            if (this.theMat && this.theMat.length>0) {
                _cons.push({
                    "cn": "PRDMAT",
                    "cp": "=",
                    "v1": this.theMat[1],
                    "v2": null
                });
            }
            if (this.doctype === 2 || this.doctype === 3) {
                var tempstarttime = new Date($('#pickupTime').val());
                starttime = tempstarttime.getFullYear() + '-' + (tempstarttime.getMonth() + 1) + '-' + tempstarttime.getDate() + ' ' + tempstarttime.getHours() + ':' + tempstarttime.getMinutes() + ':' + tempstarttime.getSeconds();
            }
            if(this.doctype===4){
                starttime = "2000-01-01 00:00:00";
            }
            if (starttime && starttime != "") {
                _cons.push({
                    "cn": "PRDDATE",
                    "cp": "=",
                    "v1": "datetime" + "(" + starttime + ")",
                    "v2": null
                });
            }

            if (this.havrecord) {
                //修改操作--先删除再增加
                //批次-离线数采
                //先删除原来数据库中的数据

                var delcount = 0; //删除是否成功标记
                var temprecon = $.Enumerable.From(_cons).ToArray();
                temprecon.push({
                    "cn": "RECORDID",
                    "cp": "=",
                    "v1": hisdoc.nowRecordId,
                    "v2": null
                })
                var uprecord = saveData("HISDOCFFLINE_RECORD", {
                    "DESCRIPTION": hisdoc.DescType
                }, temprecon);
                var uprecords = RequestHd(uprecord);

                var tempprddate = $.Enumerable.From(this.BatchDatas).Where(a => a.BATCHID == this.SelBatch).ToArray();
                hisdoc.DeldataItemsArr = hisdoc.DataItemsArr
                var batchpost = GetorDelData("mdb\\del", "HISDOCOFFLINE", [{
                    "cn": "RECORDID",
                    "cp": "=",
                    "v1": hisdoc.nowRecordId,
                    "v2": null
                }]);
                var batchget = RequestHd(batchpost);
                hisdoc.UpdateItemsArr = $.Enumerable.From(hisdoc.DataItemsArr).ToArray();
                this.newData.forEach(gx=>{
                    gx.DataItems.forEach(dx => {
                        var HisDocOfflinesadd = {};
                        hisdoc.setHisData(HisDocOfflinesadd, tempprddate.length === 0 ? starttime : tempprddate[0].BATCHEXESTARTTIME, nowdoc);
                        HisDocOfflinesadd.RECORDID = hisdoc.nowRecordId;
                        HisDocOfflinesadd.DOCPID = dx.RUID;
                        HisDocOfflinesadd.DOCPV = dx.PV;
                        var batchpost = addData("mdb\\add", "HISDOCOFFLINE", HisDocOfflinesadd);
                        var batchget = RequestHd(batchpost);
                        if (batchget && batchget.s === 0) {
                            if (this.doctype === 0 || this.doctype === 1) {
                                var offlinepost = getScore("OfflineData", HisDocOfflinesadd);
                                var offlineget = RequestHd(offlinepost);
                            }
                        }
                    })
                })

                if (uprecords) {
                    this.inputinsue = false;
                    this.updataLog();
                    return;
                } else {
                    this.updataerrLog();
                    return;
                }
            } else {
                var tempprddate = $.Enumerable.From(this.BatchDatas).Where(a => a.BATCHID == this.SelBatch).ToArray();
                var addcount = 0;
                var tempcount = 0;
                var temprecordid = this.getGroupID();
                var recordvalue = {
                    "RECORDID": temprecordid,
                    "MUID": hisdoc.nowModelUid,
                    "PRDDATE": "datetime(" + (tempprddate.length === 0 ? starttime : tempprddate[0].BATCHEXESTARTTIME) + ")",
                    "PRDSHIFT": hisdoc.SelShift ? this.SelShift : "0",
                    "BATCHID": hisdoc.SelBatch ? hisdoc.SelBatch : "0",
                    "DESCRIPTION": hisdoc.DescType
                }

                var addrecord = addData("mdb\\add", "HISDOCFFLINE_RECORD", recordvalue);
                var addresult = RequestHd(addrecord);
                this.newData.forEach(gx=>{
                    gx.DataItems.forEach(dx=>{
                        tempcount = tempcount + 1;
                        var HisDocOfflinesadd = {};
                        hisdoc.setHisData(HisDocOfflinesadd, tempprddate.length === 0 ? starttime : tempprddate[0].BATCHEXESTARTTIME, nowdoc);
                        HisDocOfflinesadd.RECORDID = temprecordid;
                        HisDocOfflinesadd.DOCPID = dx.RUID;
                        HisDocOfflinesadd.DOCPV = dx.PV;
                        var batchpost = addData("mdb\\add", "HISDOCOFFLINE", HisDocOfflinesadd);
                        var batchget = RequestHd(batchpost);
                        if (batchget && batchget.s === 0) {
                            addcount = addcount + 1;
                            if (this.doctype === 0 || this.doctype === 1) {
                                var offlinepost = getScore("OfflineData", HisDocOfflinesadd);
                                var offlineget = RequestHd(offlinepost);
                            }
                        }
                    })
                })

                if (tempcount === addcount && addresult) {
                    this.havrecord = true;
                    this.inputinsue = false;
                    this.adddataLog();
                    return;
                } else {
                    this.adddataerrLog();
                    return;
                }
            }
        },
        //查询在该条件下 是否有离线数据
        querydata() {
            this.isvalid = false;
            this.inputinsue = false;
            //批离线数据
            if (this.doctype === 0) {
                if (this.SelBatch == "") {
                    this.$message({
                        showClose: true,
                        type: 'warning',
                        message: "批次不能为空,请选择!"
                    });
                    return;
                } else {
                    this.isvalid = true;
                    this.inputinsue = true;
                    this.havrecord = this.checkData(hisdoc.nowModelUid, this.SelBatch, null, null, null);

                }
            }
            //批次 班次 离线数据
            if (this.doctype === 1) {
                if (this.SelBatch == "" || this.SelShift == "") {
                    this.$message({
                        showClose: true,
                        type: 'warning',
                        message: "批次/班次不能为空,请选择!"
                    });
                    return;
                } else {
                    this.isvalid = true;
                    this.inputinsue = true;
                    this.havrecord = this.checkData(hisdoc.nowModelUid, this.SelBatch, this.SelShift, null, null);
                }
            }
            //日期 离线数据 ---日期 班次离线数据
            if (this.doctype === 2 || this.doctype === 3) {
                var tempstarttime = new Date($('#pickupTime').val());
                starttime = tempstarttime.getFullYear() + '-' + (tempstarttime.getMonth() + 1) + '-' + tempstarttime.getDate() + ' ' + tempstarttime.getHours() + ':' + tempstarttime.getMinutes() + ':' + tempstarttime.getSeconds();
                if (this.doctype === 2) {
                    if (starttime == "NaN-NaN-NaN NaN:NaN:NaN") {
                        this.$message({
                            showClose: true,
                            type: 'warning',
                            message: "生产日期不能为空,请选择!"
                        });
                        return;
                    } else {
                        this.isvalid = true;
                        this.inputinsue = true;
                        this.havrecord = this.checkData(hisdoc.nowModelUid, null, null, starttime, null);
                    }
                } else {
                    if (starttime == "NaN-NaN-NaN NaN:NaN:NaN" || this.SelShift == "") {
                        this.$message({
                            showClose: true,
                            type: 'warning',
                            message: "生产日期/班次不能为空,请选择!"
                        });
                        return;
                    } else {
                        this.isvalid = true;
                        this.inputinsue = true;
                        this.havrecord = this.checkData(hisdoc.nowModelUid, null, this.SelShift, starttime, null);
                    }
                }
            }
            //牌号离线数据
            if (this.doctype === 4) {
                if (!this.theMat || this.theMat.length<=0) {
                    this.$message({
                        showClose: true,
                        type: 'warning',
                        message: "牌号不能为空,请选择!"
                    });
                    return;
                } else {
                    this.isvalid = true;
                    this.inputinsue = true;
                    this.havrecord = this.checkData(hisdoc.nowModelUid, null, null, null,this.theMat[1]);
                }
            }
        },
        //获取该离线数据记录描述
        getDesc(recodid) {
            var tempdesc = "";
            if (recodid && recodid != "") {
                var getdata = loaddata("HISDOCFFLINE_RECORD", [{
                    "cn": "RECORDID",
                    "cp": "=",
                    "v1": recodid,
                    "v2": null
                }]).d;
                if (getdata) {
                    tempdesc = getdata[0].DESCRIPTION;
                } else {
                    tempdesc = "";
                }
                return tempdesc;
            }

        },
        //构建模型-组-信息点
        GetModel() {
            var tempuparr = [];
            this.ModelData = loaddata("HisDocOfflineModel", [{
                "cn": "RUID",
                "cp": "=",
                "v1": getUrlParam("muid"),
                "v2": null
            }]).d;
            if (this.ModelData) {
                this.nowModelName = this.ModelData[0].MODELNAME;
                this.doctype = this.ModelData[0].DOCTYPE;
                this.nowModelUid = this.ModelData[0].RUID;
                var tempGrop = loaddata("HisDocOfflineModel_DataGroup", [{
                    "cn": "PUID",
                    "cp": "=",
                    "v1": this.ModelData[0].RUID,
                    "v2": null
                }]).d;
                if (tempGrop) {
                    this.ModelData.DataGroups = $.Enumerable.From(tempGrop).OrderBy("$.DATAITEMNUM").ToArray();
                    $(this.ModelData.DataGroups).each(
                        function (i, gx) {
                            var tempDataitems = loaddata("HisDocOfflineModel_DataItems", [{
                                "cn": "PUID",
                                "cp": "=",
                                "v1": gx.PUID,
                                "v2": null
                            }, {
                                "cn": "GUID",
                                "cp": "=",
                                "v1": gx.RUID,
                                "v2": null
                            }]).d
                            if (tempDataitems) {
                                gx.DataItems = $.Enumerable.From(tempDataitems).OrderBy("$.DATAITEMNUM").ToArray();
                            }
                        });

                }
            }
        },
        //获取批次数据
        getBatchData(selare, selmat) {
            if (this.doctype === 0 || this.doctype === 1) {
                if(this.batchTime){
                    var starttime = dateTrans(new Date(this.batchTime[0]));
                    var endtime = dateTrans(new Date(this.batchTime[1]));
                }else{
                    this.$message.error("选择日期出错");
                    return
                }
                var _cons = [{
                    "cn": "BATCHEXESTARTTIME",
                    "cp": "between",
                    "v1": "datetime" + "(" + starttime + ")",
                    "v2": "datetime" + "(" + endtime + ")"
                }];
                var tempbatchdata = [];
                if (selare && selare != "") {
                    _cons.push({
                        "cn": "AREAID",
                        "cp": "=",
                        "v1": selare,
                        "v2": null
                    });
                }
                if (selmat && selmat != "") {
                    _cons.push({
                        "cn": "BATCHPRODUCTID",
                        "cp": "=",
                        "v1": selmat,
                        "v2": null
                    });
                }
                var tempdata = loaddata("V_PRDBATCH", _cons).d;
                if (tempdata) {
                    tempdata.forEach(elebatch => {
                            tempbatchdata.push({
                                BATCHID: elebatch.BATCHID,
                                BATCHNAME: elebatch.BATCHID + "--" + elebatch.BATCHMAT_NAME,
                                BATCHEXESTARTTIME: elebatch.BATCHEXESTARTTIME
                            });
                    });
                    this.BatchDatas = $.Enumerable.From(tempbatchdata).OrderBy("$.BATCHID").ToArray();
                }
            } else {
                this.BatchDatas = [];
            }
        },
        //获取班次数据
        getBatchShift() {
            if (this.doctype != 0 || this.doctype != 2) {
                var tempshift = loaddata("APP_CONFIG_ITEMS", [{
                    "cn": "PARENTCFG",
                    "cp": "=",
                    "v1": "+SYSBC",
                    "v2": null
                }]).d;
                if (tempshift) {
                    this.ShiftDatas = $.Enumerable.From(tempshift).OrderBy("$.PROPERTYID").ToArray();
                }
            } else {
                this.ShiftDatas = [];
            }
        },
        //检验数据库中是否含有该离线数采数据  
        checkData(muid, batchid, shiftid, prddate,matid) {
            var temphavrecord = false;
            var _cons = [{
                "cn": "MUID",
                "cp": "=",
                "v1": muid,
                "v2": null
            }];
            if (batchid && batchid != "") {
                _cons.push({
                    "cn": "BATCHID",
                    "cp": "=",
                    "v1": batchid,
                    "v2": null
                });
            }
            if (shiftid && shiftid != "" && shiftid != 0) {
                _cons.push({
                    "cn": "PRDSHIFT",
                    "cp": "=",
                    "v1": shiftid,
                    "v2": null
                });
            }
            if (prddate && prddate != "") {
                _cons.push({
                    "cn": "PRDDATE",
                    "cp": "=",
                    "v1": "datetime(" + prddate + ")",
                    "v2": null
                });
            }
            if(matid && matid.length>0){
                _cons.push({
                    "cn": "PRDMAT",
                    "cp": "=",
                    "v1": matid,
                    "v2": null
                });
            }
            var postdata = loaddata("HISDOCOFFLINE", _cons).d;
            if (postdata && postdata.length > 0) {
                this.HisDocBatch = $.Enumerable.From(postdata).OrderBy("$.DOCPID").ToArray();
                this.$message({
                    showClose: true,
                    type: 'success',
                    message: "以下是该类型的离线数采记录,可进行修改/删除操作!"
                });
                temphavrecord = true;
                return temphavrecord;
            } else {
                this.HisDocBatch = [];
                this.nowRecordId = "";
                this.$message({
                    showClose: true,
                    type: 'warning',
                    message: "无该类型的离线数采记录,可进行添加操作!"
                });
                return temphavrecord;
            }
        },
        //构建数据对象
        setHisData(data, prddate, nowdate) {
            data.MUID = hisdoc.nowModelUid;
            data.PRDDATE = "datetime" + "(" + prddate + ")";
            data.PRDSHIFT = hisdoc.SelShift ? this.SelShift : "0";
            data.BATCHID = hisdoc.SelBatch ? hisdoc.SelBatch : "0";
            data.PRODUCTID = (hisdoc.SelMat && hisdoc.SelMat.length>0) ? hisdoc.SelMat[1] : "0";
            data.DOCTIME = "datetime" + "(" + nowdate + ")";
            data.DOCMAN = top.LogInfor.UserName;
            data.PRDMAT = (hisdoc.theMat && hisdoc.theMat.length>0) ? hisdoc.theMat[1] : 0;
        },
        updataLog() {
            this.$message({
                showClose: true,
                type: 'success',
                message: "修改该离线数据成功!"
            });
        },
        adddataLog() {
            this.$message({
                showClose: true,
                type: 'success',
                message: "新增离线数据成功!"
            });
        },
        deldataLog() {
            this.$message({
                showClose: true,
                type: 'success',
                message: "删除离线数据成功!"
            });
        },
        updataerrLog() {
            this.$message({
                showClose: true,
                type: 'error',
                message: "修改该离线数据失败!"
            });
        },
        adddataerrLog() {
            this.$message({
                showClose: true,
                type: 'error',
                message: "新增离线数据失败!"
            });
        },
        deldataerrLog() {
            this.$message({
                showClose: true,
                type: 'error',
                message: "删除离线数据失败!"
            });
        },
    },
    watch: {
        //选择选的时候 去为物料品牌 下拉数据源赋值
        SelArea: function (SelArea) {
            if (SelArea && SelArea != "") {
                this.MatCls = $.Enumerable.From(loaddata("V_PRDBATCH", [{
                    "cn": "AREAID",
                    "cp": "=",
                    "v1": SelArea,
                    "v2": null
                }]).d).ToArray();
                this.SelMat = [];
                this.SelBatch = "";
            } else {
                this.MatCls = $.Enumerable.From(loaddata("V_PRDBATCH", []).d).ToArray();
                this.SelMat = [];
                this.SelBatch = "";
            }
        },
        //监控当前条件下 是否有数据 有则重新渲染这个model
        HisDocBatch: function (HisDocBatch) {
            var tempDataItems = [];
            var temprecordid = "";
            if (HisDocBatch && HisDocBatch.length > 0) {
                temprecordid = HisDocBatch[0].RECORDID;
                this.nowRecordId = temprecordid;
            } else {
                this.nowRecordId = "";
            }
            this.DescType = this.getDesc(hisdoc.nowRecordId);
            //根据历史归档设置模型中需要录入的所有数据点的值 
            $(this.ModelData.DataGroups).each(function (j, gx) {
                $(gx.DataItems).each(function (i, dx) {
                    var pvs = $.Enumerable.From(HisDocBatch).Where(a => a.DOCPID == dx.RUID).ToArray();
                    dx.PV = pvs && pvs.length > 0 ? pvs[0].DOCPV : 0;
                    tempDataItems.push({
                        DOCPID: dx.RUID,
                        DOCPV: dx.PV,
                        isdel: pvs && pvs.length > 0 ? 2 : 0,
                        recordid: temprecordid ? temprecordid : "0"
                    });
                });
            });
            this.newData = JSON.parse(JSON.stringify(this.ModelData.DataGroups)); //深度拷贝
            this.DataItemsArr = $.Enumerable.From(tempDataItems).OrderBy("$.DOCPID").ToArray();
        }
    }
});

//选择 品牌的时候去更新批次的数据
function selectOnmat(obj) {
    //var value = obj.options[obj.selectedIndex].value;
    if (hisdoc.SelMat && hisdoc.SelMat.length>0) {
        hisdoc.CurMatName = '【'+hisdoc.mat_filt.find(item => item.MAT_ID == obj).MAT_NAME+'】';
    } else {
        hisdoc.CurMatName = "";
    }
    hisdoc.getBatchData(hisdoc.SelArea, hisdoc.SelMat[1]);
}

function OnInput(event) {
    if (hisdoc.havrecord) {
        $(hisdoc.DataItemsArr).each(function (j, gx) {
            if (gx.DOCPID === event.target.id) {
                gx.DOCPV = event.target.value;
                gx.isdel = 1;
            }
        });
    }
}