var IO = new Vue({
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
        this.getcheckimg(); //一开始加载获取验证码的方法
    },
    methods: {
        //获取验证码
        getcheckimg() {
            this.sid = RequestHd({
                t: "get_session_uid",
                i: null,
                d: null
            }).d.sid
            document.getElementById('imageId').src = pds_url + '/verify/' + this.sid;
        },
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
            var loginP = {
                t: "login",
                i: this.sid,
                d: {
                    eid: null,
                    uid: nameId,
                    pwd: password,
                    verify_code: verify_code,
                    pms_flag: true,
                }
            }
            var loginG = RequestHd(loginP)
            if (loginG.s == "0") {
                sessionStorage.setItem("UserID",loginG.d.uid);
                sessionStorage.setItem("UserName",loginG.d.uinfo.ACCOUNTNAME);
                sessionStorage.setItem("sid",loginG.d.sid);
                sessionStorage.setItem("clientip",loginG.d.uinfo.CLIENTIP);
                sessionStorage.setItem("UserRights",JSON.stringify(loginG.d.uinfo.USERRIGHTS));
                window.location = "main.html"
            } else {
                this.getcheckimg();
                this.$message({
                    message: loginG.m,
                    type: 'error'
                })
                return;
            }
        }
    }
});