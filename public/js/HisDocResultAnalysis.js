$(document).ready(function () {
    $('#StartTime').datetimepicker({ format: 'Y-m-d H:i', value: FormatDateTimeBoxMM(new Date().DatePart()) });
    $('#EndTime').datetimepicker({ format: 'Y-m-d H:i', value: FormatDateTimeBoxMM(new Date().AddDays(1).DatePart()) });

    var ret;
    $("#TQ_btn").click(function () {
        var paras = GetSelParas();
        if ($('#StartTime').val() == "" || $('#EndTime').val() == "" || $('#productid').val() == "" || paras == null || paras.tvs.length == 0 || paras.pids.length == 0)
            return;
        //初始化分析控件，准备新的一次分析
        
        var chartf = $('#highchartcontainer').highcharts();
        for (var n = chartf.series.length - 1; n >= 0; n--) {
            chartf.series[n].remove(false);
        }
        ////第一次清除总是会留一个，所以加了第二次清除，不知道为什么
        //var chart = $('#highchartcontainer').highcharts();
        //for (var n = 0; n < chart.series.length; n++) {
        //    chart.series[n].remove(false);
        //}
        //连接服务器，获取给定参数的统计分析结果表
        ret = ksec.Common.GetModelSource("QuaResultDA.svc/web/GetBatchesResult", { st: To_WcfDate(new Date($('#StartTime').val())), et: To_WcfDate(new Date($('#EndTime').val())), productid: $('#productid').val(), fields: paras.tvs, pids: paras.pids });
        var Series = [];
        for (var i = 0; i < ret.Pnames.length; i++) {//每个参数的分析图性数据系列
            Series.push({ name: ret.Pnames[i] + "—" + paras.tvns[i], data: [] });//系列
        }
        for (var i = 0; i < ret.Batchs.length; i++) {//每个参数的分析图性数据系列的数据源设置
            for (var j = 0; j < ret.Pvalues[i].length; j++) {
                Series[j].data.push({ x: i, y: ret.Pvalues[i][j] });
            }
        }
        for (var i = 0; i < Series.length; i++) {//绘制系列图形
            $('#highchartcontainer').highcharts().addSeries(Series[i]);
        }
        //-------------------加这段为了下载时有批次信息
        for (var i = 0; i < Series.length; i++) {
            for (var j = 0; j < Series[i].data.length; j++) {
                Series[i].data[j].x = ret.Batchs[j];
            }
        }
        $('#highchartcontainer').highcharts().update(Series, false);
        //-------------------------
    });
    var ps = $.Enumerable.From(ksec.Common.GetModelSource("HisDocParaDefDA.svc/web/GetAll", { GetWithChild: false })).OrderBy("$.EquipmentID").ToArray();
    for (var i = 0; i < ps.length; i++) {
        var equx;
        var equ = $.Enumerable.From(vm.Equs).Where("$.EquipmentID=='" + ps[i].EquipmentID + "'").ToArray();
        if (equ.length == 0) {
            equx = { EquipmentID: ps[i].EquipmentID, EquipmentName: ksec.Common.GetModelSource("BXT_EquipElementDA.svc/web/Get", { paras: [{ ColumnName: "EquipmentID", CompareStr: "=", ColumnValue1: ps[i].EquipmentID, ColumnValue2: null }], GetWithChild: false }).EquipmentName, Paras: [] };
            vm.Equs.push(equx);
        }
        else
            equx = equ[0];
        equx.Paras.push({ PID: ps[i].PropertyID, PName: ksec.Common.GetModelSource("BXT_EquipPropertyDA.svc/web/Get", { paras: [{ ColumnName: "PropertyID", CompareStr: "=", ColumnValue1: ps[i].PropertyID, ColumnValue2: null }], GetWithChild: false }).PropertyName });

    }

    Highcharts.chart('highchartcontainer', {
        chart: {
            zoomType: 'x',
            panning: true,
            panKey: 'shift'
        },
        title: {
            text: '车间生产过程质量—批间指标分析图',
            style: {
                color: 'cornflowerblue',
                fontSize: '20px',
                fontWeight: "bold"
            }
        },
        credits: {
            enabled: false
        },
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: ['printChart', 'downloadPNG', 'downloadCSV']
                }
            }
        },
        plotOptions: {
            series: {
                turboThreshold: 100000,
                cursor: 'pointer',
                events: {
                    click: function (p) {
                        //alert(JSON.stringify(p));
                    }
                }
            }
        },
        xAxis: {
            title: {
                text: '批次序号'
            },
            type: 'string'
        },
        yAxis: {
            title: {
                text: '指标值'
            }
        },
        tooltip: {
            shared: true,
            crosshairs: true,
            pointFormatter: function () {
                return '<span style="color:' + this.series.color + '">' + ret.Batchs[this.x] + ' — ' + this.series.name + ':<b>    ' + this.y + '</b><br/></span>';
            }
        },
        legend: {
            enabled: true
        }
    });
    vm.Models = $.Enumerable.From(ksec.Common.GetModelSource("HisDocOutputModelDA.svc/web/GetAll", { GetWithChild: true })).OrderBy("$.ModelCode").ToArray();
});
function RefreshParaSel()
{
    //$("input[type='checkbox']").removeAttr("checked");
    $("input[type=checkbox]").prop("checked", false);
    var modelx = $.Enumerable.From(vm.Models).Where("$.ModelCode=='" + $("#ModelCode").val() + "'").ToArray();
    if (modelx && modelx.length > 0) {
        for (var i = 0; i < modelx[0].Child_HisDocOutputModel_Paras.length; i++) {
                $('#' + modelx[0].Child_HisDocOutputModel_Paras[i].PropertyID).prop("checked", true);               
        }
        vm.SelModel = modelx[0];
    }
}
function GetSelParas()
{
    var SelPIDs = { pids: [], tvs: [], tvns: [] };
    $('input[type=checkbox]:checked').each(function (k, t) {//通过each循环每个tool
        SelPIDs.pids.push($(t).attr("id"));
        SelPIDs.tvs.push($('#' + $(t).attr("id") + 'targetv').val());
        SelPIDs.tvns.push($('#' + $(t).attr("id") + 'targetv').get(0).options[$('#' + $(t).attr("id") + 'targetv').get(0).selectedIndex].text);
    });
    return SelPIDs;
}


var vm = new Vue({
    el: '#CTL',
    data: { Equs: [], Models: [], SelModel: null, Materials: $.Enumerable.From(ksec.Common.GetModelSource("MAT_MaterialDA.svc/web/GetAll", { GetWithChild: false })).OrderBy("$.MATCode").ToArray() }

});
