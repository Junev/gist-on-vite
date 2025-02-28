/* eslint-disable */
let idTmr;
const getExplorer = () => {
    let explorer = window.navigator.userAgent;
    //ie
    if (explorer.indexOf("MSIE") >= 0) {
        return 'ie';
    }
    //firefox

    else if (explorer.indexOf("Firefox") >= 0) {
        return 'Firefox';
    }
    //Chrome
    else if (explorer.indexOf("Chrome") >= 0) {
        return 'Chrome';
    }
    //Opera
    else if (explorer.indexOf("Opera") >= 0) {
        return 'Opera';
    }
    //Safari
    else if (explorer.indexOf("Safari") >= 0) {
        return 'Safari';
    }
}
// 判断浏览器是否为IE
const exportToExcel = (data, name) => {

    // 判断是否为IE
    if (getExplorer() == 'ie') {
        tableToIE(data, name)
    } else {
        tableToNotIE(data, name)
    }
}

const Cleanup = () => {
    window.clearInterval(idTmr);
}

// ie浏览器下执行
const tableToIE = (data, name) => {
    let curTbl = data;
    let oXL = new ActiveXObject("Excel.Application");

    //创建AX对象excel
    let oWB = oXL.Workbooks.Add();
    //获取workbook对象
    let xlsheet = oWB.Worksheets(1);
    //激活当前sheet
    let sel = document.body.createTextRange();
    sel.moveToElementText(curTbl);
    //把表格中的内容移到TextRange中
    sel.select;
    //全选TextRange中内容
    sel.execCommand("Copy");
    //复制TextRange中内容
    xlsheet.Paste();
    //粘贴到活动的EXCEL中

    oXL.Visible = true;
    //设置excel可见属性

    try {
        let fname = oXL.Application.GetSaveAsFilename("Excel.xls", "Excel Spreadsheets (*.xls), *.xls");
    } catch (e) {
        print("Nested catch caught " + e);
    } finally {
        oWB.SaveAs(fname);

        oWB.Close(savechanges = false);
        //xls.visible = false;
        oXL.Quit();
        oXL = null;
        // 结束excel进程，退出完成
        window.setInterval("Cleanup();", 1);
        idTmr = window.setInterval("Cleanup();", 1);
    }
}

// 非ie浏览器下执行
const tableToNotIE = (function () {
    // 编码要用utf-8不然默认gbk会出现中文乱码
    let uri = 'data:application/vnd.ms-excel;base64,',
        template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
        base64 = function (s) {
            return window.btoa(unescape(encodeURIComponent(s)));

        },

        format = (s, c) => {
            return s.replace(/{(\w+)}/g,
                (m, p) => {
                    return c[p];
                })
        }
    return (table, name) => {
        let ctx = {
            worksheet: name,
            table
        }

        //创建下载
        let link = document.createElement('a');
        link.setAttribute('href', uri + base64(format(template, ctx)));

        link.setAttribute('download', name);


        // window.location.href = uri + base64(format(template, ctx))
        link.click();
    }
})()

