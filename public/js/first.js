var tempval = window.parent.firstisfresh;
var fristpage = new Vue({ //树的VUE对象
    el: "#fristpage",
    data() {
        return {
            surPass: 0,
            percentage: 0, //圆圈进度条的进度百分比
            ruledesc: "",
            testname: "",
            tableData: [],
            size: '',
            color: "#297a4c",
            status: false,
            activeNames: [],
            drawer: false, //控制抽屉是否打开
            jsonstr: "",
        }
    },
    created() {},
    mounted() {
        this.getMoitors();
        this.timerRefresh(window.parent.firstisfresh);
        var me = this;
        window.timerRefresh = me.timerRefresh;
        //将该方法注册给window，那这样的话父页面就可以直接调用通过frame页面ID调用该方法
    },
    methods: {
        getMoitors() {
            var tempdata = loaddata("SYS_MONITOR", []);
            var tempflag = tempdata.d ? true : false;
            if (tempflag) {
                var orderdata = $.Enumerable.From(tempdata.d).OrderBy("$.APPID").ToArray();
                orderdata.forEach(element => {
                    if (element.APPID) {
                        var tempid = element.APPID + "-" + element.SUBAPPID;
                        element.id = tempid;
                    }
                });
                this.tableData = $.Enumerable.From(orderdata).OrderBy("$.id").ToArray();
                var tempdata = this.tableData;
                var _this = this;
                if (tempdata) {
                    $.each(tempdata, function (index, val) {
                        var data = [];
                        data = formatJson(val.STATUSINFO);
                        val.tableval = [];
                        val.tableval.push({
                            data
                        });
                    });
                    $.each(tempdata, function (key, value) {
                        if (value) {
                            var tempvalue = value.tableval[0].data;
                            var newtable = [];
                            $.each(tempvalue, function (index, ele) {
                                //确保一定是有对象的根节点
                                if (ele.key && ele.type === 'obj' && !ele.mainkey) {
                                    var tempcon = _this.getarray(tempvalue, ele.key);
                                    newtable.push({
                                        "name": ele.key,
                                        "content": tempcon
                                    });
                                }
                            });
                            value.cardval = [];
                            value.cardval = $.Enumerable.From(newtable).ToArray();
                        }
                    });
                    $.each(tempdata, function (indx, dets) {
                        if (dets) {
                            $.each(dets.cardval, function (num, det) {
                                //console.log(det.content)
                                $.each(det.content, function (index, data) {
                                    var newstr = null;
                                    if (data.key && data.type === 'obj' && typeof data.val === 'object') {
                                        var tempstr = getjsonstr(data.val);
                                        newstr = tempstr;
                                        data.str = null;
                                        data.str = newstr;
                                    }
                                });

                            });
                        }
                    });
                    // console.log(this.tableData)
                }
            } else {
                this.$message({
                    message: "获取数据失败！",
                    type: "error"
                });
                window.parent.firstisfresh = false;
                this.timerRefresh(window.parent.firstisfresh);
                this.tableData = [];
                return
            }
        },
        //遍历查询出含有某一个关键字的json对象
        /**
         * 
         * @param {*} jsonobj 数据源
         * @param {*} key   查询关键字
         */
        getarray(jsonobj, key) {
            var newcontent = [];
            if (jsonobj && key) {
                $.each(jsonobj, function (index, ele) {
                    if (ele && ele.key && ele.mainkey === key) {
                        newcontent.push({
                            "key": ele.key,
                            "val": ele.value,
                            "type": ele.type
                        })
                    }
                });
                return newcontent;
            }
        },
        //查看剩余JSON对象的细节内容
        seeDatails(data) {
            this.jsonstr = data.str;
            this.drawer = true;
        },
        timerRefresh(tempfresh) {
            if (tempfresh) {
                this.inloadNowData();
                var timer = setTimeout(() => {
                    this.timerRefresh(window.parent.firstisfresh);
                }, 500);
            } else {
                clearTimeout();
            }
        },
        inloadNowData() {
            this.percentage += 20;
            if (this.percentage > 100) {
                try {
                    this.getMoitors();
                } catch (error) {
                    try {
                        setTimeout(function name(params) {
                            this.getMoitors();
                        }, 500);
                        console.log(error);
                    } catch (error) {
                        console.log(error);
                    }
                }
                this.percentage = 0;
            }
        },
        cellStyle_pop(row, column, rowIndex, columnIndex) { //改变table全局样式
            if (row.row.key.indexOf("Error") >= 0 && row.columnIndex === 1) {
                return {
                    'font-size': '13px',
                    height: '15px', //设置行高为15px(窄)
                    padding: '2px',
                    color: "#c54f43",
                    'background-color': "#1f1d1d",
                    'font-weight': '550'
                }
            } else {
                return {
                    'font-size': '13px',
                    height: '15px', //设置行高为15px(窄)
                    padding: '2px',
                    color: "#bbb9b9", //
                    'background-color': "#1f1d1d"
                };
            }
        },
    },
});

/**
 * 只获取到第二层的JSON格式的数据
 * @param {*} jsonStr 
 * @returns 
 */
function formatJson(jsonStr) {
    var tempobj = JSON.parse(jsonStr);
    var temptable = [];
    //一层循环
    $.each(tempobj, function (n1, value1) {
        //判断value是否是对象
        if (value1 && typeof value1 === "object") {
            temptable.push({
                "key": n1,
                "value": "",
                "mainkey": null,
                "type": "obj"
            });
            //二层循环
            $.each(value1, function (n2, value2) {
                if (value2 && typeof value2 === "object") {
                    temptable.push({
                        "key": n2,
                        "value": value2,
                        "mainkey": n1,
                        "type": "obj"
                    });
                } else {
                    temptable.push({
                        "key": n2,
                        "value": value2,
                        "mainkey": n1,
                        "type": "str"
                    })
                }
            })
        } else {
            temptable.push({
                "key": n1,
                "value": value1,
                "mainkey": null,
                "type": "str"
            })
        }
    });
    return temptable;
}

function getjsonstr(msg) {
    // 设置缩进为2个空格
    str = JSON.stringify(msg, null, 2);
    str = str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return str.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
}