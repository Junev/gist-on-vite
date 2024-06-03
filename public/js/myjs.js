var rooturl = getRootPath() + "/Model/";  //2020/3/3  实现跨网段访问系统
function  getRootPath()  {
        //获取当前网址，
        var  curPath  =  window.document.location.href;
        //获取主机地址之后的目录，
        var  pathName  =  window.document.location.pathname;
        var  pos  =  curPath.indexOf(pathName);
        //获取主机地址
        var  localhostPaht  =  curPath.substring(0,  pos);
        //获取带"/"的项目名，
        var  projectName  =  pathName.substring(0,  pathName.substr(1).indexOf('/')  +  1);
        return  (localhostPaht);
}
var pagetitle = "";//本网页的抬头位置信息
    var MessageBox = (function () {
        function MessageBox() { }
        function getdiv(_title, _content) {
            var divx = $("#div_ksecdialog");
            if (divx.length == 0) {
                $("<div id=\"div_ksecdialog\" title=\"这是基本对话框\" hidden=\"hidden\"><p><span class=\"ui-icon ui-icon-alert\" style=\"float:left; margin:0 7px 20px 0;\"></span></p></div>").appendTo('body');
                divx = $("#div_ksecdialog");
            }
            divx.attr("title", _title);
            divx.html("<p class=\"tipinfo\">" + _content + "</p>");
            return divx;
        }
        MessageBox.prototype.DialogResult = "OK";
        MessageBox.prototype.ShowDialogOK = function (_title, _content) {
            var divx = getdiv(_title, _content);
            divx.dialog({
                modal: true,
                buttons: {
                    Ok: function () {
                        $(this).dialog("close");
                    }
                }
            });
        };
        MessageBox.prototype.Result = function (result) { };
        MessageBox.prototype.ShowDialogYESNO = function (_title, _content, fn1) {
            var divx = getdiv(_title, _content);
            divx.dialog({
                modal: true,
                buttons: {
                    YES: function () {
                        var dlg = $(this).dialog("close");
                        fn1 && fn1.call(dlg, true);
                    },
                    NO: function () {
                        $(this).dialog("close");
                        Result.call("NO");
                    }
                }
            });
        };
        return MessageBox;
    }());
    var islogin = false;
    var LogInfor;
    var Common = (function () {
        function Common() { }
        //对外可访问的全局变量及函数
        //从wcf对象服务器抓取需要的类对象
        Common.prototype.GetModelSource = function (_svrurl, _data) {
            var mydata;
            $.ajax({
                url: rooturl + _svrurl,
                type: "POST",
                crossDomain: true,
                contentType: "text/json",
                data: JSON.stringify(_data),
                dataType: "json",
                async: false,
                success: function (returnValue) {
                    mydata = returnValue;
                },
                error: function (e) {
                    if (e.responseText && (e.responseText.indexOf("登录") >= 0 || e.responseText.indexOf("权限") >= 0)) {
                        if (e.responseText.indexOf("未登录") >= 0) {
                            alert("未登录！");
                            top.location = "login.html";
                        };
                        if (e.responseText.indexOf("过期") >= 0) {
                            alert("登录信息已过期，请重新登录！");
                            top.location = "login.html";
                        }
                        if (e.responseText.indexOf("权限") >= 0) {
                            alert("登录用户权限不足！");
                            top.location = "login.html";
                        }
                    }
                    else {
                        if (e.responseText && e.responseText != "") {
                            var errstr = e.responseText;
                            var ss = e.responseText.indexOf('异常消息为') + 5;
                            var se = e.responseText.indexOf('有关详细信息，请参见服务器日志。异常堆栈跟踪为') - 1;
                            if (ss >= 0 && se >= 0)
                                errstr = e.responseText.substring(ss, se);
                            alert(_svrurl + "\n" + JSON.stringify(_data) + "\n" + errstr);
                        }
                    }
                }
            });
            return mydata;
        }
        return Common;
    }());

    var Grid = (function () {

        function Grid() { }
        Grid.prototype.InsertRow = function (Grid, Row, rowClick) {
            if (($("#" + $(Grid).attr('id') + "  tr").length + 1) % 2 == 1)//新增行为奇数行
                Row.addClass('odd');
            Grid.append(Row);
            Row.click(function () {
                $('#' + $(Grid).attr('id') + ' tbody tr.selected').removeClass("selected");
                $(this).addClass("selected");
                rowClick($(this));
            })
        }

        Grid.prototype.Init_Grid = function (Grid, page, settings, Objs, rowClick) {

            var gridstr = "<thead><tr>";
            var cs = [];//各列的绑定字段名称
            $.each(settings[1], function (index, cb) {//grid header
                gridstr += "<th width=\"" + cb.Width + "\">" + cb.Caption + "</th>";
                cs.push(cb.BindColumn);
            });
            gridstr += "</tr></thead><tbody>";
            if (Objs != null) {

                //alert(settings[0].pagenow);
                var startindex = (settings[0].pagenow - 1) * settings[0].onepagecount;
                var endindex = startindex + settings[0].onepagecount;
                endindex = endindex > Objs.length ? Objs.length : endindex;
                for (var i = startindex; i < endindex; i++) {//grid row
                    gridstr += "<tr>";
                    $.each(cs, function (index, c) {

                        gridstr += " <td>" + Objs[i][c] + "</td>";//grid row column
                    });
                    gridstr += "</tr>";
                }
            }
            gridstr += "</tbody>";
            Grid.html(gridstr);

           var totalpage = Objs == null ? 0 : Math.ceil(Objs.length / settings[0].onepagecount);
           var setting = settings;
           //settings[0].pagenow = settings[0].pagenow > totalpage ? 0 : settings[0].pagenow;
           var pagestr = "<div class=\"message\">共<i class=\"blue\">&nbsp;" + (Objs == null ? 0 : Objs.length) + "&nbsp;</i>条记录，共<i class=\"blue\">&nbsp;" + (Objs == null ? 0 : totalpage) + "&nbsp;</i> 页，当前显示第&nbsp;<i class=\"blue\">" + (Objs == null || Objs.length==0 ? 0 : settings[0].pagenow) + "</i>&nbsp;页</div>";
            pagestr += "<ul class=\"paginList\">";
            if (settings[0].pagenow != 1)
                pagestr += "<li class=\"paginItem\"><a href=\"javascript:;\" title=\"上一页\"><span><-</span></a></li>";
            for (var i = 1; i <= totalpage; i++) {
                pagestr += "<li class=\"paginItem" + (i == settings[0].pagenow ? " current" : "") + "\"><a href=\"javascript:;\">" + i + "</a></li>";
            }
            //pagestr += "<li class=\"paginItem more\"><a href=\"javascript:;\">...</a></li>";
            if (settings[0].pagenow < totalpage)
                pagestr += "<li class=\"paginItem\"><a href=\"javascript:;\" title=\"下一页\"><span>-></span></a></li>";
            pagestr += "</ul>";
            page.html(pagestr);

            $('#' + $(Grid).attr('id') + ' tbody tr').click(function () {
                $('#' + $(Grid).attr('id') + ' tbody tr.selected').removeClass("selected");
                $(this).addClass("selected");
                rowClick($(this));
            })//属性表行单击事件
            $('#' + $(Grid).attr('id') + ' tbody tr:odd').addClass('odd');
            $('#' + $(page).attr('id') + ' li a').click(function () { //换页按钮单击事件
                if ($(this).text() == "<-" && setting[0].pagenow > 1)//上一页
                    setting[0].pagenow -= 1;
                if ($(this).text() == "->" && setting[0].pagenow < totalpage)//下一页
                {
                    setting[0].pagenow += 1;
                }
                if ($(this).text() != "<-" && $(this).text() != "->")
                    setting[0].pagenow = parseInt($(this).text());
                ksec.Grid.Init_Grid(Grid, page, setting, Objs, rowClick);
            })
        }
        return Grid;
    }());

