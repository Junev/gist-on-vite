//nginx服务器ip 
// var pds_url = 'http://192.168.78.139:81'; //正式服务器
var pds_url = ''
// var pds_url = 'http://192.168.78.204:81'; //中控室
// var pds_url = 'http://10.155.97.147:81'; //cps
// var pds_url = 'http://172.16.107.236:81'; //调试预留
// var pds_url = 'http://10.155.97.147:81';

//document.write('<script type="text/javascript" disable-devtool-auto src="js/tools/disable-devtool.min.js"></script>');

/**
* flexWidth
* @param prop 每列的prop''
* @param tableData 表格数据
* @param title 标题长内容短的，传标题
* @param num 列中有标签等加的富余量
* @returns 列的宽度
* 注：prop,title有一个必传
*/
function flexWidth(prop, tableData, title, num = 0) {
    if (tableData.length === 0 ) {//表格没数据不做处理
        return;
    }
    let flexWidth = 0;//初始化表格列宽
    let columnContent = '';//占位最宽的内容
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    context.font = "14px Microsoft YaHei";
    if ((prop === '') && title) {//标题长内容少的，取标题的值,
        columnContent = title
    } else {// 获取该列中占位最宽的内容
        let index = 0;
        for (let i = 0; i < tableData.length; i++) {
            const now_temp = tableData[i][prop] + '';
            const max_temp = tableData[index][prop] + '';
            const now_temp_w = context.measureText(now_temp).width
            const max_temp_w = context.measureText(max_temp).width
            if (now_temp_w > max_temp_w) {
                index = i;
            }
        }
        columnContent = tableData[index][prop]
        //比较占位最宽的值跟标题、标题为空的留出四个位置
        const column_w = context.measureText(columnContent).width
        const title_w = context.measureText(title).width
        if (column_w < title_w) {
            columnContent = title || '留四个字'
        }
    }
    // 计算最宽内容的列宽
    let width = context.measureText(columnContent);
    flexWidth = width.width + 40 + num
    return flexWidth + 'px';
}

//表名、id列、名字列、id值
function IdToNameFormat(tableName, idCol, nameCol,value) {
    try {
        if(value && tableName && tableName!='' && idCol && idCol!='' && nameCol && nameCol!=''){
            var pro = loaddata(tableName, [{ "cn": idCol, "cp": "=", "v1": value, "v2": null }]).d;
            if (pro && pro.length >0)
                return pro[0][nameCol];
            else
                return value;
        }
        else
            return value;
    }
    catch (err) { return value }
}

//计算数组中对象某一字段的和
//数组、字段名、结果精度
function countTotal(arr, keyName,precision) {
	let _total = 0;
	_total = arr.reduce(function (total, currentValue, currentIndex, arr){
        return currentValue[keyName] ? (total + Number(currentValue[keyName])) : total;
	}, 0);
	return _total.toFixed(precision);
}

/**
 * * 排序比较
 * * @param {string} propertyName 排序的属性名
 * * @param {string} sort ascending(升序)/descending(降序)
 * * @return {function}
 * */
function compare(propertyName, sort) {
    function isNumberV(val) {
        var regPos = /^\d+(\.\d+)?$/; //非负浮点数 
        var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
        if (regPos.test(val) || regNeg.test(val)) {
            return true;
        } else {
            return false;
        }
    }
    return function (obj1, obj2) {
        var value1 = obj1[propertyName];
        var value2 = obj2[propertyName];
        //存在null

        if(value1 == null || value2 ==null){
            return -1;
        }
        //字符串比较
        else if (!isNumberV(value1) || !isNumberV(value2)) {
            const res = value1.localeCompare(value2, "zh");
            return sort === "ascending" ? res : -res;
        } 
        //数字比较
        else {
            return sort === "ascending"? value1 - value2:value2 - value1;
        }
    };
}

//时间转换
function dealTimeStr(str){
    var reStr = str;
    //时
    var temp1=[],temp2=[];
    temp1 = reStr.split("hours");
    if(temp1.length>1){
        reStr = temp1[0] + "小时" + temp1[1];
    }
    temp2 = reStr.split("hour");
    if(temp2.length>1){
        reStr = temp2[0] + "小时" + temp2[1];
    }
    //分
    temp1=[],temp2=[];
    temp1 = reStr.split("minutes");
    if(temp1.length>1){
        reStr = temp1[0] + "分" + temp1[1];
    }
    temp2 = reStr.split("minute");
    if(temp2.length>1){
        reStr = temp2[0] + "分" + temp2[1];
    }
    //秒
    temp1=[],temp2=[];
    temp1 = reStr.split("seconds");
    if(temp1.length>1){
        reStr = temp1[0] + "秒" + temp1[1];
    }
    temp2 = reStr.split("second");
    if(temp2.length>1){
        reStr = temp2[0] + "秒" + temp2[1];
    }
    return reStr;
}

//校验是否是数字
function isNumber(val) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(val) || regNeg.test(val)) {
        return true;
    } else {
        return false;
    }
}
//导出多个工作簿Excel
function exprotex(jsonData, defaultTitle) {
    export2ExcelMultiSheet(jsonData, defaultTitle)
}
/**
 * 2022 06 09 zyp
 * 只针对数字类型的字段的新增ID  字符串类型的生成数字ID之后转换一下类型即可
 * db:数据库  指zsio配置文件中conf.json中MDB 这个库的连接 比如还有其他HDB CDB XDB库，对应的db就是这个指这个库名
 * tablename:数据表名
 * ColumnName:新增ID的数据表列名
 * pre_str:字母前面拼接的字符串
 * id_length:除了字母之后的数字部分的长度
 */
function getNewID(db, tablename, ColumnName, pre_str, id_length) {
    var tempid = null;
    var postdata = {
        "t": "mdb\\get",
        "i": top.LogInfor.sid,
        "d": {
            "getwhat": "keyid_new",
            "db": db,
            "model": tablename,
            "column": ColumnName,
            "prestr": pre_str ? pre_str : null,
            "idlength": id_length ? id_length : 0
        }
    }
    var getdata = RequestHd(postdata);
    var tempfal = getdata.d ? true : false;
    if (tempfal) {
        tempid = getdata.d;
    }
    return tempid;
}

function export2ExcelMultiSheet(jsonData, defaultTitle) {
    let data = jsonData;
    for (let item of data) {
        item.data.unshift(item.th);
    }
    let wb = new Workbook();
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
}
/**
 * 下一工单的任务申请请求 根据项目按段/路径/单元来申请工单传参数 2022 -07 18 zyp
 * @param {*} isDownParas 是否下发控制配方参数
 * @param {*} cell_id  工段编码
 * @param {*} cellpath_id  路径编码
 * @param {*} unit_id  单元编码
 * @param {*} task_id  工单号
 * @param {*} ack_time  工单申请时间戳
 */
