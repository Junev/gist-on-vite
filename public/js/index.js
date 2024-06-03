$(document).ready(function () {
    $(document).ready(function () {
        var $submenu = $('.submenu');
        var $mainmenu = $('.mainmenu');
        $submenu.on('click', 'li', function () {
            $submenu.siblings().find('li').removeClass('chosen');
            $(this).addClass('chosen');
        });
        $mainmenu.on('click', 'li', function () {
            $(this).next('.submenu').slideToggle().siblings('submenu').slideUp();
        });
    });  
    //监控浏览器刷新内容
    window.onbeforeunload = function () {
        window.location.reload();
    };
});
var IO = new Vue(
    {
        el: '#IO',
        data: {
            nameId: '',
            password: '',
            verify_code: '',
            verifyimg: '',
            sid: '',
            userole: null
        },
        created: function () {
            this.getverify(); //一开始加载获取验证码的方法
        },
        methods: {
            //获取验证码
            getverify() {
                $.ajax({
                    type: 'POST', //请求方法
                    url: '/api', //请求改操作的地址
                    beforeSend: function (request) {      //使用beforeSend将请求头部的格式设置为json格式
                        request.setRequestHeader("Content-Type", "application/json");
                    },
                    async: false,//改为同步操作
                    data: JSON.stringify({
                        "t": "get_session_uid", //请求操作类型
                        "i": "",                //会话连接码
                        "d": {}                 //发送的请求json数据信息
                    }),
                    Content_Type: 'application/json',//获知请求中的消息主体是用何种方式编码
                    dataType: "JSON",  //返回的数据类型
                    success: function (data) {
                        top.loginInfo.sid = data.d.sid;
                        this.sid = data.d.sid;
                        document.getElementById('imageId').src = '/api/verify/' + this.sid; //获取验证码图片并赋值
                    },
                    error: function (data) {
                        this.$message({
                            message: "程序运行异常！",
                            type: 'error'
                        })//出错抛出的信息
                        return;
                    }
                });
            },
            //登录事件按钮
            check() {
                var nameId = this.nameId;
                var password = this.password;
                var verify_code = this.verify_code;

                if (nameId == '' || password == '') {
                    this.$message({
                        message: '账号或密码为空！',
                        type: 'error'
                    })
                    return;
                }
                var lgindata = {
                    "t": "login",
                    "i": top.loginInfo.sid,
                    "d": {
                        "eid": "",
                        "uid": nameId,
                        "pwd": password,
                        "verify_code": verify_code
                    }
                }
                var relginD = RequestHd(lgindata); //该方法从common.js中得到 
                if (relginD.s == 0) {
                    top.loginInfo.UseID = relginD.d.uinfo.ACCOUNTID;
                    top.loginInfo.UseName = relginD.d.uinfo.ACCOUNTNAME;
                    top.loginInfo.UseRole = relginD.d.uinfo.ACCOUNTROLE;
                    top.loginInfo.loginstatus = relginD.s.toString();
                    this.userole = relginD.d.uinfo.ACCOUNTROLE == 1 ? true : false;
                    document.body.style.backgroundColor = "#f6f6f6";
                    document.getElementById("IO").style.visibility = "hidden";//隐藏
                    document.getElementById("mainpage").style.visibility = "visible";//显示
                    $('#userid').text(top.loginInfo.UseName);
                }
                else {
                    this.$message({
                        message: relginD.m,
                        type: 'error'
                    })
                    return;
                }
            }

        }
    });
var mainpage = new Vue({
    el: "#mainpage",
    methods: {
        //注销事件
        checkout() {
            var lginoutdata =
            {
                "t": "logout",
                "i": top.loginInfo.sid,
                "d": {
                    "eid": "",
                    "uid": top.loginInfo.UseID,
                }
            }
            var lginoutD = RequestHd(lginoutdata)
            if (lginoutD.s == 0) {
                sessionStorage.clear();
                window.location.href = "index.html";
            }
            else {
                this.$message({
                    message: '注销失败请联系管理员！',
                    type: 'error'
                })
                return;

            }

        }
    }

});