//DropDownList 控件处理类 2017-09-21 16:30 zhaojiaqing 
    var DropDownList = (function () {
        function DropDownList() {
            $(document).click(function () {
                $('.listbox').removeClass('active');
            });
        }
        DropDownList.prototype = {
            Init_List: function (List, setting, Objs, ValueChanged) {
                var listid = $(List).attr('id');
                if (List.html() == "") { List.html("<span id=\"" + listid + "_text\"></span><input type=\"hidden\" id=\"" + listid + "_value\" value=\"\"/><ul id=\"" + listid + "ul\" class=\"dropdown\"></ul>"); List.click(function () { if ($(this).attr("disabled")) return; $(this).toggleClass('active'); return false; }); }
                var newhtml = "";
                if (Objs != null) { $.each(Objs, function (index, obj) { newhtml += "<li><a name='caption' href=\"#\"><i class=\"icon-envelope icon-large\"></i>" + obj[setting.Caption] + "</a><input name='value' type=\"hidden\" value=\"" + obj[setting.Value] + "\"/></li>"; }); }
                $("#" + listid + "ul").html(newhtml);
                $('#' + listid + 'ul li').click(function (event) { $("#" + listid + "_value").val($(this).find("[name='value']").val()); $("#" + listid + "_text").text($(this).find("[name='caption']").text()); if (ValueChanged != null) ValueChanged(Value); $('#' + listid + ' ul li.selected').removeClass("selected"); $(this).addClass("selected"); })
            },
            Set_Disabled: function (List, isdisabled) {
                $(List).attr("disabled", isdisabled);
                $("#" + $(List).attr('id') + "_text").attr("class", isdisabled ? "disabled" : "");
            },
            Get_Value: function (List) {
                return $("#" + $(List).attr('id') + "_value").val();
            },
            Set_Value: function (List, Value) {
                var listid = $(List).attr('id');
                $('#' + listid + ' ul li.selected').removeClass("selected");
                if (Value == null) {
                    $("#" + listid + "_text").text("");
                }
                else {
                    var lis = $("#" + listid + " .dropdown li").find("input[value='" + Value + "']");
                    if (lis.length > 0) {
                        lis.parent().addClass("selected");//设置本行为选定行
                        $("#" + listid + "_text").text(lis.parent().children("a").text());
                    }
                    else
                        $("#" + listid + "_text").text("");
                }
                $("#" + listid + "_value").val(Value);
            },
            Get_Text: function (List) {
                return $("#" + $(List).attr('id') + "_text").text();
            },
        }
        return DropDownList;
    }());
    function KSECUI() {
    };
    KSECUI.prototype.MessageBox = new MessageBox();
    KSECUI.prototype.Common = new Common();
    KSECUI.prototype.Grid = new Grid();
    KSECUI.prototype.DropDownList = new DropDownList();


    function To_Date(str,formatx)
    {
        if (str == null || str == "")
            return "";
        else {
            var tmp = /\d+(?=\+)/.exec(str);
            var d = new Date(+tmp);
            return d.Format(formatx);
        }
    }
    function Parse_wcfDate(str) {
        if (str == null || str == "")
            return new Date();
        else {
            if (str.indexOf("(") > 0) {
                var tmp = /\d+(?=\+)/.exec(str);
                return new Date(+tmp);
            }
            else { return new Date(str); }
        }
    }

    function To_WcfDate(jsDate) {
        if (jsDate == null || jsDate == "")
            return null;
        else {
            return "\/Date(" + jsDate.getTime() + "+0000)\/";
        }
    }
    Date.prototype.Format = function (fmt) { //author: meizz   
        var o = {
            "M+": this.getMonth() + 1, //月份   
            "d+": this.getDate(), //日   
            "H+": this.getHours(), //小时   
            "m+": this.getMinutes(), //分   
            "s+": this.getSeconds(), //秒   
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
            "S": this.getMilliseconds() //毫秒   
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    Date.prototype.DatePart = function () {
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);
        return this;
    }
    Date.prototype.AddDays = function (days) {
        this.setDate(this.getDate() + days);
        return this;
    }
   Date.prototype.MinusDays = function (days) {
        this.setDate(this.getDate() - days);
        return this;
    }
    var ksec = new KSECUI();

         function getUrlParam(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) return unescape(r[2]); return null; //返回参数值
        }
         function CheckToken() {
            var token = getUrlParam("token");
            if (token && token.length > 0) {
                return true;
            }
            else
                window.location = "login1.html";
         }

         function RFalse(){ return false; }
         $(document).bind("contextmenu", RFalse);