function TaskDownLoad(isDownParas, cell_id, cellpath_id, unit_id, task_id, ack_time) {
    var postdata = {
        "t": "prdtask\\unitcmd_status",
        "i": top.LogInfor.sid,
        "d": {
            STATUS: 1,
            RECIPEFLAG: isDownParas,
            TASKID: task_id, // string    可为空N  工单号
            ACKTIME: ack_time // string    可为空Y  时间戳(格式化:yyyy-MM-dd HH:mm:ss)
        }
    }
    if (cell_id) {
        postdata.d["CELLID"] = cell_id;
    }
    if (cellpath_id) {
        postdata.d["CELLPATHID"] = cellpath_id;
    }
    if (unit_id) {
        postdata.d["UNITID"] = unit_id;
    }
    var getdata = RequestHd(postdata);
    return getdata;

}
/**
 * 手动触发报工事件 2022 -07 28 zyp
 * @param {*} task_id  报工指定的工单号
 * @param {*} ack_time 报工事件触发事件
 */
function TaskReportData(task_id, ack_time) {
    var postdata = {
        "t": "prdtask\\celltask_status",
        "i": top.LogInfor.sid,
        "d": {
            STATUS: 7, // number    可为空N  
            TASKID: task_id, // string    可为空N 指定工单号
            ASKTIME: ack_time // string    可为空Y 申请时间戳(格式化:yyyy-MM-dd HH:mm:ss)
        }
    };
    var getdata = RequestHd(postdata);
    return getdata;
}

///上传文件到服务器
///path：上传到服务器的文件目录
///filename:保存的文件名称
///file：文件对象
///return：成功为空字符串，失败为错误信息
//2022-04 26 zyp 
function UploadFile(path, filename, file) {
    try {
        var result_data = "";
        if (path && path != '' && filename && filename != '' && file) {
            var formData = new FormData();
            formData.append("session_uid", top.LogInfor.sid);
            formData.append("path", path);
            formData.append("filename", filename);
            formData.append("image", file);
            $.ajax({
                async: false,
                url: pds_url + "/upload",
                cache: false, //不需要缓存
                type: "POST",
                processData: false, //告诉jquery不要去处理发送的数据
                contentType: false,
                data: formData,
                success: function (data) {
                    result_data = data.s === 0 ? "" : data.m;
                },
                error: function (data) {
                    result_data = '文件上传异常!';
                }
            })
        }
        return result_data;
    } catch (e) {
        return e.message;
    }
}

///下载文件
///url：下载文件路径
///filename：下载下来的文件名：注：对于后端这个文件名是可有可无的
//2022 04 26 zyp
function DownLoadFile(url, filename) {
    //var filedata;
    var postMsg = {
        "t": "doc\\download",
        "i": top.LogInfor.sid,
        "d": {
            "filefullpath": url,
            "filedownname": filename
        }
    };
    axios.post(pds_url + '/api', JSON.stringify(postMsg), {
        responseType: 'blob',
    }).then(res => {
        let blob = new Blob([res.data]); //response.data为后端传的流文件
        let downloadFilename = filename; //设置导出的文件名
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            //兼容ie浏览器
            window.navigator.msSaveOrOpenBlob(blob, downloadFilename)
        } else {
            //谷歌,火狐等浏览器
            let url = window.URL.createObjectURL(blob);
            let downloadElement = document.createElement("a");
            downloadElement.style.display = "none";
            downloadElement.href = url;
            downloadElement.setAttribute('download', filename)
            document.body.appendChild(downloadElement);
            downloadElement.click();
            document.body.removeChild(downloadElement);
        }
    }).catch(err => {
        console.log(err.message)
    });
}
/**
 * 移除服务上存储的文档
 * filefullpath:移除的路径带文件名
 */
function removeDBfile(filefullpath) {
    var postMsg = {
        "t": "doc\\remove",
        "i": top.LogInfor.sid,
        "d": {
            "filefullpath": filefullpath
        }
    };
    var postdata = RequestHd(postMsg);
    return postdata.s;
}

//时间控件
var pickerOptions = {
    shortcuts: [{
        text: '最近5分钟',
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 300 * 1000);
            picker.$emit('pick', [start, end]);
        }
    }, {
        text: '最近15分钟',
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 900 * 1000);
            picker.$emit('pick', [start, end]);
        }
    }, {
        text: '最近30分钟',
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 0.5 * 1000);
            picker.$emit('pick', [start, end]);
        }
    }, {
        text: '最近1小时',
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000);
            picker.$emit('pick', [start, end]);
        }
    }, {
        text: '最近3小时',
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 3 * 1000);
            picker.$emit('pick', [start, end]);
        }
    }],
    // 禁用当天之后的日期				
    disabledDate(date) {
        //disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
        return (
            date.getTime() > new Date(dateTrans(Date.now()).substring(0, 10) + " 23:59:59").getTime()
        )
    },
}

//获取checkbox select 等等选择某一个值时返回想要的结果  值为0或1的时候放回true or false（反之亦然）
function selecteChangeA(value) {
    var return_data;
    if (value == true) {
        return return_data = 1;
    } else {
        return return_data = 0;
    }
}

//判定值为0或1 返回值为true 或者false
function selecteChangeB(value) {
    var return_data;
    if (value = 1) {
        return result_data = true;
    } else {
        return result_data = false;
    }
}

//全局存储用户登录信息
//UseID-账户ID
//UserName-账户名称
//sid-账户会话连接码
//UseRole-账户角色
//loginstatus-账户登陆状态
//2022 04 20
//登录账户IP clientip
//用户权限菜单UserRights
var LogInfor = {
    "UserID": "",
    "UserName": "",
    "sid": "",
    "UseRole": "",
    "loginstatus": "",
    "clientip": "",
    "UserRights": []
};

var logpds = {
    "eid": "",
    "uid": "",
    "pwd": "",
    "verify_code": "",
    "loginstatus": ""
};

function startLoading() {
    loading = Loading.Service({
        lock: true,
        text: '数据加载中，请稍后... ...',
        background: 'rgba(0,0,0,0.3)'
    })
}

function endLoading() {
    loading.close();
}

