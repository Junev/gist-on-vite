$(document).ready(function () {
    $('#StartTime').datetimepicker({ format: 'Y-m-d H:i', value: FormatDateTimeBoxMM(new Date().DatePart()) }).datetimepicker({ onClose: function (dateText, inst) { GetBatchs($('#StartTime').val(), $('#EndTime').val()); } });
    $('#EndTime').datetimepicker({ format: 'Y-m-d H:i', value: FormatDateTimeBoxMM(new Date().AddDays(1).DatePart()) }).datetimepicker({ onClose: function (dateText, inst) {GetBatchs($('#StartTime').val(), $('#EndTime').val()); } });
    var st = $('#StartTime').val();
    var et = $('#EndTime').val();
    GetBatchs(st, et);
    $('#MB_btn').click(function () {
        vm.BatchEqus = $.Enumerable.From(ksec.Common.GetModelSource("V_PrdPlanDA.svc/web/GetList", { paras: [{ ColumnName: "BatchID", CompareStr: "=", ColumnValue1: $('#BatchID').val(), ColumnValue2: null }], GetWithChild: false })).ToArray();
    })

    $("#TQ_btn").click(function () {
        //$("#AnalysisPage").attr('src', "QuaSingleAnalysis.html?BatchID=&Paras=");
        $("#AnalysisPage").attr('src', "QuaSingleAnalysis_coords.html?BatchID=" + encodeURIComponent($('#BatchID').val()) + "&Paras=" + encodeURIComponent(JSON.stringify(GetSelParas())));
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

    vm.Models = $.Enumerable.From(ksec.Common.GetModelSource("HisDocOutputModelDA.svc/web/GetAll", { GetWithChild: true })).OrderBy("$.ModelCode").ToArray();
    //$('#paraList').on('shown.bs.modal', function () {
    //    if (!vm.SelModel)
    //       RefreshParaSel();
    //})
});
function GetBatchs(starttime,endtime)
{
    vm.Batchs = $.Enumerable.From(ksec.Common.GetModelSource("PRD_BatchDA.svc/web/GetList", { paras: [{ ColumnName: "ExeStartTime", CompareStr: "between", ColumnValue1: starttime, ColumnValue2: endtime }], GetWithChild: false })).OrderBy("$.CreateDate").ToArray();
}
function RefreshParaSel()
{
    $("input[type=checkbox]").prop("checked", false); 
    var modelx = $.Enumerable.From(vm.Models).Where("$.ModelCode=='" + $("#ModelCode").val() + "'").ToArray();
    if (modelx && modelx.length > 0) {
        for (var i = 0; i < modelx[0].Child_HisDocOutputModel_Paras.length; i++) {
            if ($.Enumerable.From(vm.BatchEqus).Where("$.UnitID=='" + $('#' + modelx[0].Child_HisDocOutputModel_Paras[i].PropertyID).attr("equid") + "'").ToArray().length > 0)
                $('#' + modelx[0].Child_HisDocOutputModel_Paras[i].PropertyID).prop("checked", true);               
        }
        vm.SelModel = modelx[0];
    }
}
function GetSelParas()
{
    var SelPIDs = [];
    $('input[type=checkbox]:checked').each(function (k, t) {//通过each循环每个tool
        SelPIDs.push($(t).attr("id"));
    });
    return SelPIDs;
}


var vm = new Vue({
    el: '#CTL',
    data: { Batchs: [], Equs: [], BatchEqus: [], Models: [], SelModel: null }

});
