var prodDataOutput = new Vue({ //树的VUE对象
    el: "#prodDataOutput",
    data() {
        return {
            isLoading:false,//是否加载到数据
        }
    },

    mounted() {
        var postdata = {
            "t": "get_session_uid", //请求操作类型
            "i": "",                //会话连接码
            "d": {}                 //发送的请求json数据信息
        }
        var getdata = RequestHd(postdata);
        if (getdata.s === 0) {
            top.LogInfor.sid = getdata.d.sid;
        }
        var logindata = {
            "t": "login",
            "i": top.LogInfor.sid,
            "d": {
                "eid": "",
                "uid": 'yzq',
                "pwd": 'q1w2e3r4t5...',
                "verify_code": ''
            }
        }
        var relginD = RequestHd(logindata); //该方法从common.js中得到 
        if (relginD.s === 0) { 
        }
    },

    methods: {
        startAjax(func,dataType,sendInfo){
            var ans =null;
            let _this = this;
            var postdata = sendInfo;
            $.ajax({
                type: 'POST',
                url: "http://10.97.76.65:8086/api/"+func,
                async: false,
                data: JSON.stringify(postdata),
                contentType: 'application/json; charset=utf-8',
                dataType: "JSON",//返回值类型
                beforeSend: function(xhr) {
                    this.isLoading = true;
                    //$('#main').busyLoadFull("show", { background: "rgba(0, 51, 101, 0.83)", image: "tardis", animate: "slide" });
                },
                success: function(data) {
                    if(data.success){
                        ans = data;
                    }
                    else if(!data.success){
                        _this.$message({
                            message:dataType+ "请求失败",
                            type: 'error'
                        })
                        this.isLoading = false;
                    }
                    return;
                },
                error: function(data) {
                    _this.$message({
                        message:dataType+ "异常",
                        type: 'error'
                    })
                    this.isLoading = false;
                    return;
                },
                reload:function(){
                    this.$message({
                        message: dataType+"重连",
                        type: 'error'
                    })
                    this.isLoading = false;
                    return;
                }
            });
            return ans;
        },
        getInfo1(){
            let sendData ={
                "pagesize":20,//每页多少行
                "currentpage":1,//当前第几页
                "materialidout":"YLK",//烟包编码模糊查询
                "materialname":"玉溪"//烟包名称模糊查询
            };
            let d = this.startAjax("QuerryPFStockAPI","配方高架库汇总库存",sendData);
            console.log("配方高架库汇总库存");
            console.log(d);
        },
        getInfo2(){
            let sendData ={
                "pagesize":20,//每页多少行
                "currentpage":1,//当前第几页
                "lane":1,//货位排
                "bay":"",//货位列
                "floor":"",//货位层
                "materialidout":"YLK",//烟包编码模糊查询
                "materialname":"玉溪"//烟包名称模糊查询
            }
            let d = this.startAjax("QuerryPFStockDetailAPI","货位明细",sendData);
            console.log("货位明细");
            console.log(d);
        },

        writeTest(){
            var temp = setdataCDB([{key:"A01010101050100062",value:"5.23"}]);
            console.log(temp);
        }
    }
});