//将数组对象的键统一做替换
function handleDealFilter(arr, keylist, replaceKeylist) {
    let newArr = [];
    if (keylist.length != replaceKeylist.length)
        return newArr;

    //剔除数组中的冗余字段
    arr.forEach((t, index) => {
        let init = {};
        keylist.forEach(item => {
            init[item] = 0;
        });
        replaceKeylist.forEach((item, index) => {
            if (item in t) {
                init[keylist[index]] = t[item];
            }
        });
        newArr.push(init);
    });
    return newArr;
}
//时间格式
function dateTrans(sdata) {
    var date = new Date(sdata);
    var now = "";
    now = date.getFullYear() + "-";
    now = now + this.mendZero(date.getMonth() + 1) + "-";
    now = now + this.mendZero(date.getDate()) + " ";
    now = now + this.mendZero(date.getHours()) + ":";
    now = now + this.mendZero(date.getMinutes()) + ":";
    now = now + this.mendZero(date.getSeconds()) + "";
    return now;
}

//时间格式
function newdate() {
    var date = new Date();
    var now = "";
    now = date.getFullYear() + "-";
    now = now + this.mendZero(date.getMonth() + 1) + "-";
    now = now + this.mendZero(date.getDate()) + " ";
    now = now + this.mendZero(date.getHours()) + ":";
    now = now + this.mendZero(date.getMinutes()) + ":";
    now = now + this.mendZero(date.getSeconds()) + "";
    return now;
}


function mendZero(num) { //时间格式添0
    return (num = num < 10 ? '0' + num : num)
}

//操作数据成功用户提示
function successInfo_popWin(ob) {
    ob.$message({
        showClose: true,
        type: 'success',
        message: "操作成功！"
    });
}

//操作数据错误用户提示
function failInfo_popWin(ob, reason) {
    ob.$message({
        showClose: true,
        type: 'error',
        message: "操作失败:" + reason
    });
}

//请求数据操作
function RequestHd(_data) {
    var _suburl = "/api";
    if (_data.t.startsWith("mdb\\"))
        _suburl = "/mdb"
    if (_data.t.startsWith("hdb\\"))
        _suburl = "/hdb";
    if (_data.t.startsWith("cdb\\"))
        _suburl = "/cdb";
    if (_data.t.startsWith("msg\\"))
        _suburl = "/msg";
    if (_data.t.startsWith("qua\\")) {
        if (_data.t.startsWith("qua\\"))
            _suburl = "/qua/out";
        else
            _suburl = "/qua";
    }
    if (_data.t.startsWith("web\\"))
        _suburl = "/web";
    var result_data;
    $.ajax({
        type: 'POST',
        url: pds_url + _suburl,
        async: false,
        data: JSON.stringify(_data),
        Content_Type: 'application/json',
        dataType: "JSON",
        beforeSend: function (xhr) {
            //$('#main').busyLoadFull("show", { background: "rgba(0, 51, 101, 0.83)", image: "tardis", animate: "slide" });
        },
        success: function (data) {
            result_data = data;
            //$('#main').busyLoadFull("hide", { animate: "fade" });
        },
        error: function () {
            result_data = null;
        }
    });

    if (result_data) {
        if (result_data.s == -1) {
            if (result_data.m.indexOf("invalid") > -1)
                window.top.location = "login.html";
        }
    }
    return result_data;
}

//taskid：工单号
//unitid:单元编码
//provsOb:信息点值对象{a:199,b:200}
function changDocValue(taskid,unitid,provsOb) {
    var postdata = {
        "t": "prdtask\\celltask_prddoc",
        "i": top.LogInfor.sid,
        "d": {
            "TASKID": taskid,
            "UNITID": unitid,
            "PROVS":provsOb
        }
    }
    var ans = RequestHd(postdata);
    return ans;
}


/*selDefSqlStr：自定义查询sql语句，不支持对数据库的修改*/
function selfSql_One(selfDefSqlStr) {
    var postdata = {
        "t": "mdb\\get",
        "i": top.LogInfor.sid,
        "d": {
            "db": "MDB",
            "sqlstr": selfDefSqlStr
        }
    }
    var ans = RequestHd(postdata);
    return ans;
}

/*
带排序的数据库查询通用方法
tableNmae：表名
rulers：规则[]
orderCondition：排序条件【字段 升/降序】【LOGTIME asc/desc】
 */
function selfSql_Two(tableName, rulers, orderCondition) {
    var postdata = {
        "t": "mdb\\get",
        "i": top.LogInfor.sid,
        "d": {
            "db": "MDB",
            "model": tableName,
            "cons": rulers,
            "orderby": orderCondition,
            "sqlstr": null
        }
    }
    var ans = RequestHd(postdata);
    return ans;
}

//MDB | HDB | CDB 获取，删除数据
function GetorDelData(_method, _modelname, _cons, _orderby) {
    if (_orderby) {
        return {
            "t": _method,
            "i": top.LogInfor.sid,
            "d": {
                "model": _modelname,
                "cons": _cons,
                "orderby": _orderby
            }
        }
    }
    return {
        "t": _method,
        "i": top.LogInfor.sid,
        "d": {
            "model": _modelname,
            "cons": _cons,
        }
    };
}

//MDB | CDB 添加数据
function addData(_method, _modelname, _values) {

    var _data = {
        "t": _method,
        "i": top.LogInfor.sid,
        "d": {
            "model": _modelname,
            "values": _values
        }
    }
    return _data;
}

//MDB 更新保存数据
function saveData(_modelname, _values, _cons) {
    var _data = {
        "t": "mdb\\save",
        "i": top.LogInfor.sid,
        "d": {
            "model": _modelname,
            "values": _values,
            "cons": _cons
        }
    }
    return _data;
}

//批次质量指标信息提取接口
function getQUAData(_batchid, _taskid, _cmdid, t, _ids) {
    var _data = {
        "t": "qua\\get",
        "i": top.LogInfor.sid,
        "d": {
            "t": "qua",
            "p": {
                "BatchID": _batchid,
                "TaskID": _taskid,
                "CmdID": _cmdid,
                "t": t,
                "ids": _ids,
            }
        }
    }
    return _data;
}

//批次考核打分接口
function getQMSData(_quaresult) {
    var _data = {
        "t": "qua\\get",
        "i": top.LogInfor.sid,
        "d": {
            "t": "QuaData",
            "d": _quaresult
        }
    }
    return _data;
}

//页面加载数据 qua批次指标数据
function loaddataQUA(_batchid, _taskid, _cmdid, t, _ids) {
    var postdata = getQUAData(_batchid, _taskid, _cmdid, t, _ids);
    var data = RequestHd(postdata);
    return data;
}

//页面加载数据 批次考核打分接口
function loaddataQMS(_quaresult) {
    var postdata = getQUAData(_quaresult);
    var data = RequestHd(postdata);
    return data;
}

