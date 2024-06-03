
var myIP = 'unknow';
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
            batchid_part: '',
            shift1pre: '',
            shift12pre: '',
            shift1: '',
            shift12: '',
            taskshift: [],
            shiftlist: [],

            timepick: '',
            batchTableList: [],
            seltask: {},
            bclist: [],//开始班次
            bclist_shift: [],//换班班次
            taskid: '',

            celllist: [],

            tableHeight: 500,
            pickerOptions: {//时间选择控件的快捷方式
                disabledDate(time) {
                    return time.getTime() > Date.now();
                },
                shortcuts: [{
                    text: '今天',
                    onClick(picker) {
                        picker.$emit('pick', new Date());
                    }
                }, {
                    text: '昨天',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24);
                        picker.$emit('pick', date);
                    }
                }, {
                    text: '一周前',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', date);
                    }
                }]
            },
            userName: '',
            clientIP: '????',
            taskinfo: '',
        };
    },

    mounted() {
        this.initData();
        getip();
        this.userName = top.LogInfor ? top.LogInfor.UserName : "unknow?";
        this.$nextTick(() => {
            var divh2 = window.getComputedStyle(this.$refs.tablediv).height;
            this.tableHeight = parseInt(divh2) - 5;
        });
    },

    watch: {


    },

    methods: {
        initData() {
            this.bclist = loaddata("APP_CONFIG_ITEMS", [{ "cn": "PARENTCFG", "cp": "=", "v1": "+SYSBC", "v2": null }]).d;
            this.bclist_shift = JSON.parse(JSON.stringify(this.bclist));
            var unsel = {};
            unsel.PROPERTYVALUE = "0";
            unsel.PROPERTYNAME = '暂无';
            this.bclist_shift.push(unsel);
            this.bclist_shift.forEach(bcs => {
                bcs.text = bcs.PROPERTYNAME;
                bcs.value = bcs.PROPERTYVALUE;
            });
            this.bclist.forEach(bc => {
                bc.text = bc.PROPERTYNAME;
                bc.value = bc.PROPERTYVALUE;
            });

        },



        save() {
            if (this.shift1pre.toString() && this.shift12pre.toString())
                this.verifyper(this.shift1pre, this.shift12pre);
            else
                this.errorData();

        },
        verifyper(v1, v2) {
            var isshiftok = false;
            try {
                var total = parseInt(v1) + parseInt(v2);
                if (total == 100) {
                    isshiftok = this.verifyshift(this.shift1, this.shift12);
                    if (isshiftok)
                        this.saveshiftper();
                } else {
                    this.errornot100();
                }
            } catch (error) {
                this.errorData();
            }

        },
        verifyshift(v1, v2) {
            var isver = false;
            if (v1 != v2) {
                isver = true;
            } else
                this.errorShift();
            return isver;
        },
        saveshiftper() {

            var tagItme = {};
            tagItme.EXESHIFT1 = this.shift1;
            tagItme.EXESHIFT12 = this.shift12;
            tagItme.EXESHIFT1PER = this.shift1pre;
            tagItme.EXESHIFT12PER = this.shift12pre;

            var updateData = saveData("PRD_CELLTASK",
                tagItme,
                [{ "cn": "TASKID", "cp": "=", "v1": this.taskid, "v2": null }]);
            var update_result = RequestHd(updateData);
            if (update_result.d == 1) {
                this.settableRow();
                this.successInfo_popWin();
                this.addUserOperLog('1', '在【换班信息维护】页面进行了修改。工单信息：' + this.taskinfo, this.userName);
            }

        },
        addUserOperLog(AppID, OperDesc, userName) {
            var addlog = {};
            var opresult = '';
            addlog.APPID = AppID;
            addlog.USERNAME = userName;
            addlog.OPERTIME = 'datetime(' + formatJSdatetime(new Date()) + ')';;
            addlog.CLIENTIP = myIP;
            addlog.OPERDESC = OperDesc;
            var addreq = addData("mdb\\add", "USER_OPERLOG", addlog);
            var addResult = RequestHd(addreq);
            opresult = addResult.s;
        },

        gettableTaskList() {
            if (this.taskshift)
                if (this.taskshift.length > 0) {
                    this.taskshift.forEach(t => {
                        t.CELLNAME = this.getitemname('BXT_EQUIPELEMENT', 'EQUIPMENTID', 'EQUIPMENTNAME', t.PROCESSCELLID);
                        t.SHIFT1NAME = this.getbcname(t.EXESHIFT1);
                        t.SHIFT12NAME = this.getbcname(t.EXESHIFT12);
                        t.MATNAME = this.getitemname('MAT_MATERIAL', 'MAT_ID', 'MAT_NAME', t.PRODUCTID);
                        var cellitem = {};
                        cellitem.value = t.PROCESSCELLID;
                        cellitem.text = t.CELLNAME;
                        this.celllist.push(cellitem);
                    });
                    this.taskshift = $.Enumerable.From(this.taskshift).OrderBy("$.EXESTARTTIME").ToArray();
                    this.celllist = this.distinctArray(this.celllist, 'value', true);
                    this.celllist = $.Enumerable.From(this.celllist).OrderBy("$.value").ToArray();
                }

        },
        getTask_batchidlike(taskid) {
            if (taskid) {
                var strLength = taskid.toString().length;
                if (strLength > 3) {
                    this.taskshift = [];
                    this.taskshift = loaddata('PRD_CELLTASK', [
                        { 'cn': 'BATCHID', 'cp': 'like', 'v1': '%' + taskid + '%', 'v2': null }]).d;//qmsdate[datetime(2021-4-07 00:00:00)]
                    this.gettableTaskList();
                } else {
                    this.warningInfo_popWin('输入数字不能小于4位');
                }

            } else {
                this.warningInfo_popWin('输入条件不能为空');
            }
        },
        getTaskClick() {
            if (this.batchid_part)
                this.getTask_batchidlike(this.batchid_part);


        },
        cellfilter(value, row) {
            return row.PROCESSCELLID === value;
        },

        bcfilter1(value, row) {
            return row.EXESHIFT1 === value;
        },

        bcfilter12(value, row) {
            return row.EXESHIFT12 === value;
        },

        shift1Change(value) {
            this.shift1 = value;
        },
        shift12Change(value) {
            this.shift12 = value;
        },
        //数据点表，行点击事件
        tableRowClick(data) {
            this.seltask = data;
            this.shift1 = (data.EXESHIFT1 == null) ? "0" : data.EXESHIFT1;
            this.shift12 = (data.EXESHIFT12 == null) ? "0" : data.EXESHIFT12;
            this.shift1pre = data.EXESHIFT1PER;
            this.shift12pre = data.EXESHIFT12PER;
            this.taskid = data.TASKID;
            this.taskinfo = data.MATNAME + '/' + data.CELLNAME + '/' + data.BATCHID + '/' + data.TASKID + '/' + data.EXESTARTTIME + '~' + data.EXEENDTIME + '/' + this.shift1 + '-' + this.shift1pre + '+' + this.shift12 + '-' + this.shift12pre;
        },
        settableRow() {
            var shift1str = this.getbcname(this.shift1);
            var shift12str = this.getbcname(this.shift12);
            this.seltask.SHIFT1NAME = shift1str;
            this.seltask.SHIFT12NAME = shift12str;
            this.seltask.EXESHIFT1 = this.shift1;
            this.seltask.EXESHIFT12 = this.shift12;
            this.seltask.EXESHIFT1PER = this.shift1pre;
            this.seltask.EXESHIFT12PER = this.shift12pre;
        },
        getTask(task_s, task_e) {
            this.taskshift = []
            this.taskshift = loaddata('PRD_CELLTASK', [
                { 'cn': 'EXESTARTTIME', 'cp': 'between', 'v1': 'datetime(' + task_s + ' 00:00:00)', 'v2': 'datetime(' + task_e + ' 23:59:59)' }]).d;//qmsdate[datetime(2021-4-07 00:00:00)]

        },
        datechange(value) {
            this.getTask(value, value);
            this.gettableTaskList();
        },


        getbcname(bcid) {
            var bcname = '';
            var bct = $.Enumerable.From(this.bclist).Where(t => t.PROPERTYVALUE == bcid).ToArray();
            if (bct)
                if (bct.length > 0) {
                    bcname = bct[0].PROPERTYNAME;
                }
            return bcname;
        },
        //生产品牌选择事件
        matselClick(value) {
            this.batchTableList = [];
            this.matID_sel = value;
            var matitem = $.Enumerable.From(this.matList).Where(mat => (mat.BATCHPRODUCTID === value)).ToArray();
            if (matitem)
                if (matitem.length > 0) {
                    this.matName_sel = matitem[0].BATCHMAT_NAME;
                    if (value != "M0")
                        this.batchTableList = $.Enumerable.From(this.batchList).Where(batch => (batch.BATCHPRODUCTID === value)).ToArray();
                    else
                        this.batchTableList = this.batchList;
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
        //操作数据成功用户提示
        warningInfo_popWin(optxt) {
            this.$message({
                showClose: true,
                type: 'warning',
                message: '【' + optxt + '】,请调整后再试'
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

function getip() {
    //var myIP = '';
    try {
        window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; //compatibility for Firefox and chrome
        var pc = new RTCPeerConnection({ iceServers: [] }), noop = function () { };
        pc.createDataChannel(''); //create a bogus data channel
        pc.createOffer(pc.setLocalDescription.bind(pc), noop); // create offer and set local description
        pc.onicecandidate = function (ice) {
            if (ice && ice.candidate && ice.candidate.candidate) {
                myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
                pc.onicecandidate = noop;
                //this.clientIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
                return myIP;

            }
        };
    } catch (error) {

    }


}