//$(document).bind("selectstart",RFalse);
(function ($) {
    try{
        function pagerFilter(data) {
            if ($.isArray(data)) {	// is array
                data = {
                    total: data.length,
                    rows: data
                }
            }
            var target = this;
            var dg = $(target);
            var state = dg.data('datagrid');
            var opts = dg.datagrid('options');
            if (!state.allRows) {
                state.allRows = (data.rows);
            }
            if (!opts.remoteSort && opts.sortName) {
                var names = opts.sortName.split(',');
                var orders = opts.sortOrder.split(',');
                state.allRows.sort(function (r1, r2) {
                    var r = 0;
                    for (var i = 0; i < names.length; i++) {
                        var sn = names[i];
                        var so = orders[i];
                        var col = $(target).datagrid('getColumnOption', sn);
                        var sortFunc = col.sorter || function (a, b) {
                            return a == b ? 0 : (a > b ? 1 : -1);
                        };
                        r = sortFunc(r1[sn], r2[sn]) * (so == 'asc' ? 1 : -1);
                        if (r != 0) {
                            return r;
                        }
                    }
                    return r;
                });
            }
            var start = (opts.pageNumber - 1) * parseInt(opts.pageSize);
            var end = start + parseInt(opts.pageSize);
            data.rows = state.allRows.slice(start, end);
            return data;
        }

        var loadDataMethod = $.fn.datagrid.methods.loadData;
        var deleteRowMethod = $.fn.datagrid.methods.deleteRow;
        $.extend($.fn.datagrid.methods, {
            clientPaging: function (jq) {
                return jq.each(function () {
                    var dg = $(this);
                    var state = dg.data('datagrid');
                    var opts = state.options;
                    opts.loadFilter = pagerFilter;
                    var onBeforeLoad = opts.onBeforeLoad;
                    opts.onBeforeLoad = function (param) {
                        state.allRows = null;
                        return onBeforeLoad.call(this, param);
                    }
                    var pager = dg.datagrid('getPager');
                    pager.pagination({
                        onSelectPage: function (pageNum, pageSize) {
                            opts.pageNumber = pageNum;
                            opts.pageSize = pageSize;
                            pager.pagination('refresh', {
                                pageNumber: pageNum,
                                pageSize: pageSize
                            });
                            dg.datagrid('loadData', state.allRows);
                        }
                    });
                    $(this).datagrid('loadData', state.data);
                    if (opts.url) {
                        $(this).datagrid('reload');
                    }
                });
            },
            loadData: function (jq, data) {
                jq.each(function () {
                    $(this).data('datagrid').allRows = null;
                });
                return loadDataMethod.call($.fn.datagrid.methods, jq, data);
            },
            deleteRow: function (jq, index) {
                return jq.each(function () {
                    var row = $(this).datagrid('getRows')[index];
                    deleteRowMethod.call($.fn.datagrid.methods, $(this), index);
                    var state = $(this).data('datagrid');
                    if (state.options.loadFilter == pagerFilter) {
                        for (var i = 0; i < state.allRows.length; i++) {
                            if (state.allRows[i] == row) {
                                state.allRows.splice(i, 1);
                                break;
                            }
                        }
                        $(this).datagrid('loadData', state.allRows);
                    }
                });
            },
            getAllRows: function (jq) {
                return jq.data('datagrid').allRows;
            }
        })
    }
    catch(e){}
})(jQuery);
//格式化列表的EquipmentID字段，显示EquipmentName
         function EquipmentIDFormat(value, rowData, rowIndex) {
             var vt = value == null ? null : ksec.Common.GetModelSource("BXT_EquipElementDA.svc/web/Get", { paras: [{ ColumnName: "EquipmentID", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
             if (vt)
                 return vt.EquipmentName;
             else
                 return value;
         }
//格式化PropertyIDFormatter列，显示属性名称
         function PropertyIDFormatter(value, rowData, rowIndex) {
             if(value)
             {
                 var pro = ksec.Common.GetModelSource("BXT_EquipPropertyDA.svc/web/Get", { paras: [{ ColumnName: "PropertyID", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
                 if (pro)
                     return pro.PropertyName;
                 else
                     return value;
             }
             else
                 return value;
         }
//格式化EvaluationRule列，显示名称
         function EvaluationRuleFormatter(value, rowData, rowIndex) {
             var vt = value == null ? null : ksec.Common.GetModelSource("BXT_EnumerationDA.svc/web/Get", { paras: [{ ColumnName: "EnumSet", CompareStr: "=", ColumnValue1: 'EvaluationRule', ColumnValue2: null }, { ColumnName: "EnumValue", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false })
             if (vt != null)
                 return vt.EnumString;
             else
                 return value;
         }
         
         //格式化列表的ProductID字段，显示产品/物料的名称
         function ProductIDFormat(value, rowData, rowIndex) {
             var vt = value == null ? null : ksec.Common.GetModelSource("MAT_MaterialDA.svc/web/Get", { paras: [{ ColumnName: "MAT_ID", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
             if (vt)
                 return vt.MAT_Name;
             else
                 return value;
         }
         //格式化列表的PathID字段，显示Path的名称
         function PathIDFormat(value, rowData, rowIndex) {
             var vt = value == null ? null : ksec.Common.GetModelSource("Tech_PathDA.svc/web/Get", { paras: [{ ColumnName: "PathID", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
             if (vt)
                 return vt.PathName;
             else
                 return value;
         }
//格式化列表的RE_ID字段，显示RE_Name
         function RE_IDFormat(value, rowData, rowIndex) {
             try {
                 var vt = value == null ? null : ksec.Common.GetModelSource("MAT_MRecipeDA.svc/web/Get", { paras: [{ ColumnName: "RE_ID", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
                 if (vt != null)
                     return vt.RE_Name;
                 else
                     return value;
             }
             catch (err) { return value }
         }

//格式化列表的RE_ID2字段，显示EQU_Name
        function RE_ID2Format(value, rowData, rowIndex) {
            try {
                var vt = value == null ? null : ksec.Common.GetModelSource("MAT_MRecipeDA.svc/web/Get", { paras: [{ ColumnName: "RE_ID", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
                if (vt != null)
                    return vt.RE_Name;
                else
                    return value;
            }
            catch (err) { return value }
        }
         
//格式化列表的从APP_CONFIG_ITEMS中取值的字段字段，显示名称
         function APP_CONFIG_ITEMSFormat(value, rowData, rowIndex) {
             var vt = value == null ? null : ksec.Common.GetModelSource("APP_CONFIG_ITEMSDA.svc/web/Get", { paras: [{ ColumnName: "PropertyID", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
             if (vt != null)
                 return vt.PropertyName;
             else
                 return value;
         }
//格式化TextBox，从APP_CONFIG_ITEMS中取值的字段字段，显示名称
         function APP_CONFIG_ITEMSFormatTextBox(value, oldValue) {
             var vt = value == null ? null : ksec.Common.GetModelSource("APP_CONFIG_ITEMSDA.svc/web/Get", { paras: [{ ColumnName: "PropertyID", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
             if (vt != null)
                 return vt.PropertyName;
             else
                 return value;
         }
//格式化任务状态TextBox，显示名称
         function ScheduleStatusFormatTextBox(value, oldValue) {
             var vt = value == null ? null : ksec.Common.GetModelSource("BXT_EnumerationDA.svc/web/Get", { paras: [{ ColumnName: "EnumSet", CompareStr: "=", ColumnValue1: 'ScheduleStatus', ColumnValue2: null }, { ColumnName: "EnumValue", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
             if (vt != null)
                 return vt.EnumString;
             else
                 return value;
         }
//格式化列表的任务状态字段，显示名称
         function ScheduleStatusFormat(value, rowData, rowIndex) {
             var vt = value == null ? null : ksec.Common.GetModelSource("BXT_EnumerationDA.svc/web/Get", { paras: [{ ColumnName: "EnumSet", CompareStr: "=", ColumnValue1: 'ScheduleStatus', ColumnValue2: null }, { ColumnName: "EnumValue", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
             if (vt != null)
                 return vt.EnumString;
             else
                 return value;
         }

//格式化班组TextBox，显示名称
         function SYSBCFormatTextBox(value, oldValue) {
             var vt = value == null ? null : ksec.Common.GetModelSource("APP_CONFIG_ITEMSDA.svc/web/Get", { paras: [{ ColumnName: "ParentCFG", CompareStr: "=", ColumnValue1: "+SYSBC", ColumnValue2: null }, { ColumnName: "PropertyID", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
             if (vt != null)
                 return vt.PropertyName;
             else
                 return value;
         }
//格式化列表的班组字段，显示名称
         function SYSBCFormat(value, rowData, rowIndex) {
             var vt = value == null ? null : ksec.Common.GetModelSource("APP_CONFIG_ITEMSDA.svc/web/Get", { paras: [{ ColumnName: "ParentCFG", CompareStr: "=", ColumnValue1: "+SYSBC", ColumnValue2: null }, { ColumnName: "PropertyValue", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
             if (vt != null)
                 return vt.PropertyName;
             else
                 return value;
         }
//格式化班时TextBox，显示名称
         function SYSBSFormatTextBox(value, oldValue) {
             var vt = value == null ? null : ksec.Common.GetModelSource("APP_CONFIG_ITEMSDA.svc/web/Get", { paras: [{ ColumnName: "ParentCFG", CompareStr: "=", ColumnValue1: "+SYSBS", ColumnValue2: null }, { ColumnName: "PropertyID", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
             if (vt != null)
                 return vt.PropertyName;
             else
                 return value;
         }
//格式化列表的班时字段，显示名称
         function SYSBSFormat(value, rowData, rowIndex) {
             var vt = value == null ? null : ksec.Common.GetModelSource("APP_CONFIG_ITEMSDA.svc/web/Get", { paras: [{ ColumnName: "ParentCFG", CompareStr: "=", ColumnValue1: "+SYSBS", ColumnValue2: null }, { ColumnName: "PropertyValue", CompareStr: "=", ColumnValue1: value, ColumnValue2: null }], GetWithChild: false });
             if (vt != null)
                 return vt.PropertyName;
             else
                 return value;
         }
//获取系统基础信息配置树节点数组，传入参数datas为
         function GetCFGComboTreeNodes(datas, node) {
             if (null == node) {
                 var ret = [];
                 $($.Enumerable.From(datas).Where("$.ParentCFG==null").ToArray()).each(function (i, t) {
                     ret.push(GetCFGComboTreeNodes(datas, { id: t.CFG_ID, text: t.CFG_NAME, children: [] }));
                 });
                 return ret;
             }
             $($.Enumerable.From(datas).Where("$.ParentCFG=='" + node.id + "'").ToArray()).each(function (i, t) {
                 node.children.push(GetCFGComboTreeNodes(datas, { id: t.CFG_ID, text: t.CFG_NAME, children: [] }));
             });
             return node;
         }

//格式化checkboxCol列，根据不同选项显示值名称
         function YesNoFormatter(value, rowData, rowIndex) {
                 return value?'是':'否';
         }

//格式化列表的Date字段，显示到秒
         function DateFormatSS(value, rowData, rowIndex) {
             if (value)
                 return To_Date(value, "yyyy-MM-dd HH:mm:ss");
             else
                 return value;
         }
//格式化列表的Date字段，显示到秒
         function DateFormatTextBoxSS(newValue, oldValue) {
             if (newValue)
                 $(this).textbox("setText", To_Date(newValue, "yyyy-MM-dd HH:mm:ss"));
         }
//格式化列表的Date字段，显示到分钟
         function DateFormatMM(value, rowData, rowIndex) {
             if (value)
                 return To_Date(value, "yyyy-MM-dd HH:mm");
             else
                 return value;
         }
         //格式化列表的Date字段，显示到分钟
         function DateFormatTextBoxMM(newValue, oldValue) {
             try {
                 $(this).textbox("setText", To_Date(newValue, "yyyy-MM-dd HH:mm"));
             }
             catch(e){}
         }
         
//格式化列表的Date字段，显示到天
         function DateFormatDD(value, rowData, rowIndex) {
             if (value)
                 return To_Date(value, "yyyy-MM-dd");
             else
                 return value;
         }
//格式化列表的Date字段，显示到天
         function DateFormatTextBoxDD(newValue, oldValue) {
             if (newValue)
                 $(this).textbox("setText", To_Date(newValue, "yyyy-MM-dd"));
         }


        //格式化输入日期控件，显示到天
         function FormatDateTimeBoxDD(value) {
             if (value)
                 return value.Format("yyyy-MM-dd");
             else
                 return value;
         }
        //格式化输入日期控件，显示到分钟
         function FormatDateTimeBoxMM(value) {
             if (value)
                 return value.Format("yyyy-MM-dd HH:mm");
             else
                 return value;
         }

        //格式化输入日期控件，显示到秒
         function FormatDateTimeBoxSS(value) {
             if (value)
                 return value.Format("yyyy-MM-dd HH:mm:ss");
             else
                 return value;
         }
        //  function DownLoadFile(url,filename) {
        //      var DownLoadCtl = document.getElementById("KsecDownLoadFile");
        //      if (!DownLoadCtl) {
        //          DownLoadCtl = document.createElement("a");
        //          DownLoadCtl.setAttribute("id", "KsecDownLoadFile");
        //          document.body.appendChild(DownLoadCtl);
        //      }
        //      DownLoadCtl.setAttribute("href", url);
        //      DownLoadCtl.setAttribute("download", filename?filename:'');
        //      DownLoadCtl.click();
        //  }
         //获取图片路劲的方法，兼容多种浏览器，通过createObjectURL实现
         function getObjectURL(file) {
             var url = null;
             if (window.createObjectURL != undefined) {
                 url = window.createObjectURL(file);//basic
             } else if (window.URL != undefined) {
                 url = window.URL.createObjectURL(file);
             } else if (window.webkitURL != undefined) {
                 url = window.webkitURL.createObjectURL(file);
             }
             return url;
         }
         function ShowPicture(imgurl) {
             if ($('#KsecPictureView', top.document).length == 0)
                 $('<iframe id="KsecPictureView" class="KsecPictureView" style="position:absolute;left:0px;top:0px;right:0px;bottom:0px;width:100%;height:100%;background:transparent;margin:0px;padding:0px;" src="KsecPictureView.html?imgurl=' + encodeURIComponent(imgurl) + '"></iframe>').appendTo(top.document.body);
             else {
                 $('#KsecPictureView', top.document).show();
             }
         }

        ///title:标题
        ///message：内容
        ///question1_exclamation2_error3：模态框类型
        ///target：模态框主体 null表示本窗体，也可以是其它窗体，比如要全屏模态 top.document.body
        ///callback:回调函数 function (c) {} c==1表示确认了，c==0表示取消了
///依赖性：应用窗体必须引入 jQuery bootstrap
        ///        target目标窗体必须引入 jQuery bootstrap
         function ShowWinModal(title, message, question1_exclamation2_error3, target, callback) {
             //信息模态框控件
             var $KsecModalWin = $('#KsecModalWin', target == null ? document.body : target);
             if ($KsecModalWin.length > 0)
                 $KsecModalWin.remove();

             var $KsecModalWin1 = $(".modal-backdrop");
             if ($KsecModalWin1.length > 0)
                 $KsecModalWin1.remove();
             //信息模态框
             $('<div id="KsecModalWin" class="modal fade"><div class="modal-dialog"><div class="modal-content d-flex flex-column bg-muted" style="max-width:350px;min-width:300px;min-height:150px;"><div class="flex-grow-1 pb-1 d-flex flex-column">' +
               (title == null || title == "" ? '' : '<div class="p-2 text-left bg-light border"><strong>' + title + '</strong></div>') +
               '<div class="flex-grow-1 p-3 w-100 text-left' + (question1_exclamation2_error3 == 3 ? ' text-danger' : ' text-info') + '">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + message + '</div></div><div class="w-100 d-flex flex-row border-top border-light">' +
               (question1_exclamation2_error3 == 1 ? '<div class="flex-fill border"><button id="KsecModalWinOK" type="button" class="btn btn-light rounded-0 text-dark w-100 h-00 text-danger" data-dismiss="modal"><strong class="text-danger">&nbsp;&nbsp;确&nbsp;定&nbsp;&nbsp;</strong></button></div>' : '') +
               '<div class="flex-fill border"><button id="KsecModalWinClose" type="button" class="btn btn-light rounded-0 text-info w-100 h-00" data-dismiss="modal"><strong>&nbsp;&nbsp;返&nbsp;回&nbsp;&nbsp;</strong></button></div>' +
               '</div></div></div></div>').appendTo(target == null ? document.body : target).modal('show');
             //回调函数处理
             if (callback) {
                 $("#KsecModalWinOK", target == null ? document.body : target).click(function () {
                     callback(1);
                 });
                 $("#KsecModalWinClose", target == null ? document.body : target).click(function () {
                     callback(0);
                 });
             }
         }
         function ShowWaitingForm() {
             var $KsecModalWin = $('#KsecWaitingForm');
             if ($KsecModalWin.length == 0) {
                 $KsecModalWin = $('<div id="KsecWaitingForm" class="modal text-dark pt-4" style="display: flex;justify-content: flex-start;align-items: center;text-align: center;"><i class="fa fa-4x fa-spin fa-cog"></i><div><h4>请稍等，操作进行中...</h4></div></div>');
                 $KsecModalWin.appendTo(document.body);
             }
             $KsecModalWin.modal('show');
         }
         function HideWaitingForm() {
             setTimeout("$('#KsecWaitingForm').modal('hide')", 1000);
         }
///上传文件到服务器
///path：上传到服务器的文件目录、不能为中文（AppPath/WebUI 为根目录）、(path + '/' + filename 为上传后的最终链接地址)
///filename:保存的文件名称，值不能为中文
///file：文件对象
///return：成功为空字符串，失败为错误信息
        //  function UploadFile(path, filename, file) {
        //      try {
        //          if (path && path != '' && filename && filename != '' && file) {
        //              var formData = new FormData();
        //              formData.append("files", file);
        //              $.ajax({
        //                  async: false,
        //                  url: rooturl + 'GlobalDA.svc/web/UploadFiles',
        //                  beforeSend: function (request) {
        //                      request.setRequestHeader("path", path);//path值不能为中文
        //                      request.setRequestHeader("filename", filename);//filename值不能为中文
        //                  },
        //                  type: "POST",
        //                  data: formData,
        //                  cache: false,//不需要缓存
        //                  processData: false,  // 告诉jQuery不要去处理发送的数据
        //                  contentType: false,   // 告诉jQuery不要去设置Content-Type请求头
        //                  success: function (responseText) {
        //                      //alert(JSON.stringify(responseText));
        //                  },
        //                  error: function (e) {
        //                      alert(JSON.stringify(e));
        //                  }
        //              });
        //          }
        //          return '';
        //      }
        //      catch (e) { return e.message; }
        //  }
         function isNumber(val) {
             var regPos = /^\d+(\.\d+)?$/; //非负浮点数
             var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
             if (regPos.test(val) || regNeg.test(val)) {
                 return true;
             } else {
                 return false;
             }
         }
         function OpenHelpWin(Page)
         {
             $('#helpwin').fadeIn();
             $('#helpwinurl').attr("src", Page);
            // alert(Page);
         }
         function SetHelpPage(Page) {
             $(`<div style="position:absolute;top:0px;right:0px;width:22px;height:22px;background-color:#328a9d;border:solid 1px #185c6b;border-radius:11px;opacity:0.7;z-index:1000;text-align:center;color:red;font-weight:700;font-size:18px;cursor:help;" title="单击打开关于此页面的在线操作帮助" onclick="top.OpenHelpWin('` + Page + `');" onmouseover="$(this).animate({ opacity: '0.9' });" onmouseout="$(this).animate({ opacity: '0.4' });">？</div>`).appendTo(document.body);
         }
//添加用户操作日志方法
// function addUserOperLog(AppID, OperDesc) {
//     var OperLog = new Object();
//     OperLog.AppID = AppID;
//     OperLog.UserName = top.LogInfor ? top.LogInfor.UserName : "system";
//     OperLog.OperDesc = OperDesc;
//     return ksec.Common.GetModelSource("User_OperLogDA.svc/web/Add", { "instance": OperLog });
// }


//返回顶部悬浮按钮
$(function () {
    var bt = $('#toolBackTop');
    var sw = $(document.body)[0].clientWidth;

    var limitsw = (sw - 840) / 2 - 80;  //距离右侧距离
    if (limitsw > 0) {
        limitsw = parseInt(limitsw);
        bt.css("right", limitsw / 8);
    }

    $(window).scroll(function () {
        var st = $(window).scrollTop();
        if (st > 30) {
            bt.show();
        } else {
            bt.hide();
        }
    });
});