//CDB  获取redis实时数据
//_type:1按信息点列表提取|0按分组号列表提取
//"ids":["100703BatchIDNow","100703P0008"]
function getCDBData(_type, _ids) {
    var _data = {
        "t": "cdb\\get",
        "i": top.LogInfor.sid,
        "d": {
            "t": _type,
            "ids": _ids
        }
    }
    return _data;
}

//设置cdb缓存库的值
function cdbEncrypt(str) {
    var _data = {
        "t": "cdb\\aes_encrypt",
        "i": top.LogInfor.sid,
        "d": str
    }
    return RequestHd(_data);
}

//设置cdb缓存库的值
function setCDBData(oblist) {
    var _data = {
        "t": "cdb\\set",
        "i": top.LogInfor.sid,
        "d": {}
    }
    oblist.forEach(item => {
        _data.d[item.key] = item.value
    })
    
    _data.d = cdbEncrypt(_data.d).d;
    return _data;
}

//TIMMSDBData物流系统数据库接口
function getTIMMSDBData(_model, _cons) {
    var _data = {
        "t": "mdb\\get",
        "i": top.LogInfor.sid,
        "d": {
            "db": "TIMMSDB",
            "model": _model,
            "cons": _cons
        }
    }
    return _data;
}

//getTIMMS238DBData物流系统数据库接口
function getTIMMS238DBData(_model, _cons) {
    var _data = {
        "t": "mdb\\get",
        "i": top.LogInfor.sid,
        "d": {
            "db": "TIMMS238DB",
            "model": _model,
            "cons": _cons
        }
    }
    return _data;
}

//APSDB排产系统数据库接口
function getAPSDBData(_model, _cons) {
    var _data = {
        "t": "mdb\\get",
        "i": top.LogInfor.sid,
        "d": {
            "db": "APSDB",
            "model": _model,
            "cons": _cons
        }
    }
    return _data;
}

//HDB  获取时序数据
/*_tsdOutFormat:
0-默认值，采集点数组列表:[[时间戳,采集值,有效标记],]
1-采集点字典对象数组列表:[{'TS':时间戳,'DV':采集值,'DF':有效标记},]
2-采集点各字段数组列表:{'TS':[时间戳,],'DV':[采集值,],'DF':[有效标记,]}*/
function getHDBData(_StartTime, _EndTime, _tsdOutFormat, _type, _ids) {
    var _data = {
        "t": "hdb\\get",
        "i": top.LogInfor.sid,
        "d": {
            "StartTime": _StartTime,
            "EndTime": _EndTime,
            "tsdOutFormat": _tsdOutFormat,
            "t": _type,
            "ids": _ids
        }
    }
    return _data;
}

//getHDBData_batch(_BatchID, _TaskID, _StartTime, _EndTime, _iscl, _tsdOutFormat, _type, _ids);
//HDB  获取时序数据,批次工单相关，批次或工单，或开始结束时间，3项必须有1，如果都有，匹配不上将无法获取数据
//
function getHDBData_batch(_batchid, _taskid, _StartTime, _EndTime, _iscl, _tsdOutFormat, _type, _ids) {
    var _data = {
        "t": "hdb\\get",
        "i": top.LogInfor.sid,
        "d": {
            "BatchID": _batchid,
            "TaskID": _taskid,
            "StartTime": _StartTime,
            "EndTime": _EndTime,
            "DataCleaning": _iscl,
            "tsdOutFormat": _tsdOutFormat,
            "t": _type,
            "ids": _ids
        }
    }
    return _data;
}

//QUA 指标重算接口
function getHQUAData(_batchid, _taskid, _cmdid, _iscl, _isgetqua, _isrequa, _issavequa, _isgroup, _isGetResult, _ids) {
    var _data = {
        "t": "qua\\get",
        "i": top.LogInfor.sid,
        "d": {
            "t": "tsd",
            "p": {
                "BatchID": _batchid,
                "TaskID": _taskid,
                "CmdID": _cmdid,
                "DataCleaning": _iscl,
                "GetWithQuaResult": _isgetqua,
                "ReStatic": _isrequa,
                "SaveQuaResult": _issavequa,
                "t": _isgroup,
                "OutResult": _isGetResult,
                "ids": _ids,
            }
        }
    }
    return _data;
}

//QUA 指标重算接口(根据单元)
function ReStaticQUAData(_cmdid, _isgroup, _ids) {
    var _data = {
        "t": "qua\\set",
        "i": top.LogInfor.sid,
        "d": {
            "t": "qua",
            "p": {
                "CmdID": _cmdid,
                "t": _isgroup,
                "ids": _ids
            }
        }
    }
    return _data;
}

function getQSPCData_zk(_batchid, _taskid, _cmdid, _ichartype, _did, sid) {
    var _data = {

        "t": "qua\\get",
        "i": sid,
        "d": {
            "t": "spc",
            "p": {
                "BatchID": _batchid,
                "TaskID": _taskid,
                "CmdID": _cmdid,
                "GetOption": _ichartype,
                "did": _did
            }
        }
    }
    return _data;
}

function getQSPCData(_batchid, _taskid, _cmdid, _ichartype, _did) {
    var _data = {

        "t": "qua\\get",
        "i": top.LogInfor.sid,
        "d": {
            "t": "spc",
            "p": {
                "BatchID": _batchid,
                "TaskID": _taskid,
                "CmdID": _cmdid,
                "GetOption": _ichartype,
                "did": _did
            }
        }
    }
    return _data;
}

//批次考核打分  _dataType:OfflineData-离线数据  PrdData-产耗数据 QuaData-考核数据
function getScore(_dataType, _values) {
    var _data = {
        "t": "asessment\\set",
        "i": top.LogInfor.sid,
        "d": {
            "t": _dataType,
            "d": _values
        }
    }
    return _data;
}

//ReoprtDat数据，获取到数据文件的二进制流
function getReoprtData(_batchid, _isDataCleaning, _isGroupData, _ids) {
    var _data = {

        "t": "qua\\get",
        "i": top.LogInfor.sid,
        "d": {
            "t": "tsd",
            "p": {
                "BatchID": _batchid,
                "DataCleaning": _isDataCleaning,
                "t": _isGroupData,
                "ids": _ids
            }
        }
    }
    return _data;
}

//检查field是否重复
function checkData(tableName, _rules) {
    return RequestHd({
      "t": "mdb\\get",
      "i": top.LogInfor.sid,
      "d": {
          "getwhat": "keyid_check",
          "db": "MDB",
          "model": tableName,
          "cons": _rules
        }
    })
  }

//页面加载数据
function loaddata(tablename, _rules, _orderby) {
    var postdata = GetorDelData("mdb\\get", tablename, _rules, _orderby)
    var data = RequestHd(postdata);
    return data;
}

