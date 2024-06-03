var OfflineModel = new Vue({
    el: "#OfflineModel",
    data: {
        fun: getUrlParam("fun"),
        funTitle: getUrlParam("fun") == 'M' ? '离线数采建模工具' : '离线数据采集',
        LogUser: top.LogInfor.UserName,
        App: [],
        Models: [],
        AllModels: [], //用来增删查改的时候不需要再重新访问数据库
        DOCTypeData: [],
        selectvalue: null, //默认选中的模型类型
        saveModel: [],
        delModel: []
    },
    created() {
        var tempApp = loaddata("APP_CONFIG_ITEMS", [{
            "cn": "ParentCFG",
            "cp": "=",
            "v1": "SysApps",
            "v2": null
        }, {
            "cn": "PropertyValue",
            "cp": "=",
            "v1": getUrlParam("appid"),
            "v2": null
        }]);
        var tempfal = tempApp.d == null ? false : true;
        if (tempfal) {
            this.App = tempApp.d;
        } else {
            this.App = [];
        }

        var tempModels = loaddata("HisDocOfflineModel", [{
            "cn": "AppID",
            "cp": "=",
            "v1": getUrlParam("appid"),
            "v2": null
        }]);
        var tempflm = tempModels.d == null ? false : true;
        if (tempflm) {
            //此处是由于模型归档类型过于少 所以用代码写死，不从数据库中对应获取name 之后如果新增视情况添加
            tempModels.d .forEach(model => {
                if(model.DOCTYPE===0)
                {
                model.DOCTYPE="0";
                }
                else if(model.DOCTYPE===1)
                {
                    model.DOCTYPE="1";
                }
                else if(model.DOCTYPE===2)
                {
                    model.DOCTYPE="2";
                }
                else if(model.DOCTYPE===3)
                {
                    model.DOCTYPE="3"
                }
                else if(model.DOCTYPE===4)
                {
                    model.DOCTYPE="4"
                }
                
            });
            this.Models = tempModels.d;
        } else {
            this.Models = [];
        }
        this.AllModels = this.Models;
        var tempDOCTypeData = loaddata("APP_CONFIG_ITEMS", [{
            "cn": "ParentCFG",
            "cp": "=",
            "v1": "hisdoctype",
            "v2": null
        }]);
        var tempfld = tempDOCTypeData.d == null ? false : true;
        if (tempfld) {
            this.DOCTypeData = tempDOCTypeData.d;
        } else {
            this.DOCTypeData = [];
        }
    },
    methods: {
        getParentValue() {
            var obj = this.options.find((item) => { //这里的oneData就是上面遍历的数据源
                this.selectvalue = item.PROPERTYVALUE;
                return item.PROPERTYVALUE === PROPERTYVALUE; //筛选出匹配数据
            })
        },
        Add: function () {
            var templeg = this.AllModels.length > 0 ? "RUID" : "";
            var tempStrlen = this.AllModels.length > 0 ? null : 2;
            this.Models.push({
                AppID: this.App.PROPERTYVALUE,
                RUID:  getNewID("MDB", "HISDOCOFFLINEMODEL", "RUID", 'M', 2),
                ModelName: '',
                Author: top.LogInfor.UserName,
                CreateDate: "datetime" + "(" + this.DateFormatter(new Date()) + ")",
                ApprovedBy: top.LogInfor.UserName,
                ApprovalDate: "datetime" + "(" + this.DateFormatter(new Date()) + ")",
                Description: '',
                IsAdd: true,
                Doctype: 0,
                TypeName:"批离线数采录入"
            })
        },
        Delete(Model) {
            if (Model.RUID) {
                dwin.dialogwin('del');
                this.delModel = Model;
            }
        },
        DelReH(Model) {
            var deldata = GetorDelData("mdb\\del", "HisDocOfflineModel", [{
                "cn": "RUID",
                "cp": "=",
                "v1": Model.RUID,
                "v2": null
            }]);
            var delres = RequestHd(deldata);
            if (delres.s === 0) {
                addUserOperLog("在【离线数采模型搭建】页面 【删除】了数采项目【" + Model.ModelName + "】",top.LogInfor.UserName, top.LogInfor.clientip);
                this.successInfo_popWin();
                OfflineModel.Models.splice($.inArray(Model, OfflineModel.Models), 1);
                this.AllModels = OfflineModel.Models;
                return;
            } else {
                this.failInfo_popWin("删除失败！")
                return;
            }
        },
        Save(Model) {
            if (Model.RUID) {
                dwin.dialogwin('save');
                this.saveModel = Model;
            }
        },
        SaveReH(Model) {
            if (Model.IsAdd) {
                var addjson = {
                    "APPID": getUrlParam("appid"),
                    "RUID": Model.RUID,
                    "MODELNAME": Model.MODELNAME,
                    "AUTHOR": top.LogInfor.UserName,
                    "CREATEDATE": "datetime" + "(" + this.DateFormatter(new Date()) + ")",
                    "APPROVEDBY": top.LogInfor.UserName,
                    "APPROVALDATE": "datetime" + "(" + this.DateFormatter(new Date()) + ")",
                    "DESCRIPTION": Model.DESCRIPTION,
                    "DOCTYPE": parseInt(Model.DOCTYPE)
                }
                var postdata = addData("mdb\\add", "HISDOCOFFLINEMODEL", addjson)
                var getdata = RequestHd(postdata);
                if (getdata.s === 0) {
                    this.successInfo_popWin();
                    Model.IsAdd = false;
                    addUserOperLog("在【离线数采模型搭建】页面 【新增】了数采项目【" + Model.ModelName + "】",top.LogInfor.UserName, top.LogInfor.clientip);
                    return;
                } else {
                    this.failInfo_popWin("新增理想数采模型失败！")
                    return;
                }
            } else {
                var updatejson = {
                    "MODELNAME": Model.MODELNAME,
                    "APPROVEDBY": top.LogInfor.UserName,
                    "APPROVALDATE": "datetime" + "(" + this.DateFormatter(new Date()) + ")",
                    "DESCRIPTION": Model.DESCRIPTION,
                    "DOCTYPE": parseInt(Model.DOCTYPE)
                }
                var postdata = saveData("HISDOCOFFLINEMODEL", updatejson, [{
                    "cn": "RUID",
                    "cp": "=",
                    "v1": Model.RUID,
                    "v2": null
                }]);
                var getdata = RequestHd(postdata);
                if (getdata.s === 0) {
                    this.successInfo_popWin();
                    Model.IsAdd = false;
                    addUserOperLog("在【离线数采模型搭建】页面 【修改】了数采项目【" + Model.ModelName + "】",top.LogInfor.UserName, top.LogInfor.clientip);
                    return;
                } else {
                    this.failInfo_popWin("修改离线数采模型失败！")
                    return;
                }
            }
        },
        //操作数据成功用户提示
        successInfo_popWin() {
            this.$message({
                showClose: true,
                type: 'success',
                message: "操作成功！"
            });
        },
        //操作数据成功用户提示
        failInfo_popWin(reason) {
            this.$message({
                showClose: true,
                type: 'error',
                message: "操作失败:" + reason
            });
        },
        //弹窗按钮确认按钮事件
        btnsure() {
            this.dialogType = dwin.dialogType;
            if (this.dialogType == "save")
                this.SaveReH(this.saveModel);
            else if (this.dialogType == "del")
                this.DelReH(this.delModel);
            dwin.dialogVisible = false;
        },
        //格式化时间
        DateFormatter(dateInput) {
            var year = dateInput.getFullYear();
            var month = dateInput.getMonth() + 1;
            var Date = dateInput.getDate();
            var hour = dateInput.getHours();
            var minute = dateInput.getMinutes();
            var second = dateInput.getSeconds();
            if (month < 10) {
                month = '0' + month;
            }
            if (Date < 10) {
                Date = '0' + Date;
            }
            if (hour < 10) {
                hour = '0' + hour;
            }
            if (minute < 10) {
                minute = '0' + minute;
            }
            if (second < 10) {
                second = '0' + second;
            }
            return (year + "-" + month + "-" + Date + " " + hour + ":" + minute + ":" + second);
        },
    }
});
var funModal = new Vue({
    el: "#funModal",
    data: {
        cFrmTitle: "xxxxxxx功能",
        titleicon: "icon-renwuguanli",
        funurl: ""
    },
    methods: {
        SetfunModal: function (funurl, funtitle, titleicon) {
            funModal.cFrmTitle = funtitle;
            funModal.funurl = funurl;
            funModal.titleicon = titleicon;
        }
    }

});