//页面加载数据 cdb
function loaddataCDB(_type, _ids) {
    var postdata = getCDBData(_type, _ids);
    var data = RequestHd(postdata);
    return data;
}

//页面写数据 cdb
function setdataCDB(oblist) {
    var postdata = setCDBData(oblist);
    var data = RequestHd(postdata);
    return data;
}

//页面加载数据 APSDB
function loaddataAPSDB(_model, _cons) {
    var postdata = getAPSDBData(_model, _cons);
    var data = RequestHd(postdata);
    return data;
}

//页面加载数据 TIMMSDB
function loaddataTIMMSDB(_model, _cons) {
    var postdata = getTIMMSDBData(_model, _cons);
    var data = RequestHd(postdata);
    return data;
}

//页面加载数据 TIMMSDB
function loaddataTIMMS238DB(_model, _cons) {
    var postdata = getTIMMS238DBData(_model, _cons);
    var data = RequestHd(postdata);
    return data;
}

//页面加载数据 hdb
function loaddataHDB(_StartTime, _EndTime, _tsdOutFormat, _type, _ids) {
    var postdata = getHDBData(_StartTime, _EndTime, _tsdOutFormat, _type, _ids);
    var data = RequestHd(postdata);
    return data;
}

//页面加载数据 hdb,获取按照批次或工单归集的数据
/* 
 * @param {*} _batchid //批次号
 * @param {*} _taskid //工单号
 * @param {*} _StartTime //开始时间
 * @param {*} _EndTime //结束时间
 * @param {*} _iscl //是否数据清洗
 * @param {*} _tsdOutFormat //输出格式
 * @param {*} _type //1分组0不分组
 * @param {*} _ids //数据点数组对象
 */
function loaddataHDB_batch(_batchid, _taskid, _StartTime, _EndTime, _iscl, _tsdOutFormat, _type, _ids) {
    var postdata = getHDBData_batch(_batchid, _taskid, _StartTime, _EndTime, _iscl, _tsdOutFormat, _type, _ids);
    var data = RequestHd(postdata);
    return data;
}

//页面加载数据 //QUA 指标重算接口
function loaddataHQUA(_batchid, _taskid, _cmdid, _iscl, _isgetqua, _isrequa, _issavequa, _isgroup, _isOutResult, _ids) {
    var postdata = getHQUAData(_batchid, _taskid, _cmdid, _iscl, _isgetqua, _isrequa, _issavequa, _isgroup, _isOutResult, _ids);
    var data = RequestHd(postdata);
    return data;
}

//页面加载数据 hqua批次时序数据
function loaddataQSPC_zk(_batchid, _taskid, _cmdid, _ichartype, _did, sid) {
    var postdata = getQSPCData_zk(_batchid, _taskid, _cmdid, _ichartype, _did, sid);
    var data = RequestHd(postdata);
    return data;
}

//页面加载数据 hqua批次时序数据
function loaddataQSPC(_batchid, _taskid, _cmdid, _ichartype, _did) {
    var postdata = getQSPCData(_batchid, _taskid, _cmdid, _ichartype, _did);
    var data = RequestHd(postdata);
    return data;
}

//页面加载数据 ReoprtDat数据，获取到数据文件的二进制流
function loaddataReoprtData(_batchid, _isDataCleaning, _isGroupData, _ids) {
    var postdata = getReoprtData(_batchid, _isDataCleaning, _isGroupData, _ids);
    var data = RequestHd(postdata);
    return data;
}

//获取客户端IP地址
function getClientIP() {
    var postdata = {
        "t": "test\\hello",
        "i": top.LogInfor.sid,
        "d": {}
    }
    var data = RequestHd(postdata);
    return data;
}

//获取设备树的数据 开始节点为-线-段-单元
function GetUnitTreeNodes(ParentEqu, GetData) {
    var nodes = [];
    var childtwodata = [];
    try {
        var paras = ParentEqu == null ? [{
            "cn": "EE_Level",
            "cp": "=",
            "v1": 3,
            "v2": null
        }] : [{
            "cn": "ContainedIn",
            "cp": "=",
            "v1": ParentEqu,
            "v2": null
        }];
        paras.push({
            "cn": "EE_Type",
            "cp": "=",
            "v1": 2,
            "v2": null
        });
        var equsdata = GetorDelData("mdb\\get", "BXT_EQUIPELEMENT", paras);
        var equs = RequestHd(equsdata);
        var equsD = equs.d;
        $(equsD).each(
            function (i, equx) {
                var nodex = {
                    id: equx.EQUIPMENTID,
                    label: equx.EQUIPMENTNAME,
                    children: []
                };
                nodex.children = GetUnitTreeNodes(equx.EQUIPMENTID, GetData);
                if (equx.EE_Level == 5 && !GetData) {
                    childtwodata.push({
                        UnitID: equx.EQUIPMENTID,
                        UnitName: equx.EQUIPMENTNAME
                    });
                }
                if (equx.EE_Level == 5 && GetData) {
                    var _cons = [{
                        "cn": "ENUMSET",
                        "cp": "=",
                        "v1": "PropertyGroup",
                        "v2": null
                    }];
                    var EnumD = GetorDelData("mdb\\get", "BXT_Enumeration", _cons);
                    var EnumData = RequestHd(EnumD);
                    $($.Enumerable.From(EnumData.d)).each(
                        function (i, pg) {
                            var pnode = {
                                id: 'G' + pg.EnumValue,
                                label: pg.EnumString,
                                children: []
                            };
                            var _cons1 = [{
                                "cn": "EQUIPMENTID",
                                "cp": "=",
                                "v1": equx.EQUIPMENTID,
                                "v2": null
                            }, {
                                "cn": "PropertyGroup",
                                "cp": "=",
                                "v1": pg.EnumValue,
                                "v2": null
                            }]
                            var pnodeD = GetorDelData("mdb\\get", "BXT_Enumeration", _cons1);
                            var pnodeData = RequestHd(pnodeD);
                            $($.Enumerable.From(pnodeData.d)).each(
                                function (i, datax) {
                                    pnode.children.push({
                                        id: datax.PropertyID,
                                        label: datax.PropertyName,
                                        children: []
                                    });
                                });
                            if (pnode.children.length > 0)
                                nodex.children.push(pnode);
                        });
                }
                nodes.push(nodex);
            });
    } catch (e) {}
    return nodes;
}

//按品牌任务模板添加批次任务
function addBatchs(_ModelCode, _BatchID, _SchedStartTime, _REID, _AREAID, _BATCHSIZE, _SCHEDSTATUS) {
    var _data = {
        "t": "prdtask\\newbatch",
        "i": top.LogInfor.sid,
        "d": {
            "MODELCODE": _ModelCode,
            "BATCHID": _BatchID,
            "SCHEDSTARTTIME": _SchedStartTime,
            "REID": _REID,
            "AUTHOR": top.LogInfor.UserName,
            "AREAID": _AREAID,
            "BATCHSIZE": _BATCHSIZE,
            "SCHEDSTATUS": _SCHEDSTATUS
        }

    }
    return _data;
}

// 添加已存在批次的工段任务
function addTasks(_BatchID, _TaskID, _ProductID, _CellID, _PathID, _REID, _REID2, _PLANQTY, _STARTTIME, _SCHEDSTATUS) {
    var _data = {
        "t": "prdtask\\newtask",
        "i": top.LogInfor.sid,
        "d": {
            "BATCHID": _BatchID,
            "TASKID": _TaskID,
            "PRODUCTID": _ProductID,
            "CELLID": _CellID,
            "PATHID": _PathID,
            "REID": _REID,
            "REID2": _REID2,
            "AUTHOR": top.LogInfor.UserName,
            "PLANQTY": _PLANQTY,
            "STARTTIME": _STARTTIME,
            "SCHEDSTATUS": _SCHEDSTATUS
        }
    }
    return _data;
}

//获取HDB数据的接口
function GetHDBData(_batchid, _starttime, _endtime, _datacleaning, _tsdoutformat, _t, _ids) {
    var _data = {
        "t": "hdb\\get",
        "i": top.LogInfor.sid,
        "d": {
            "BatchID": _batchid,
            "StartTime": _starttime,
            "EndTime": _endtime,
            "DataCleaning": _datacleaning,
            "tsdOutFormat": _tsdoutformat,
            "t": _t,
            "ids": _ids
        }
    }
    return _data;
}
/**
 * 
 * @param {*批次号} _batchid 
 * @param {*工单号} _taskid 
 * @param {*获取数据开始时间} _starttime 
 * @param {*获取数据结束时间} _endtime 
 * @param {*是否清洗数据} _datacleaning 
 * @param {*时序数据输出格式选项} _tsdoutformat 
 * @param {*是否要简要的输出时序表格式选项} _simpleformat 
 * @param {*是否需要对数据进行简要的统计分析} _simpstatic 
 * @param {*统计分析的中心值} _staval 
 * @param {*统计分析的上限值} _upval 
 * @param {*统计分析的下限值} _lowval 
 * @param {*按数组还是按分组来提取时序表} _t 
 * @param {*信息点编码列表} _ids 
 * @returns 
 */
//获取HDB数据的接口-完整的参数 2022-5-20 zyp
function GetHDBDataAll(_batchid, _taskid, _starttime, _endtime, _datacleaning, _tsdoutformat, _simpleformat, _simpstatic, _staval, _upval, _lowval,_BestCenter, _t, _ids) {
    var _data = {
        "t": "hdb\\get",
        "i": top.LogInfor.sid,
        "d": {
            "BatchID": _batchid,
            "TaskID": _taskid,
            "StartTime": _starttime,
            "EndTime": _endtime,
            "DataCleaning": _datacleaning,
            "tsdOutFormat": _tsdoutformat,
            "SimpleFormat": _simpleformat,
            "SimpleStatic": _simpstatic,
            "StandardV": _staval,
            "UpperLimitV": _upval,
            "LowerLimitV": _lowval,
            "BestCenter":_BestCenter,
            "t": _t,
            "ids": _ids
        }
    }
    return _data;
}
//2022-5-20 zyp
function loadHDB_ALL(_batchid, _taskid, _starttime, _endtime, _datacleaning, _tsdoutformat, _simpleformat, _simpstatic, _staval, _upval, _lowval,_BestCenter,_t, _ids) {
    var postdata = GetHDBDataAll(_batchid, _taskid, _starttime, _endtime, _datacleaning, _tsdoutformat, _simpleformat, _simpstatic, _staval, _upval, _lowval,_BestCenter, _t, _ids);
    var getdata = RequestHd(postdata);
    return getdata;
}

//filterVal表头数组
//jsonData数据对象
function formatJson_excelex(filterVal, jsonData) {
    return jsonData.map(v => filterVal.map(j => v[j]))
}

/* 操作日志写入方法
 * @param {*} AppID //系统名称，1为pms
 * @param {*} OperDesc //日志内容描述
 * @param {*} userName //用户名称
 * @param {*} ipaddress //客户端ip地址
 */
function addUserOperLog(OperDesc, userName, ipaddress) {
    var addlog = {};
    var opresult = '';
    addlog.APPID = 'ksec.pms';
    if (userName)
        addlog.USERNAME = userName;
    else {
        userName = top.LogInfor ? top.LogInfor.UserName : "system";
        addlog.USERNAME = userName;
    }
    if (ipaddress)
        addlog.CLIENTIP = ipaddress;
    else {
        ipaddress = top.LogInfor ? top.LogInfor.clientip : "unknown";
        addlog.CLIENTIP = ipaddress;
    }
    addlog.OPERTIME = 'datetime(' + formatJSdatetime(new Date()) + ')';
    addlog.OPERDESC = OperDesc;
    var addreq = addData("mdb\\add", "USER_OPERLOG", addlog);
    //console.log(addlog)
    var addResult = RequestHd(addreq);
    opresult = addResult.s;
    return opresult;
}

/* 操作日志写入方法
 * @param {*} AppID //系统名称，1为pms
 * @param {*} OperDesc //日志内容描述
 * @param {*} userName //用户名称
 * @param {*} ipaddress //客户端ip地址
 */
function addUserOperLog_PDS(AppID, OperDesc, userName, ipaddress) {
    var addlog = {};
    var opresult = '';
    ipaddress = getClientIP().m;
    addlog.APPID = AppID;
    if (userName)
        addlog.USERNAME = userName;
    else {
        userName = top.LogInfor ? top.LogInfor.UserName : "system";
        addlog.USERNAME = userName;
    }
    addlog.OPERTIME = 'datetime(' + formatJSdatetime(new Date()) + ')';
    addlog.CLIENTIP = ipaddress ? ipaddress.substring(6, ipaddress.length) : 'unkonwn';
    addlog.OPERDESC = OperDesc;
    var addreq = addData("mdb\\add", "USER_OPERLOG", addlog);
    var addResult = RequestHd(addreq);
    opresult = addResult.s;
    return opresult;
}

//操作日志写入方法
/**
 * 
 * @param {*} AppID //系统名称，1为pms
 * @param {*} OperDesc //日志内容描述
 * @param {*} userName //用户名称
 * @param {*} ipaddress //客户端ip地址
 */
function addUserOperLog_timestamp(AppID, OperDesc, userName, ipaddress) {
    var addlog = {};
    var opresult = '';
    ipaddress = getClientIP().m;
    addlog.APPID = AppID;
    if (userName)
        addlog.USERNAME = userName;
    else {
        userName = top.LogInfor ? top.LogInfor.UserName : "system";
        addlog.USERNAME = userName;
    }
    addlog.OPERTIME = 'datetime(' + formatJSdatetime(new Date()) + ')';
    addlog.CLIENTIP = ipaddress ? ipaddress.substring(6, ipaddress.length) : 'unkonwn';
    addlog.OPERDESC = OperDesc;
    addlog.OPSTAMPCHAR = getjstimestamp();
    var addreq = addData("mdb\\add", "USER_OPERLOG", addlog);
    var addResult = RequestHd(addreq);
    opresult = addResult.s;
    return opresult;
}

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

    var timenow = datetime.toLocaleString('chinese', {
        hour12: false
    });
    timenow = timenow.substring(timenow.length - 8, timenow.length);
    var error24 = timenow.indexOf('24:'); //2021-09-18 24:00:21
    if (error24 == 0) {
        timenow = timenow.replace('24:', '00:');
    }
    var fdatetime = year + '-' + month + '-' + date + ' ' + timenow;
    return fdatetime;
}

//获取时间戳
/**
 * 
 * @param {*} isjs//fasle转为字符串格式，true保留js时间戳原格式
 * @param {*} jsdate //传入的时间字符串，如果没有默认使用当前时间
 */
function getjstimestamp(isjs, jsdate) {
    var fdatetime = '';
    if (!jsdate) {
        fdatetime = new Date();
        fdatetime = fdatetime.getTime()
    } else {
        fdatetime = new Date(jsdate); //2021-4-1 11:53:15
        fdatetime = fdatetime.getTime()
    }
    if (!isjs)
        fdatetime = fdatetime.toString();
    return fdatetime;
}

/**
 * 效率更高的去重函数，使用map对象,返回去重后的键值对，可用于table带过滤条件列的下拉列表
 * @param {*} sourceJson //需要去重的数组
 * @param {*} colid //指定进行去重的列,id所在列
 * @param {*} colname //id对应的文字描述列，若没有也不可为空，可以指定成colid相同的列
 * @param {*} isitemobj //去重后对象是否带原始对象,数组对象
 * @param {*} sortcol //排序列，可选
 */
function getDistinctList(sourceJson, colid, colname, isitemobj, sortcol) {
    var filterlist = [];
    var tempArray = [];
    sourceJson.forEach((item) => {
        tempArray.push([item[colid], item[colname]]); // 转化成Map结构，通过键名查找
    })
    var distMap = new Map(tempArray);
    let obj = Object.create(null);
    for (let [k, v] of distMap) {
        obj[k] = v;
        var item = {}
        item.value = k;
        item.text = v;
        if (isitemobj) {
            var item_temp = $.Enumerable.From(sourceJson).Where(i => i[colid] == k).ToArray();
            if (item_temp)
                if (item_temp.length > 0) {
                    item.item = [];
                    item.item = item_temp;
                }
        }
        if (sortcol) {
            var seqitem = $.Enumerable.From(sourceJson).Where(sj => sj[colid] == k).ToArray();
            if (seqitem)
                if (seqitem.length > 0) {
                    item.seq = seqitem[0][sortcol];
                }
        }
        filterlist.push(item);

    };
    return filterlist;
}

/**时间计算函数
 * 
 * @param {*} time_source //原始时间，接受js时间格式和'2021-4-1 11:53:15'字符串格式，日期部分-和/符号都可以
 * @param {*} unit //时间单位，枚举，取值'd'/'h'/'m'/'s'(天/小时/分钟/秒)
 * @param {*} interval //需要增加或减少的时间长度，配合时间单位
 * @param {*} delaytype //1增加时长2减去时长
 * @param {*} timetype //1zsio接受的时间字符串2原始的JS时间对象,
 */
function conmputerTime(time_source, unit, interval, delaytype, timetype) {
    var st_js = null;
    var interval_ms = 0; //时间长度，单位秒
    var ts_str = ''; //字符串对象格式的时间结果，日期部分-符
    var ts_js = ''; //js对象格式的时间结果

    var time_result = null; //返回时间结果,转换失败，返回空值
    var sttype = typeof time_source; //获取传入时间的类型，object为时间对象格式，string为字符串需要转换
    if (sttype == 'string') {
        st_js = new Date(time_source);
    }
    if (st_js) { //若传入时间有效
        //时间长度单位统一到秒
        if (unit == 'd') {
            interval_ms = interval * 24 * 60 * 60;
        } else if (unit == 'h') { //小时
            interval_ms = interval * 60 * 60;
        } else if (unit == 'm') { //分钟
            interval_ms = interval * 60;
        } else if (unit == 's') {
            interval_ms = interval;
        }
        //增加还是减少时间
        if (delaytype == 1) {
            st_js.setTime((st_js.getTime()) + interval_ms * 1000);
            ts_js = st_js;
            ts_str = formatJSdatetime(ts_js);

        } else if (delaytype == 2) {
            st_js.setTime((st_js.getTime()) - interval_ms * 1000);
            ts_js = st_js;
            ts_str = formatJSdatetime(ts_js);
        }
    }
    if (timetype == 1) //返回值，1zsio接受的时间字符串2原始的JS时间对象,
        time_result = ts_str;
    if (timetype == 2)
        time_result = ts_js;
    return time_result;
    //st_js.getTime();//JS时间对象转时间戳
    //st_js = new Date(time_source);//字符串转JS时间对象
    //st_js.setTime((st_js.getTime()) + interval_ms * 1000);//JS时间戳进行计算，st_js计算后依然是JS时间对象
    //ts_str = formatJSdatetime(ts_js);//JS时间转为zsio接受的时间字符串(2021-12-12 00:00:00)
}

/**
 * 更新MDB数据
 * @param {*} tablename //表名
 * @param {*} updateitem //更新数据对象
 * @param {*} condition //更新数据条件
 */
function updateMDBData(tablename, updateitem, condition) {
    var updateresult = [];
    var updatereq = saveData(tablename, updateitem, condition);
    updateresult = RequestHd(updatereq);
    return updateresult.s;
};

/**
 * 新增MDB数据
 * @param {*} tablename //表名
 * @param {*} additem //新增数据对象
 */
function addMDBData(tablename, additem) {
    var addresult = [];
    var addreq = addData("mdb\\add", tablename, additem);
    addresult = RequestHd(addreq);
    return addresult.s;
};

/**
 *获取MDB数据新增标识，查看数据是否已存在，true新增false更新
 * @param {*} tablename //表名称
 * @param {*} dacon //查询条件
 */
function getDataItemIsexist(tablename, dacon) {
    var isExist = false;
    var dataitem = [];
    dataitem = loaddata(tablename, dacon).d;

    if (dataitem)
        if (dataitem.length > 0) {
            isExist = true;
        }
    return isExist;
}

/**
 * 获取树结构的每一层，用户点击时才加载子节点时用
 * @param {} tablename //数据库表名
 * @param {} parentcol //父节点id字段名
 * @param {} parentvalue //父节id值
 * @param {} istreenode//如果不是，则后面的idcol、labelcol可以不必赋值
 * @param {} idcol //树节点id
 * @param {} labelcol //树节点名称，用于显示，与树控件的props属性中一致
 * @param {} isinuse  //信息点的启用状态  1-启用  2-未启用  0106-新增
 */
function getTreeNodedata(tablename, parentcol, parentvalue, istreenode, isinuse, idcol, labelcol) {
    var nodedata = [];
    var strfilter = [{
        "cn": parentcol,
        "cp": (parentvalue == null) ? "is" : "=",
        "v1": parentvalue,
        "v2": null
    }];
    if (isinuse != null) {
        strfilter.push({
            "cn": "ISINUSE",
            "cp": "=",
            "v1": isinuse,
            "v2": null
        });
    }
    nodedata = loaddata(tablename, strfilter).d;
    if (nodedata == null) //任何情况下若nodedata为null，则重新初始化数组
        nodedata = [];
    else {
        if (nodedata.length > 0 && istreenode) { //若不是树节点了，则不需要修改json对象
            nodedata.forEach(n => { //修改json对象以符合树控件数据源要求
                n.nid = n[idcol];
                n.nlabel = n[labelcol]; //树控件显示
                n.nodeicon = "";
                n.nodeicon = GetTreeIcon(2);
                n.children = []; //初始化子节点对象
            })
        }
    }
    return nodedata;
}
//加载信息点的属性分组
function getProperGro() {
    var PropertyGroup = [];
    var cons = [{
        "cn": "ENUMSET",
        "cp": "=",
        "v1": "PDS_PropertyGroup",
        "v2": null
    }];
    var getGroup = loaddata("BXT_ENUMERATION", cons);
    if (getGroup.d.length > 0) {
        PropertyGroup = $.Enumerable.From(getGroup.d).ToArray();
    }
    return PropertyGroup;
}

//全加载叶子节点（一棵树节点全在一个表的情况）
/** 
 * Author 杨逐为 2021/12/16
 * 
 * @param {*} alldata 整棵树的数据
 * @param {*} parentid 用于对比的父节点id
 * @param {*} parentitem 存放子节点对应的父节点
 * @param {*} parentcolname 父节点列名
 * @param {*} idcolname id列名
 * @param {*} namecolname 名字列名
 */
function getchildnode(alldata, parentid, parentitem, parentcolname, idcolname, namecolname) {
    parentitem.children = [];
    for (let x = 0; x < alldata.length; x++) {
        if (alldata[x][parentcolname] == parentid) {
            parentitem.children.push({
                //用于展示树节点
                nid: alldata[x][idcolname],
                nlabel: alldata[x][namecolname],
                //用于判断后续节点
                [parentcolname]: alldata[x][parentcolname],
                [idcolname]: alldata[x][idcolname]
            })
        }
    }
    if (parentitem.children.length > 0) {
        parentitem.children.forEach(item => {
            this.getchildnode(alldata, item[idcolname], item, parentcolname, idcolname, namecolname)
        })
    }
};

//设置不同等级的颜色
function pointCellStyles(levelId){
    if(levelId === 1){//一级 重要
        return { 'float': 'right', 'color': '#F56C6C', 'font-weight':'550' };//红
    }else if(levelId === 2){//二级 较重要
        return { 'float': 'right', 'color': '#E6A23C', 'font-weight':'550' };//黄
    }else if(levelId === 3){//三级 普通
        return { 'float': 'right', 'color': '#409EFF', 'font-weight':'550' };//蓝
    }else if(levelId === 4){//四级 无
        return { 'float': 'right','color': '#A0A0A0', 'font-weight':'550' };//默认颜色，只加粗
    }else{
        return {};
    }
}

//设置不同等级的颜色
function pointCellStyles2(levelId) {
    if (levelId === 1) { //一级 重要
        return {
            'color': '#F56C6C',
            'font-weight': '550'
        }; //红
    } else if (levelId === 2) { //二级 较重要
        return {
            'color': '#E6A23C',
            'font-weight': '550'
        }; //黄
    } else if (levelId === 3) { //三级 普通
        return {
            'color': '#409EFF',
            'font-weight': '550'
        }; //蓝
    } else if (levelId === 4) { //四级 无
        return {
            'color': '#A0A0A0',
            'font-weight': '550'
        }; //默认颜色，只加粗
    } else {
        return {};
    }
}
//构造每一个层级的树节点图标
function GetTreeIcon(lev) {
    var treeIcon = ['iconfont icon-yewudanyuan iconpr',
        'iconfont icon-luxianyunshuliuliangtongji iconpr',
        'el-icon-location iconpr',
        'el-icon-s-tools iconpr',
        'iconfont icon-chengzhong iconpr',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
    ];
    if (lev) {
        return treeIcon[lev];
    }
}

//dialog可拖拽
function dragdialog(el) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    const dragDom = el.querySelector('.el-dialog');
    dialogHeaderEl.style.cursor = 'move';
    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null);
    dialogHeaderEl.onmousedown = (e) => {
        // 鼠标按下，计算当前元素距离可视区的距离
        const disX = e.clientX - dialogHeaderEl.offsetLeft;
        const disY = e.clientY - dialogHeaderEl.offsetTop;
        // 获取到的值带px 正则匹配替换
        let styL, styT;
        // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
        if (sty.left.includes('%')) {
            styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100);
            styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100);
        } else {
            styL = +sty.left.replace(/\px/g, '');
            styT = +sty.top.replace(/\px/g, '');
        }
        document.onmousemove = function (e) {
            // 通过事件委托，计算移动的距离
            const l = e.clientX - disX;
            const t = e.clientY - disY;
            // 移动当前元素
            dragDom.style.left = `${l + styL}px`;
            dragDom.style.top = `${t + styT}px`;
            // 将此时的位置传出去
            // binding.value({x:e.pageX,y:e.pageY})
        }
        document.onmouseup = function (e) {
            document.onmousemove = null;
            document.onmouseup = null;
        }
    }
}