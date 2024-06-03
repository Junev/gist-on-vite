var maxFileSize = 20; //最大的文档上传大小 50M
var docPath = 'doc_files/docfiles/appPMS/immdFile';

var openPageCount = 0; //打开页面数
var last_menuid;

var firstisfresh = true; //首界面是否需要刷新


top.LogInfor.UserID = sessionStorage.getItem("UserID");
top.LogInfor.UserName = sessionStorage.getItem("UserName");
top.LogInfor.sid = sessionStorage.getItem("sid");
top.LogInfor.clientip = sessionStorage.getItem("clientip");
top.LogInfor.UserRights = JSON.parse(sessionStorage.getItem("UserRights"));

$(document).ready(function () {
    try {
        if (top.LogInfor) {
            if (!top.LogInfor.sid)
                top.LogInfor.sid = sessionStorage.getItem("sid");
            mainpage.getmsgs(); //获取新消息
            mainpage.msgsNumber > 0 ? mainpage.hiddenbadge = false : mainpage.hiddenbadge = true;
            msgnum = mainpage.msgsNumber;
        }
        //开发阶段 暂时 禁用自动刷新信息功能
        // window.setInterval(function(){//每5s刷新一次新消息，此方法不可写入try中
        //     mainpage.getmsgs();
        //     mainpage.msgsNumber > 0 ? mainpage.hiddenbadge = false :mainpage.hiddenbadge = true;
        // }, 5000);

    } catch {
        sessionStorage.clear();
        window.location = 'login.html';
     }
    if (top.LogInfor && top.LogInfor.UserRights && top.LogInfor.sid) {
        var userName = top.LogInfor.UserName.toString();
        $('.userImageShort').text(userName.substring(0, 1));
        $('.userImage').text(userName.substring(0, 1));
        $('.userInfoName').text(userName);

        var mstr = "<ul>\n"; //菜单开始
        var usermenus = null;
        //2022 04 21
        var tempusermenus = loaddata("SYS_MENU", []);
        var tempflag = tempusermenus.d ? true : false;
        if (tempflag) {
            usermenus = get_usermenus($.Enumerable.From(tempusermenus.d).ToArray(), top.LogInfor.UserRights);
        }
        
        var nowmenus = [];
        if (tempflag) {
            //这里是写死的，如果是添加到n级菜单的对应在这里加即可,循环中对应添加层级的循环
            var onemenus = $.Enumerable.From(tempusermenus.d).Where(a => a.MENU_TYPE == 1).OrderBy("$.MENU_ID").OrderBy("$.MENU_INDEX").ToArray();
            var twomenus = $.Enumerable.From(tempusermenus.d).Where(a => a.MENU_TYPE == 2).OrderBy("$.MENU_ID").OrderBy("$.MENU_INDEX").ToArray();
            var threemenus = $.Enumerable.From(tempusermenus.d).Where(a => a.MENU_TYPE == 3).OrderBy("$.MENU_ID").OrderBy("$.MENU_INDEX").ToArray();
            var fourmenus = $.Enumerable.From(tempusermenus.d).Where(a => a.MENU_TYPE == 4).OrderBy("$.MENU_ID").OrderBy("$.MENU_INDEX").ToArray();
            var arrmenus1 = []
            onemenus.forEach(one => {
                one = createMenu(one);
                one.Child_SYS_MENU_RIGHTS = [];
                one.Child_SYS_MENU = [];
                //抓出每一个一级菜单的子菜单
                var arrtwo = $.Enumerable.From(twomenus).Where(a => a.PARENT_ID == one.MENU_ID).OrderBy("$.MENU_ID").OrderBy("$.MENU_INDEX").ToArray();
                //现在判断二级菜单有没有三级菜单
                var arrmenus2 = [];
                if (arrtwo.length > 0) {
                    arrtwo.forEach(two => {
                        var arrthree = $.Enumerable.From(threemenus).Where(b => b.PARENT_ID == two.MENU_ID).OrderBy("$.MENU_ID").OrderBy("$.MENU_INDEX").ToArray();
                        two = createMenu(two);
                        two.Child_SYS_MENU_RIGHTS = [];
                        two.Child_SYS_MENU = [];
                        var arrmenus3 = [];
                        if (arrthree.length > 0) {
                            arrthree.forEach(three => {
                                var arrfour = $.Enumerable.From(fourmenus).Where(c => c.PARENT_ID == three.MENU_ID).OrderBy("$.MENU_ID").OrderBy("$.MENU_INDEX").ToArray();
                                three = createMenu(three);
                                three.Child_SYS_MENU_RIGHTS = [];
                                three.Child_SYS_MENU = [];
                                // //console.log(three);
                                arrfour.forEach(four => {
                                    four = createMenu(four);
                                    four.Child_SYS_MENU = [];
                                    four.Child_SYS_MENU_RIGHTS = [];
                                    three.Child_SYS_MENU = four;
                                });
                                arrmenus3.push(three);
                            });
                            two.Child_SYS_MENU = arrmenus3 ? arrmenus3 : [];
                            arrmenus2.push(two);
                        } else {
                            two.Child_SYS_MENU = arrmenus3 ? arrmenus3 : [];
                            arrmenus2.push(two);
                        }
                    });
                    one.Child_SYS_MENU = arrmenus2 ? arrmenus2 : [];
                    arrmenus1.push(one)
                } else {
                    one.Child_SYS_MENU = arrmenus2 ? arrmenus2 : [];
                    arrmenus1.push(one)
                }
            });
            nowmenus = $.Enumerable.From(arrmenus1).OrderBy("$.MENU_ID").OrderBy("$.MENU_INDEX").ToArray();
        }
        $.each(nowmenus, function (index, menux) {
            //console.log(menux);
            if (checkmenu(menux.MENU_ID, usermenus)) {
                if (menux.MENU_TYPE === 1) //一级菜单构造
                    mstr += "<li class='lsm-sidebar-item'><a  id='" + menux.MENU_ID +
                        "' href='javascript:;' style='text-decoration: none;box-shadow:  0px 1px 1px rgba(49, 51, 54, 0.1);'><i  class=\"fa fa-" +
                        (menux.MENU_IMG == null ? 'bar-chart-o' : menux.MENU_IMG) +
                        "\" style='color:#5e86c1'></i><span>" + menux.MENU_NAME +
                        "</span><i class='my-icon lsm-sidebar-more'></i></a>"
                //在一级菜单的基础上构造二级菜单
                // mstr += "<ul>";
                var tempChild2 = $.Enumerable.From(menux.Child_SYS_MENU).OrderBy("$.MENU_ID").OrderBy("$.MENU_INDEX").ToArray();
                //console.log(tempChild2)
                $.each(tempChild2, function (index2, menux2) {
                    //console.log(menux2)
                    if (index2 === 0) {
                        mstr += "<ul>"
                    }
                    if (checkmenu(menux2.MENU_ID, usermenus)) {
                        if (menux2.MENU_TYPE === 2) {
                            if (menux2.Child_SYS_MENU.length === 0) {
                                mstr = mstr + "<li><a id='" + menux2.MENU_ID +
                                    "' class='add'  ><span>" + menux2.MENU_NAME +
                                    "</span></a></li>";
                                mainpage.Allmenus.push({
                                    "MENU_ID": menux2.MENU_ID,
                                    "MENU_NAME": menux2.MENU_NAME,
                                    "MENU_HREF": menux2.MENU_HREF,
                                    "MENU_INDEX": menux2.MENU_INDEX
                                })
                            } else {
                                if (menux2.MENU_HREF != null) {
                                    mainpage.Allmenus.push({
                                        "MENU_ID": menux2.MENU_ID,
                                        "MENU_NAME": menux2.MENU_NAME,
                                        "MENU_HREF": menux2.MENU_HREF,
                                        "MENU_INDEX": menux2.MENU_INDEX
                                    })
                                }
                                mstr += "<li class='lsm-sidebar-item'><a id='" + menux2.MENU_ID +
                                    "' href='javascript:;' style='text-decoration: none'><i></i><span>" +
                                    menux2.MENU_NAME +
                                    "</span><i class='my-icon lsm-sidebar-more'></i></a>"
                                var tempChild3 = $.Enumerable.From(menux2
                                    .Child_SYS_MENU).OrderBy("$.MENU_ID").OrderBy("$.MENU_INDEX").ToArray();
                                $.each(tempChild3, function (index3, menux3) {
                                    if (index3 == 0) {
                                        mstr += "<ul>";
                                    }
                                    if (checkmenu(menux3.MENU_ID, usermenus)) {
                                        if (menux3.Child_SYS_MENU.length ===
                                            0) {
                                                mstr = mstr + "<li><a id='" + menux3.MENU_ID +
                                                "'  class='add'><span>" + menux3.MENU_NAME + "</span></a></li>";

                                            mainpage.Allmenus.push({
                                                "MENU_ID": menux3.MENU_ID,
                                                "MENU_NAME": menux3.MENU_NAME,
                                                "MENU_HREF": menux3.MENU_HREF,
                                                "MENU_INDEX": menux2.MENU_INDEX
                                            })
                                        } else {
                                            if (menux3.MENU_HREF != null) {
                                                mainpage.Allmenus.push({
                                                    "MENU_ID": menux3.MENU_ID,
                                                    "MENU_NAME": menux3.MENU_NAME,
                                                    "MENU_HREF": menux3.MENU_HREF,
                                                    "MENU_INDEX": menux2.MENU_INDEX
                                                })
                                            }
                                            mstr +=
                                                "<li class='lsm-sidebar-item'><a id='" +
                                                menux3.MENU_ID +
                                                "' href='javascript:;' style='text-decoration: none'><i></i><span>" +
                                                menux3.MENU_NAME +
                                                "</span><i class='my-icon lsm-sidebar-more'></i></a>";
                                            var tempChild4 = $.Enumerable.From(
                                                menux3.Child_SYS_MENU)
                                                .OrderBy("$.MENU_ID").OrderBy("$.MENU_INDEX").ToArray();
                                            $.each(tempChild4, function (index4,
                                                menux4) {
                                                if (index4 === 0) {
                                                    mstr += "<ul>"
                                                }
                                                if (menux4.MENU_TYPE ===
                                                    4) {
                                                    mainpage.Allmenus
                                                        .push({
                                                            "MENU_ID": menux4.MENU_ID,
                                                            "MENU_NAME": menux4.MENU_NAME,
                                                            "MENU_HREF": menux4.MENU_HREF,
                                                            "MENU_INDEX": menux2.MENU_INDEX
                                                        })
                                                    mstr +=
                                                        "<li><a id='" +
                                                        menux4.MENU_ID +
                                                        "'   class='add'  ><span>" +
                                                        menux4
                                                            .MENU_NAME +
                                                        "</span></a></li>";
                                                }
                                            });
                                            mstr += "</ul>"
                                            mstr += "</li>";
                                        }
                                    }
                                });
                                mstr += "</ul>";
                                mstr += "</li>";
                            }
                        }
                    }
                });
                mstr += "</ul>";
            }
            mstr += "</li>";
        });
        mstr += "</ul>\n";
        $('.menus').append(mstr);
        const matchRes = window.location.search.match(/path=(?<path>\w+)/)
        if (matchRes && matchRes.groups.path) {
            addTabs(matchRes.groups.path)
        }   
    } else {
        mainpage.errorLog();
    }
    $(".add").click(function () {
        var thisid = $(this).attr("id");
        if (thisid === "M01M01") {
            $("#home").addClass("in active");
            firstisfresh = true;
            window.parent.document.getElementById("main_frame").contentWindow.timerRefresh(firstisfresh);
            return;
        } else {
            firstisfresh = false;
            window.parent.document.getElementById("main_frame").contentWindow.timerRefresh(firstisfresh);
        }
        addTabs(thisid);

    });
    //关闭全部tab框按钮事件
    $("#colBut").click(function () {
        if (openPageCount === 0) {
            mainpage.CloseBtn_popWin();
        }
        $("#myTab li").each(function (index, obj) {
            // 首页不可关闭
            var tempFrID = $(obj).attr("id");
            if (tempFrID != 'll') {
                var idParent1 = $(obj).attr("id"); //通过获取点击标签页叉叉父类的id，remove掉
                var idParent2 = $(obj).children().attr("href");
                openPageCount = openPageCount - 1;
                $("#" + idParent1).remove();
                $("#" + idParent2.replace("#", "")).remove();
            } else { }
            openPageCount = 0;
        });
        //首页处于激活的状态  并且显示
        $("#home").addClass("in active");
    });
    $(".lsm-sidebar.lsm-sidebar-item >ul>li").click(function () {
        $(".lsm-sidebar.lsm-sidebar-item >ul>li").removeClass('chosen'); // 删除其他兄弟元素的样式
        $(this).addClass('chosen'); // 添加当前元素的样式
    });
    $('.lsm-scroll').slimscroll({
        height: 'auto',
        position: 'right',
        railOpacity: 1,
        size: "5px",
        opacity: .4,
        color: '#fffafa',
        wheelStep: 5,
        touchScrollStep: 50
    });
    $('.lsm-container ul ul').css("display", "none");
    $('.lsm-sidebar-item a').on('click', function () {
        $('.lsm-scroll').slimscroll({
            height: 'auto',
            position: 'right',
            size: "8px",
            color: '#9ea5ab',
            wheelStep: 5,
            touchScrollStep: 50
        });
        if (!$('.left-side-menu').hasClass('lsm-mini')) {
            $(this).parent("li").siblings("li.lsm-sidebar-item").children('ul').slideUp(200);
            if ($(this).next().css('display') == "none") {
                //展开未展开
                $(this).next('ul').slideDown(200);
                $(this).parent('li').addClass('lsm-sidebar-show').siblings('li').removeClass(
                    'lsm-sidebar-show');
            } else {
                //收缩已展开
                $(this).next('ul').slideUp(200);
                $(this).parent('li').removeClass('lsm-sidebar-show');
            }
        }
    });
    var oldChoose = ''
    var reShowFlag = true;
    
    $('#mini').on('click', function () {
        if (!$('.left-side-menu').hasClass('lsm-mini')) {
            $('.lsm-sidebar-item.lsm-sidebar-show').removeClass('lsm-sidebar-show');
            $('.lsm-container ul').removeAttr('style');
            $('.left-side-menu').addClass('lsm-mini');
            $('.left-side-menu').stop().animate({
                width: 60
            }, 300);
            $('#main').offset({
                "left": 60
            });
        } else {
            $('.left-side-menu').removeClass('lsm-mini');
            $('.lsm-container ul ul').css("display", "none");
            $('.left-side-menu').stop().animate({
                width: 240
            }, 200);
            $(".lsm-popup.second").hide();
            reShowFlag = true;
            $('#main').offset({
                "left": 240
            });
        }

    });

    $(document).on('click', '.lsm-mini .lsm-container ul:first>li', function (node) {
        if(node && node.target.getAttribute('id') === oldChoose && $("#menus_sider") && $("#menus_sider").length >0 && !reShowFlag){
            $(".lsm-popup.second").hide();
            $(".lsm-popup.third").hide();
            $(".lsm-popup.four").hide();
            reShowFlag = true;
        }
        else{
            $(".lsm-popup.third").hide();
            $(".lsm-popup.four").hide();
            $(".lsm-popup.second").hide();

            $(".lsm-popup.second").length == 0 && ($(".lsm-container").append(
                "<div class='second lsm-popup lsm-sidebar' id='menus_sider'><div></div></div>"
            ));
            $(".lsm-popup.second>div").html($(this).html());
            $(".lsm-popup.second").show();
            $(".lsm-popup.third").hide();
            $(".lsm-popup.four").hide();
            var top = $(this).offset().top;
            var d = $(window).height() - $(".lsm-popup.second>div").height();
            if (d - top <= 0) {
                top = d >= 0 ? d - 300 : 0;
            }
            $(".lsm-popup.second").stop().animate({
                "top": top-60
            }, 60);

            oldChoose = node.target.getAttribute('id');
            reShowFlag = false;
        }
    });

    $(document).on('click', '.second.lsm-popup.lsm-sidebar > div > ul > li>a', function () {
        let c = $(".second.lsm-popup.lsm-sidebar > div > ul > li>a");
        if(c && c.length > 0 && c[0].className === 'add'){
            var thisid = $(this).attr("id");
            addTabs(thisid);
            $(".lsm-popup.second").hide();
            reShowFlag = true;
        }
    });
    $(document).on('click', '.third.lsm-popup.lsm-sidebar > div > ul > li>a', function () {
        let c = $(".third.lsm-popup.lsm-sidebar > div > ul > li>a");
        if(c && c.length > 0 && c[0].className === 'add'){
            var thisid = $(this).attr("id");
            addTabs(thisid);
            $(".lsm-popup.second").hide();
            $(".lsm-popup.third").hide();
            reShowFlag = true;
        }
    });
    $(document).on('click', '.four.lsm-popup.lsm-sidebar > div > ul > li>a', function () {
        let c = $(".four.lsm-popup.lsm-sidebar > div > ul > li>a");
        if(c && c.length > 0 && c[0].className === 'add'){
            var thisid = $(this).attr("id");
            addTabs(thisid);
            $(".lsm-popup.second").hide();
            $(".lsm-popup.third").hide();
            $(".lsm-popup.four").hide();
            reShowFlag = true;
        }
    });
    $(document).on('mouseover', '.second.lsm-popup.lsm-sidebar > div > ul > li', function () {
        if (!$(this).hasClass("lsm-sidebar-item")) {
            $(".lsm-popup.third").hide();
            return;
        }
        $(".lsm-popup.four").hide();
        $(".lsm-popup.third").length == 0 && ($(".lsm-container").append(
            "<div class='third lsm-popup lsm-sidebar' ><div></div></div>"));
        $(".lsm-popup.third>div").html($(this).html());
        $(".lsm-popup.third").show();
        $(".lsm-popup.four").hide();
        var top = $(this).offset().top;
        var d = $(window).height() - $(".lsm-popup.third").height();
        if (d - top <= 0) {
            top = d >= 0 ? d - 8 : 0;
        }
        $(".lsm-popup.third").stop().animate({
            "top": top - 60
        }, 60);
    });
    $(document).on('mouseover', '.third.lsm-popup.lsm-sidebar > div > ul > li', function () {
        if (!$(this).hasClass("lsm-sidebar-item")) {
            $(".lsm-popup.four").hide();
            return;
        }
        $(".lsm-popup.four").length == 0 && ($(".lsm-container").append(
            "<div class='four lsm-popup lsm-sidebar' ><div></div></div>"));
        $(".lsm-popup.four>div").html($(this).html());
        $(".lsm-popup.four").show();
        var top = $(this).offset().top;
        var d = $(window).height() - $(".lsm-popup.four").height();
        if (d - top <= 0) {
            top = d >= 0 ? d - 8 : 0;
        }
        $(".lsm-popup.four").stop().animate({
            "top": top - 60
        }, 60);
    });
    //鼠标离开的时候
    $(document).on('mouseleave',
        '.lsm-mini .lsm-container ul:first, .lsm-mini .slimScrollBar,.second.lsm-popup ,.third.lsm-popup,.four.lsm-popup',
        function () {
            $(".lsm-popup.third").hide();
            $(".lsm-popup.four").hide();
        });
    $(document).on('mouseover', '.lsm-mini .slimScrollBar,.third.lsm-popup', function () {
        $(".lsm-popup.third").show();
    });
    $(document).on('mouseover', '.lsm-mini .slimScrollBar,.four.lsm-popup', function () {
        $(".lsm-popup.four").show();
    });
    $(document).on('mouseover', '.four.lsm-popup', function () {
        $(".lsm-popup.third").show();
        $(".lsm-popup.four").show();
    });
    $('#logout').click(function () {
        changePwd.changelogout();
    });
});
//构造菜单树形表
function createMenu(arrayold) {
    var tempArray = {};
    tempArray.MENU_ID = arrayold.MENU_ID;
    tempArray.MENU_APP = arrayold.MENU_APP;
    tempArray.MENU_DESC = arrayold.MENU_DESC;
    tempArray.MENU_HREF = arrayold.MENU_HREF;
    tempArray.MENU_IMG = arrayold.MENU_IMG;
    tempArray.MENU_NAME = arrayold.MENU_NAME;
    tempArray.MENU_RIGHTCODE = arrayold.MENU_RIGHTCODE;
    tempArray.MENU_TYPE = arrayold.MENU_TYPE;
    tempArray.MENU_INDEX = arrayold.MENU_INDEX;

    return tempArray;
}

function addTabs(tempid) {
    var flag = 0; //标记当前这个标签页是否存在当前tab;中
    var t_temp = -1; //记录当前标签页  就是在已经打开的iframe中标记着
    var thisid = tempid; //获取点击对应标签页的ID
    SelectMenuColor(thisid, last_menuid, 2);
    var temp = 0;
    for (var i = mainpage.Allmenus.length - 1; i >= 0; i--) {
        //把对应点击的控件与标签页绑定起来，记录i（哪一个）为temp
        if ((thisid) === (mainpage.Allmenus[i].MENU_ID)) {
            temp = i;
            break;
        };
    }
    if(temp===0)
        return;

    //把所有标签页都移除active属性，在新添加的里面直接active
    $("#myTab li").removeClass("active");
    $("#con div").removeClass("in active");

    html = "<li class='active' id='lflag" + temp + "' ><a  href='#" + mainpage.Allmenus[temp].MENU_NAME +
        "' data-toggle='tab' style='height: 30px;padding-top: 5px;' id='" + mainpage.Allmenus[temp].MENU_ID +
        "'><div style='display: flex; align-items: center; font-weight: bold;'>" + "<div style='width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;'>" + mainpage.Allmenus[temp].MENU_NAME + "</div>" +
        "  <i class='el-icon-close  s_remove' style='font-size:14px;font-weight:900;padding: 1px;margin-left:6px' onClick='DeleteDiv(this)'><i></div></a></li>"
    html1 = "<div id='" + mainpage.Allmenus[temp].MENU_NAME +
        "' class='tab-pane fade in active'  style='height: 100%;width: 100%; background-color:#f3f4fa '><iframe style='width:100%;height:100%;border:1px solid rgba(122, 123, 124, 0.1);box-shadow: -3px 0 5px -1px rgba(113, 117, 121, 0.1),3px 0 5px -1px rgba(113, 117, 121, 0.1);background-color: #ffffff;' src='" +
        mainpage.Allmenus[temp].MENU_HREF + "'></iframe></div>"
    window.history.pushState(null,"",window.location.pathname + "?path=" + tempid)
    /*遍历所有的标签页，若已经存在，那么就直接加active掉，不需要再次添加*/
    $("#myTab li").each(function () {
        if ($(this).attr("id") === ("lflag" + temp)) {
            flag = 1;
            t_temp = temp;
        }
    })
    //如果是存在就直接加载该界面
    if (flag === 1) {
        $("#lflag" + t_temp).addClass("active");
        var f_temp = ($("#lflag" + t_temp).children().attr("href")).replace("#", "");
        var d_temp = $("#lflag" + t_temp).children().attr("id");
        $("#" + f_temp).addClass("in active");

    }
    //如果是不存在这个界面 则往对应的节点上加内容
    else {
        if (openPageCount >= 10) {
            mainpage.TabsOpen_popWin();
            //界面 定位到打开之前的最后一个窗口
            $("#myTab li:last").addClass("active"); //然后激活 关闭这个标签的上一个标签 并且打开
            var idChildren = $("#myTab li:last").children().attr("href");
            $("#" + idChildren.replace("#", "")).addClass("in active");
            $("a[id='" + thisid + "']").css("background-color", "#fff");
            $("a[id='" + thisid + "']").css("border-left", "solid 0px");
            return;
        } else {
            $("#myTab").append(html);
            $("#con").append(html1);
            openPageCount = openPageCount + 1;
        }
    }

}

function checkmenu(MENU_ID, usermenus) {
    return ($.inArray(MENU_ID, usermenus) > -1);
}
//根据系统所有菜单平铺列表、用户的功能菜单列表，获取用户功能菜单所涉及到的所有菜单平铺列表,用于生成菜单时的比对
function get_usermenus(allmenus, usermenus) {
    var menus = []; //需要返回的菜单列表
    $.each(usermenus, function (index, menux) { //找出用户功能权限菜单的所有父辈菜单,item存的是菜单id的字符串
        get_menus(menus, allmenus, menux)
    });
    return menus;
}
//获取某功能菜单所涉及到的所有父辈菜单列表
function get_menus(menus, allmenus, menux) {
    try {
        if ($.inArray(menux, menus) < 0)
            menus.push(menux);
        else
            return;
        var cmenu = $.Enumerable.From(allmenus).Where("$.MENU_ID=='" + menux + "'").ToArray()[0];
        if (cmenu && cmenu.PARENT_ID != null && cmenu.PARENT_ID != "")
            get_menus(menus, allmenus, cmenu.PARENT_ID);
    } catch (e) {
        return;
    }
}
//关闭标签页按钮事件
function DeleteDiv(obj) {
    var idParent1 = $(obj).parent().parent().parent().attr("id"); //通过获取点击标签页叉叉父类的id，remove掉
    var idParent2 = $(obj).parent().parent().attr("href");
    openPageCount = openPageCount - 1;
    // alert(openPageCount);
    $("#" + idParent1).remove();
    $("#" + idParent2.replace("#", "")).remove();
    $("#myTab li:last").addClass("active"); //然后激活 关闭这个标签的上一个标签 并且打开
    var idlast = $("#myTab li:last").children().attr("id");
    var idChildren = $("#myTab li:last").children().attr("href");
    $("#" + idChildren.replace("#", "")).addClass("in active");
}

function SelectMenuColor(curMenuID, lastMenuID, level) {
    if (level > 1) {
        $("a[id='" + curMenuID + "']").css("background-color",
            "#bdcee9"); //border-left-color: #AFEEEE高亮蓝色#c3e16a高亮黄绿色，选中条颜色;
        $("a[id='" + curMenuID + "']").css("border-left", "solid 4px #a4c07c");
        if (lastMenuID != "" && curMenuID != lastMenuID) {
            $("a[id='" + lastMenuID + "']").css("background-color", "#fff");
            $("a[id='" + lastMenuID + "']").css("border-left", "solid 0px");
        }
        if (curMenuID === lastMenuID) {
            $("a[id='" + curMenuID + "']").css("background-color",
                "#bdcee9"); //border-left-color: #AFEEEE高亮蓝色#c3e16a高亮黄绿色，选中条颜色;
            $("a[id='" + curMenuID + "']").css("border-left", "solid 4px #a4c07c");
        }
        last_menuid = curMenuID;
    } else
        last_menuid = "";
}

var msglist = new Vue({
    el: "#msglist",
    data: {
        msgs: [], //没有读取的新信息
        mymsgs: [], //待发消息
        ishis: false, //控制历史显示样式
        istosend: false, //true为待发信息
        istoreveived: false, //控制全部标记按钮
        iscreatemsg: false, //控制是否为新建消息页
        isselectuser: false, //控制是否为人员选择页
        Types: [],
        Levels: [],
        msgtype: [],
        selTypeID: "",
        selLevelID: "",
        selMsgTypeID: "",
        MessageTitle: '',
        pageTitle: "",
        heightData: 45 + "%", //控制msglist div的高度，默认为45%
        chilenHeight: 85 + "%",
        displayData: "none", //控制HisMsg div的显示，none为不显示，block为显示
        battenSure: 1, //记录当前msgs中是（1）新消息还是（2）历史消息
        hisTime: [], //历史查询时间
        hisTime_s: "", //开始时间
        hisTime_e: "", //结束时间
        drawer: false,
        direction: 'rtl',
        msgdivheight: '760px', //控制消息列表长短 historymsg:425/newmsg:760

        //移植新建消息
        msgFormmsg: {},
        msgFormTypes: [],
        msgFormLevels: [],
        Receivers: [], //接收信息的人员
        Attachments: [],
        comfromMsg: false, //默认隐藏确认信息按钮
        msgFormmsgtype: [],
        msgtypecss: "", // badge btn-primary(待确认)btn-success（已确认）btn-danger(消息有误)
        MessageConfrom: "",
        users: [], //具有组长角色的人

        //移植选择用户
        treeprops: {
            children: 'children', //treedata中子节点的对象名
            label: 'name', //treedata中用于label显示的项
            isLeaf: 'leaf', //是否是叶子节点
            id: 'id',
        },
        Usertypeoptions: [], //人员分组信息
        checkUser: [], //选择的用户对象
        checkUserID: [], //选择对象节点id
        expendNode: [], //默认展开的节点数组
        isResend: false, //false为新建信息添加接收人员，true为转发信息添加转发人员

        //2022 04 25
        savenosend: [], //保存但是不发送的消息对象
        userid: top.LogInfor.UserID,
        sendname: ""
    },
    mounted() {
        this.msgFormTypes = this.getBasicData("MessageType");
        this.msgFormLevels = this.getBasicData("MessageLevel");
        this.msgFormmsgtype = this.getBasicData("MessageComfrom");
        this.getmymsgs();
    },
    methods: {
        /**
         * 移除已上传到服务器上的文件
         * @param {文件信息} paras 
         */
        removefile(paras) {
            if (paras) {
                this.Attachments.splice($.inArray(paras, this.Attachments), 1);
                var fillfullpath = paras.substring(0, paras.lastIndexOf('@@')).replace('@@', '/');
                var postmsg = removeDBfile(fillfullpath);
                if (postmsg === 0) {
                    this.$message({
                        "message": '移除文档成功！',
                        "type": 'success'
                    })
                    return;
                } else {
                    this.$message({
                        "message": '移除文档失败！',
                        "type": 'error'
                    })
                    return;
                }
            }

        },
        //2022.4.19 获取基础数据
        getBasicData(para) {
            var _result = [];
            var _con = [{
                "cn": "EnumSet",
                "cp": "=",
                "v1": para,
                "v2": null
            }];
            var postP = loaddata("BXT_ENUMERATION", _con);
            var tempflag = postP.d ? true : false;
            if (tempflag) {
                _result = $.Enumerable.From(postP.d).OrderBy("$.ENUMVALUE").ToArray();
            } else {
                _result = [];
            }
            return _result;
        },
        openDrawer() {
            msglist.drawer = true;
        },
        handleClose(done) {
            msglist.msgdivheight = '720px';
            mainpage.showinfodialog = true;
            done();

        },
        Setconfig() {
            this.Types = this.getBasicData("MessageType");
            this.Levels = this.getBasicData("MessageLevel");
            this.msgtype = this.getBasicData("MessageComfrom");
        },
        //标记已读
        SetReveived: function (MessageID, USER_ID) {
            var _cons = [{
                "cn": "PUID",
                "cp": "=",
                "v1": MessageID,
                "v2": null,
            },
            {
                "cn": "USER_ID",
                "cp": "=",
                "v1": USER_ID,
                "v2": null,
            }
            ];
            var tempdate = newdate();
            var _val = {
                "ISREVEIVED": 1,
                "REVEIVETIME": "datetime" + "(" + tempdate + ")",
            }
            var dataP = saveData("MESSAGE_RECEIVER", _val, _cons);
            var dataG = RequestHd(dataP);
            if (dataG.s != 0) {
                return;
            }
            //将标记完成的从msgs中移除
            var msgCopy = [];
            this.msgs.forEach(msgx => {
                if (msgx.RUID != MessageID) {
                    msgCopy.push(msgx);
                }
            });
            this.msgs = msgCopy;
            mainpage.msgsNumber = this.msgs.length; //将处理结果返回给界面提示

        },
        //对新消息进行全部标记为已读
        SetReveivedAll: function () {
            this.msgs.forEach(msgx => {
                if (!msgx.IsReveived)
                    this.SetReveived(msgx.RUID, msgx.USER_ID);
            });
        },
        //查询历史信息
        FindMessage: function () {
            this.msgs = [];
            this.istosend = false;
            this.battenSure = 2;
            this.Timepick(); //初始化时间格式
            //发送的历史信息
            var paras = [{
                "cn": "STATUSID",
                "cp": "=",
                "v1": 1,
                "v2": null
            },
            {
                "cn": " SENDUSERID",
                "cp": "=",
                "v1": top.LogInfor.UserID,
                "v2": null
            },
            {
                "cn": "CREATEDATE",
                "cp": "between",
                "v1": "datetime(" + this.hisTime_s + ")",
                "v2": "datetime(" + this.hisTime_e + ")"
            }
            ];
            if (this.selTypeID)
                paras.push({
                    "cn": "TYPEID",
                    "cp": "=",
                    "v1": this.selTypeID,
                    "v2": null
                });
            if (this.selLevelID)
                paras.push({
                    "cn": "LEVELID",
                    "cp": "=",
                    "v1": this.selLevelID,
                    "v2": null
                });
            if (this.MessageTitle.trim() != "")
                paras.push({
                    "cn": "MESSAGETITLE",
                    "cp": "like",
                    "v1": '%' + this.MessageTitle.trim() + '%',
                    "v2": null
                });
            if (this.selMsgTypeID)
                paras.push({
                    "cn": "MESSAGECONFROM",
                    "cp": "=",
                    "v1": this.selMsgTypeID,
                    "v2": null
                });
            var modeldata = GetorDelData("mdb\\get", "V_MYMESSAGE", paras);
            var datas = RequestHd(modeldata); //当期返回数据一条消息包含一个接收人，当一条消息被多人接收就有多条数据
            var tempflag = datas.d ? true : false;
            //合并消息编号相同的数据
            if (tempflag) {
                if (datas.d.length > 0) {
                    tempdatas = $.Enumerable.From(datas.d).OrderBy("$.CREATEDATE").ToArray(); //排序
                    tempdatas.forEach(item => {
                        var i = 0;
                        for (var b = 0; b < this.msgs.length; b++) {
                            if (item.RUID === this.msgs[b].RUID) {
                                if (item.ISREVEIVED === 0) {
                                    this.msgs[b].ISREVEIVED = 0; //将信息标记为未读
                                }
                                if (this.msgs[b].USER_NAME.indexOf(",") != -1) {
                                    this.msgs[b].USER_NAME = this.msgs[b].USER_NAME + "...";
                                } else {
                                    this.msgs[b].USER_NAME = this.msgs[b].USER_NAME + "," + item.USER_NAME;
                                }
                                i++;
                            }
                        }
                        if (i === 0) {
                            this.msgs.push(item);
                        }
                    });
                }
            }

            //接收的历史信息
            var paras2 = [{
                "cn": "STATUSID",
                "cp": "=",
                "v1": 1,
                "v2": null
            },
            {
                "cn": "USER_ID",
                "cp": "=",
                "v1": top.LogInfor.UserID,
                "v2": null
            },
            {
                "cn": "SENDUSERID",
                "cp": "!=",
                "v1": top.LogInfor.UserID,
                "v2": null
            },
            {
                "cn": "CREATEDATE",
                "cp": "between",
                "v1": "datetime(" + this.hisTime_s + ")",
                "v2": "datetime(" + this.hisTime_e + ")"
            }
            ];
            if (this.selTypeID)
                paras2.push({
                    "cn": "TYPEID",
                    "cp": "=",
                    "v1": this.selTypeID,
                    "v2": null
                });
            if (this.selLevelID)
                paras2.push({
                    "cn": "LEVELID",
                    "cp": "=",
                    "v1": this.selLevelID,
                    "v2": null
                });
            if (this.MessageTitle.trim() != "")
                paras2.push({
                    "cn": "MESSAGETITLE",
                    "cp": "like",
                    "v1": '%' + this.MessageTitle.trim() + '%',
                    "v2": null
                });
            if (this.selMsgTypeID)
                paras2.push({
                    "cn": "MESSAGECONFROM",
                    "cp": "=",
                    "v1": this.selMsgTypeID,
                    "v2": null
                });
            var modeldata2 = GetorDelData("mdb\\get", "V_MYMESSAGE", paras2);
            var datas2 = RequestHd(modeldata2);
            var tempflag1 = datas2.d ? true : false;
            if (tempflag1) {
                if (datas2.d.length > 0) {
                    tempdatas2 = $.Enumerable.From(datas2.d).OrderByDescending("$.CREATEDATE").ToArray(); //倒叙排序
                    tempdatas2.forEach(item => {
                        this.msgs.push(item);
                    });
                }
            }
            if (this.msgs.length === 0) {

                this.$message({
                    message: "暂无数据",
                    type: "warning"
                })
                return

            }
        },
        //选择时间改变事件
        Timepick() {

            this.hisTime_s = this.newdateold(this.hisTime[0]);
            this.hisTime_e = this.newdateold(this.hisTime[1]);
        },
        //历史消息
        gethismessages() {
            this.isselectuser = false;
            this.iscreatemsg = false;
            this.istosend = false;
            this.istoreveived = true;
            this.ishis = true;
            this.pageTitle = "我的历史信息";
            this.msgs = [];
            this.heightData = 85 + "%";
            this.chilenHeight = 45 + "%";
            this.displayData = "block";
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            this.hisTime = [new Date(date), new Date()];
        },
        //获取待发信息
        getweitmesgs() {
            this.isselectuser = false;
            this.mymsgs = [];
            this.iscreatemsg = false;
            this.ishis = false;
            this.istosend = true;
            this.istoreveived = true;
            this.pageTitle = "我的待发信息";
            var _cons = [{
                "cn": "AUTHOR",
                "cp": "=",
                "v1": top.LogInfor.UserID,
                "v2": null
            },
            {
                "cn": "MESSAGESTATUS",
                "cp": "=",
                "v1": 0,
                "v2": null
            }
            ];
            var modeldata = GetorDelData("mdb\\get", "MICRO_MESSAGE", _cons);
            this.mymsgs = RequestHd(modeldata).d;

            this.heightData = 45 + "%";
            this.chilenHeight = 85 + "%",
                this.displayData = "none";
        },

        //获取还没有读到的新消息
        getmymsgs() {
            this.isselectuser = false;
            this.msgs = [];
            this.iscreatemsg = false;
            this.ishis = false;
            this.istosend = false;
            this.istoreveived = false;
            this.pageTitle = "我的未读信息";
            this.battenSure = 1;
            var _cons = [{
                "cn": "USER_ID",
                "cp": "=",
                "v1": top.LogInfor.UserID,
                "v2": null
            },
            {
                "cn": "ISREVEIVED",
                "cp": "=",
                "v1": 0,
                "v2": null
            },
            {
                "cn": "STATUSID",
                "cp": "=",
                "v1": 1,
                "v2": null
            } //已经发送的信息
            ];
            var modeldata = GetorDelData("mdb\\get", "V_MYMESSAGE", _cons);
            this.msgs = RequestHd(modeldata).d;
            //获取消息详细内容
            this.heightData = 45 + "%";
            this.chilenHeight = 85 + "%",
                this.displayData = "none";
        },
        showcreatemsg(msgid) {
            this.show(msgid); //读数据
            this.isselectuser = false;
            this.msgs = [];
            this.iscreatemsg = true;
            this.ishis = false;
            this.istosend = false;
            this.istoreveived = true;
            this.displayData = "none";

            this.pageTitle = "我的新建信息";
            this.battenSure = 1;
        },
        //时间格式
        newdateold(data) {
            var date = new Date(data);
            var now = "";
            now = date.getFullYear() + "-";
            now = now + (date.getMonth() + 1) + "-";
            now = now + date.getDate() + " ";
            now = now + this.mendZero(date.getHours()) + ":";
            now = now + this.mendZero(date.getMinutes()) + ":";
            now = now + this.mendZero(date.getSeconds()) + "";
            // now = "datetime(" + now + ")";
            return now;
        },
        mendZero(num) { //时间格式添0
            return (num = num < 10 ? '0' + num : num)
        },
        //移植新建消息
        setMounted() {
            this.comfromMsg = false;
            this.users = [];
            var _cons2 = [{
                "cn": "ROLE_ID",
                "cp": "=",
                "v1": "R010",
                "v2": null
            }];
            var userdata = GetorDelData("mdb\\get", "SYS_USERROLES", _cons2);
            this.users = RequestHd(userdata).d;
            this.users.forEach(item => {
                if (item.USER_ID === top.LogInfor.UserID) {
                    this.comfromMsg = true;
                }

            });
        },
        //时间格式
        newdate() {
            var date = new Date();
            var now = "";
            now = date.getFullYear() + "-";
            now = now + (date.getMonth() + 1) + "-";
            now = now + date.getDate() + " ";
            now = now + this.mendZero(date.getHours()) + ":";
            now = now + this.mendZero(date.getMinutes()) + ":";
            now = now + this.mendZero(date.getSeconds()) + "";
            // now = "datetime(" + now + ")";
            return now;
        },
        show: function (msgid) {
            this.setMounted();
            if (msgid == null) {
                var confrom = 0;
                var confromUser = "";
                var comfromTime = "";
                if (this.comfromMsg === true) {
                    confrom = 1;
                    confromUser = top.LogInfor.UserID;
                    comfromTime = "datetime(" + this.newdate() + ")";
                }
                this.msgFormmsg = {
                    MESSAGETYPE: 0,
                    MESSAGELEVEL: 0,
                    MESSAGETITLE: "",
                    MESSAGECONTENT: "",
                    MESSAGESTATUS: 0,
                    MESSAGECONFROM: confrom,
                    TARGETURL: null,
                    AUTHOR: top.LogInfor.UserID,
                    CREATEDATE: this.newdate(),
                    CONFROMUSER: confromUser,
                    CONFROMTIME: comfromTime,
                };

            } else {
                var _cons = [{
                    "cn": "RUID",
                    "cp": "=",
                    "v1": msgid,
                    "v2": null
                }];
                var modeldata = GetorDelData("mdb\\get", "MICRO_MESSAGE", _cons);
                this.msgFormmsg = RequestHd(modeldata).d[0];
            }
            msglist.MessageConfromCSS(); //控制MessageConfrom的显示样式
            msglist.Attachments = msglist.msgFormmsg.RUID && msglist.msgFormmsg.ATTACHMENTS && msglist.msgFormmsg.ATTACHMENTS != '' ? JSON.parse(msglist.msgFormmsg.ATTACHMENTS) : [];
            var con = [{
                "cn": "RUID",
                "cp": "=",
                "v1": this.msgFormmsg.RUID,
                "v2": null
            }];
            var model = GetorDelData("mdb\\get", "V_MYMESSAGE", con);
            this.Receivers = RequestHd(model).d;
            var tempreciver = $.Enumerable.From(this.Receivers).ToArray();
            if (tempreciver && tempreciver.length > 0) {
                this.sendname = tempreciver[0] ? tempreciver[0].SENDUSERNAME : "";
            } else {
                this.sendname = "";
            }
        },

        removeReceiver: function (Receiver) {
            this.Receivers.splice($.inArray(Receiver, this.Receivers), 1);
        },
        newAttachment: function () {
            try {
                var inputfile = document.getElementById('UpLoadFile');
                if (!inputfile.value || inputfile.value == '')
                    return;
                if (inputfile.files[0].size / (1024 * 1024) > maxFileSize) {
                    inputfile.value = '';
                    this.$message.error('文件太大，不能上传超过 ' + maxFileSize + 'M 的文档！');
                    return;
                }
                var tempdate = new Date();
                var RUID = tempdate.getFullYear().toString().substring(2, 4) + AppendZero(tempdate.getMonth() + 1) + AppendZero(tempdate.getDate()) + AppendZero(tempdate.getHours()) + AppendZero(tempdate.getMinutes()) + AppendZero(tempdate.getSeconds()) + AppendZero(tempdate.getMilliseconds());
                var filename = 'msg' + RUID + inputfile.value.substring(inputfile.value.lastIndexOf('.')); //服务器存储的文件名：信息点id.文件扩展名
                var em = UploadFile(docPath, filename, inputfile.files[0]); //上传文件到指定路径
                if (em == '') //上传成功
                    this.Attachments.push(docPath + "@@" + filename + "@@" + inputfile.files[0].name); //docPath/@@下载文件名@@显示文件名
            } catch (error) {
                this.$message.error(error.message);
            }
        },
        //保存待发或保存发送
        savemsg: function (issend) {
            this.msgFormmsg.AUTHOR = top.LogInfor.UserID;
            this.msgFormmsg.MESSAGESTATUS = issend ? 1 : 0; //发送或待发
            this.msgFormmsg.ATTACHMENTS = JSON.stringify(this.Attachments); //将附件数组转换为json字符串存储
            this.msgFormmsg.CREATEDATE = "datetime(" + this.newdate() + ")";
            var addMsgData = "";
            if (!this.msgFormmsg.RUID) { //新建的消息
                this.msgFormmsg.RUID = getNewID("MDB", "MICRO_MESSAGE", "RUID");
                addMsgData = addData("mdb\\add", "MICRO_MESSAGE", this.msgFormmsg); //添加

            } else { //修改信息
                if (this.msgFormmsg.MESSAGECONFROM === 1) { //组长创建的信息
                    this.msgFormmsg.CONFROMTIME = "datetime(" + newdate() + ")";
                } else {
                    this.msgFormmsg.CONFROMTIME = "";
                }
                var _cons = [{
                    "cn": "RUID",
                    "cp": "=",
                    "v1": this.msgFormmsg.RUID,
                    "v2": null
                }];
                addMsgData = saveData("MICRO_MESSAGE", this.msgFormmsg, _cons); //修改

            }
            var addSuccess = RequestHd(addMsgData); //保存编辑表单完成
            if (addSuccess.s != 0) {
                this.$message({
                    message: addSuccess.m,
                    type: "error"
                })
                return
            }
            var _delcon = [{
                "cn": "PUID",
                "cp": "=",
                "v1": this.msgFormmsg.RUID,
                "v2": null
            }];
            var delData = GetorDelData("mdb\\del", "MESSAGE_RECEIVER", _delcon);
            var delresult = RequestHd(delData);
            //添加组长身份的用户
            //当前用户不是组长角色，添加当前用户所在组的组长
            //获取登录用户所在的组
            var _cons = [{
                "cn": "USER_ID",
                "cp": "=",
                "v1": top.LogInfor.UserID,
                "v2": null
            }];
            var model = GetorDelData("mdb\\get", "SYS_USERS", _cons);
            var userType = RequestHd(model);
            var tempflag = userType.d ? true : false;
            var userTypeID = ""; //用户组编号
            if (tempflag) {
                userTypeID = userType.USER_TYPEID
            } else {
                userTypeID = "";
            }

            //获取用户组的所有组员
            var cons = [{
                "cn": "USER_TYPEID",
                "cp": "=",
                "v1": userTypeID,
                "v2": null
            }];
            var modelType = GetorDelData("mdb\\get", "SYS_USERS", cons);
            var userTypes = RequestHd(modelType).d;

            //查询所有的组长
            this.users.forEach(item => {
                var i = 0;
                if (item.USER_ID === top.LogInfor.UserID) { //当前用户就是组长角色
                    i++;
                } else {
                    this.Receivers.forEach(item2 => { //保证在用户已经添加组长后不重复添加
                        if (item2.USER_ID === item.USER_ID) {
                            i++;
                        }
                    });

                }
                if (i === 0) { //未添加的组长
                    //判断该组长是否为该用户的组长
                    userTypes.forEach(item3 => {
                        if (item3.USER_ID === item.USER_ID) {
                            this.Receivers.push({
                                PUID: this.msgFormmsg.RUID,
                                USER_ID: item.USER_ID,
                                IsReveived: false,
                                ReveiveTime: null
                            });
                        }
                    });
                }
            });
            $(this.Receivers).each(
                function (i, rx) {
                    var tempdata = {};
                    //2022 04 25
                    tempdata.PUID = msglist.msgFormmsg.RUID;
                    tempdata.USER_ID = rx.USER_ID;
                    tempdata.ISREVEIVED = 0;
                    tempdata.REVEIVETIME = "";
                    var postadd = addData("mdb\\add", "MESSAGE_RECEIVER", tempdata);
                    var getadd = RequestHd(postadd)
                    var tempfalg = getadd.d ? true : false;
                    // if (tempfalg) {
                    //     return;
                    // }
                });
            this.getweitmesgs(); //重新加载待发数据用于保存发送的信息为之前待发数据
            this.iscreatemsg = false;
            this.istoreveived = false;
            this.getmymsgs();
            msglist.msgdivheight = '760px';
        },
        //转发
        resendmsg: function () {
            this.getweitmesgs(); //重新加载待发数据用于保存发送的信息为之前待发数据
            this.iscreatemsg = false;
            this.istoreveived = false;
            this.getmymsgs();
            msglist.msgdivheight = '760px';
            this.showcreatemsg(this.msgFormmsg.RUID);
            this.addUser();

        },
        //删除信息，只删除保存待发的信息
        deletemsg: function () {
            this.$confirm('确认【删除】该消息吗？', '确认操作', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                var delpost = GetorDelData("mdb\\del", "MICRO_MESSAGE", [{
                    "cn": "RUID",
                    "cp": "=",
                    "v1": this.msgFormmsg.RUID
                }]);
                var delres = RequestHd(delpost);
                if (delres) {
                    msglist.getweitmesgs();
                    this.iscreatemsg = false;
                    this.istoreveived = false;
                    this.getmymsgs();
                    msglist.msgdivheight = '760px';
                } else {
                    return;

                }
                //$('#msgform').fadeOut();

            }).catch(() => {
                return;
            });

        },
        //信息确认样式
        MessageConfromCSS() {
            msglist.msgFormmsgtype.forEach(item => {
                if (item.EnumValue === msglist.msgFormmsg.MESSAGECONFROM) {
                    msglist.MessageConfrom = item.EnumString;
                }
            });
            switch (this.msgFormmsg.MESSAGECONFROM) {
                case 0: //待确认
                    this.msgtypecss = "spanbadge btn-primary";
                    break;
                case 1: //确认
                    this.msgtypecss = "spanbadge btn-success";
                    break;
                case 2: //不予确认
                    this.msgtypecss = "spanbadge btn-danger";
                    break;
                default:
                    this.msgtypecss = "spanbadge btn-primary";
                    break;

            }
        },
        //信息确认操作
        msgtypeChenge() {
            var upmsg = {};
            upmsg.CONFROMUSER = top.LogInfor.UserID;
            upmsg.CONFROMTIME = "datetime(" + this.newdate() + ")";
            upmsg.MESSAGECONFROM = this.msgFormmsg.MESSAGECONFROM;
            var _cons = [{
                "cn": "RUID",
                "cp": "=",
                "v1": this.msgFormmsg.RUID,
                "v2": null
            }];
            var addMsgData = saveData("MICRO_MESSAGE", upmsg, _cons); //修改

            var addSuccess = RequestHd(addMsgData); //保存编辑表单完成
            if (addSuccess.s === 0) {
                this.MessageConfromCSS();
                this.$message({
                    message: "确认操作成功",
                    type: "success"
                })
                return
            } else {
                this.$message({
                    message: "保存失败" + addSuccess.m,
                    type: "error"
                })
                return
            }


        },
        //添加接收人
        addUser() {
            this.isselectuser = true;
            this.iscreatemsg = false;
            this.showSelectUser(msglist.msgFormmsg.RUID == null ? false : true);
        },



        //移植选择用户
        getuserType(parentTypeID) { //获取用户分组
            var userType = [];
            if (parentTypeID === null) {
                var con = [{
                    "cn": "PARENT_TYPEID",
                    "cp": "is",
                    "v1": null,
                    "v2": null
                }];
            } else {
                var con = [{
                    "cn": "PARENT_TYPEID",
                    "cp": "=",
                    "v1": parentTypeID,
                    "v2": null
                }];
            }
            var model = GetorDelData("mdb\\get", "SYS_USER_TYPE", con);
            userType = RequestHd(model).d;
            userType.forEach(item => {
                item.name = item.USER_TYPENAME;
                item.children = [];
                item.leaf = false;
                item.id = item.USER_TYPEID;
            });
            return userType;
        },
        //获取用户
        getUsers(userTypeID) {
            var users = [];
            var con = [{
                "cn": "USER_TYPEID",
                "cp": "=",
                "v1": userTypeID,
                "v2": null
            }];
            var model = GetorDelData("mdb\\get", "SYS_USERS", con);
            users = RequestHd(model).d;
            users.forEach(item => {
                item.name = item.USER_NAME;
                item.children = [];
                item.leaf = true;
                item.id = item.USER_ID;
                if (this.isResend) { //转发
                    item.disabled = this.checkUserID.indexOf(item.USER_ID) == -1 ? false : true;
                } else {
                    item.disabled = false;
                }
            });
            return users;
        },
        //设置默认展开树结构
        setTree(parentType) {
            var Usertype = this.getuserType(parentType.USER_TYPEID);
            if (Usertype.length > 0) { //该父级下还有子级，继续展开
                parentType.children = Usertype;
                this.expendNode.push(parentType.USER_TYPEID);
                Usertype.forEach(item => {
                    this.setTree(item);
                })
            } else { //获取人员信息
                parentType.children = this.getUsers(parentType.USER_TYPEID);
            }
        },
        //树节点被选中时触发,获取实时选中的数据点
        treecheck() {
            this.checkUser = this.$refs.equtree.getCheckedNodes(true, false); //只包含叶子节点，不含半选节点

        },
        //点击确定事件
        confirmcheck() {
            //转发事件
            if (this.isResend) {
                this.$confirm('确认【转发】该消息吗？', '确认操作', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    var olduser = []; //原有的接收人员ID
                    this.Receivers.forEach(item => {
                        olduser.push(item.USER_ID);
                    })
                    this.checkUser.forEach(item2 => {
                        if (olduser.indexOf(item2.USER_ID) === -1) { //新添加的转发人员
                            var rx = {
                                PUID: this.msgFormmsg.RUID,
                                USER_ID: item2.USER_ID,
                                ISREVEIVED: "0"
                            };
                            var addMsgData = addData("mdb\\add", "MESSAGE_RECEIVER", rx); //添加
                            var addSuccess = RequestHd(addMsgData);
                            if (addSuccess.s != 0) {
                                this.$message({
                                    message: addSuccess.m,
                                    type: "error"
                                })
                            } else {
                                this.Receivers = this.checkUser;
                                this.hide();
                                this.$message({
                                    type: 'success',
                                    message: '转发成功!'
                                });
                            }
                            msglist.getweitmesgs();
                            this.iscreatemsg = false;
                            this.istoreveived = false;
                            this.getmymsgs();
                            msglist.msgdivheight = '760px';
                        };
                    })

                }).catch(() => {
                    this.hide();
                });

            } else { //新建添加
                this.Receivers = this.checkUser;
                this.hide();
            }

        },
        //显示
        // isResend为false 表示不是转发信息是新建消息添加接收人员
        showSelectUser: function (isResend) {
            this.isResend = isResend;
            this.checkUserID = [];
            if (this.Receivers) { //有选中人员
                //将选中人员所在组展开，选中该人员
                this.Receivers.forEach(item => {
                    /* var node = this.$refs.equtree.getNode(item.USER_ID);
                    console.log(node);
                    if (this.expendNode.indexOf(node.data.USER_TYPEID) == -1) {
                        this.expendNode.push(node.data.USER_TYPEID);
                    } */
                    this.checkUserID.push(item.USER_ID);
                });
            }
            //初始化树结构
            this.Usertypeoptions = [];
            this.expendNode = [];
            this.Usertypeoptions = this.getuserType(null);
            this.Usertypeoptions.forEach(item => {
                this.setTree(item);
            });

            //判断是否有选中的接收人需要二次添加

            this.$nextTick(() => {
                this.$refs.equtree.setCheckedKeys(this.checkUserID, true); //数据请求成功后，设置默认选中节点
            });
            this.isselectuser = true;
            this.iscreatemsg = false;
        },
        //关闭选人员界面
        hide: function () {
            this.isselectuser = false;
            this.iscreatemsg = true;
        },
    },
    filters: {
        UserName: function (userid) {
            if (userid && userid != '' && userid != '0') {
                return loaddata("SYS_USERS", [{
                    "cn": "USER_ID",
                    "cp": "=",
                    "v1": userid,
                    "v2": null
                }]).d.USER_NAME
            } else
                return userid;
        },
        FileTitle: function (filesavename) {
            if (!filesavename)
                return '';
            try {
                return !filesavename ? '' : (filesavename.substring(filesavename.lastIndexOf('@@') >= 0 ? filesavename.lastIndexOf('@@') + 2 : 0))
            } catch (e) {
                return filesavename;
            }
        }
    },
});

var mainpage = new Vue({
    el: "#mainpage",
    data: function () {
        return {
            Allmenus: [],
            msgsNumber: "",
            msg: [],
            hiddenbadge: true,
            showinfodialog: true,
            showchangepwddialog: true,
        }
    },
    methods: {
        //消息部分
        getmsgs() {
            this.msg = [];
            var _cons = [{
                "cn": "USER_ID",
                "cp": "=",
                "v1": top.LogInfor.UserID,
                "v2": null
            },
            {
                "cn": "ISREVEIVED",
                "cp": "=",
                "v1": 0,
                "v2": null
            },
            {
                "cn": "STATUSID",
                "cp": "=",
                "v1": 1,
                "v2": null
            } //已经发送的信息
            ];
            var modeldata = GetorDelData("mdb\\get", "V_MYMESSAGE", _cons);
            this.msg = RequestHd(modeldata);
            this.msgsNumber = this.msg.d ? this.msg.d.length : 0;
        },
        //点击图标查看消息
        Openmsglist() {
            msglist.Setconfig();
            msglist.getmymsgs();
            msglist.openDrawer();
        },
        OpenChangepwdlist() {
            if (mainpage.showchangepwddialog) {
                $('#changePwdIframe').fadeIn();
                $('#loadingDiv').css('display', 'block');
            } else {
                $('#changePwdIframe').fadeOut();
                setTimeout(() => {
                    $('#loadingDiv').css('display', 'none');
                }, 300);
            }
            mainpage.showchangepwddialog = !mainpage.showchangepwddialog;
            changePwd.resetForm('ruleForm');
        },
        TabsOpen_popWin() {
            this.$message({
                showClose: true,
                type: 'warning',
                message: "您打开的窗体太多了，请先关闭部分窗体！！！"
            });
        },
        CloseBtn_popWin() {
            this.$message({
                showClose: true,
                type: 'warning',
                message: "确定当前有可关闭界面！！！"
            });
        },
        errorLog() {
            this.$message({
                showClose: true,
                type: 'error',
                message: "请先登录系统，再进行其他操作！！！"
            });
        },
    }
});

var changePwd = new Vue({
    el: '#changePwdIframe',
    data() {

        var validateOldPass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入原密码'));
            } else {
                callback();
            }
        };
        var validateNewPass = (rule, value, callback) => {
            if (value === '') {
                this.nowStrength = 0;
                callback(new Error('请输入新密码'));
            } else if (value === this.ruleForm.oldPass) {
                callback(new Error('新密码不可与原密码相同！'));
            } else if (value != "" && value != null) {
                var str = this.ruleForm.newPass;
                var num = 0;
                var m1 = /[a-z]/ //匹配小写字母
                var m2 = /[A-Z]/ //匹配大写字母
                var m3 = /[\d]/ //匹配数字
                var m4 = /[^\da-zA-Z]/ //匹配非数字、字母

                if (str.match(m2) == null) callback(new Error("需含有大写字母"));
                if (str.match(m4) == null) callback(new Error("需含有特殊符号"));
                if (str.match(m1) == null) callback(new Error("需含有小写字母"));
                if (str.match(m3) == null) callback(new Error("需含有数字"));
                if (str.match(m1) == null || str.match(m2) == null || str.match(m3) == null || str.match(m4) == null) {
                    this.nowStrength = 0;
                    return null;
                }
                if (str.length < 6 && str.length >= 0) {
                    this.nowStrength = 0;
                    callback(new Error("长度至少需要6位"));
                    return null;
                } else if (str.length >= 6 && str.length <= 10) {
                    this.nowStrength = str.length * 10;
                } else if (str.length > 10) {
                    this.nowStrength = 100
                }
                if (this.ruleForm.checkPass !== '') {
                    this.$refs.ruleForm.validateField('reNewPass');
                }
                callback();

            }
        };
        var validateReNewPass = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('重复密码不能为空'));
            } else if (value !== this.ruleForm.newPass) {
                callback(new Error('两遍新密码不相同！'));
            } else {
                callback();
            }
        };
        return {
            ruleForm: {
                oldPass: '',
                newPass: '',
                reNewPass: ''
            },
            rules: {
                oldPass: [{
                    validator: validateOldPass,
                    trigger: ['blur', 'change']
                }],
                newPass: [{
                    validator: validateNewPass,
                    trigger: ['blur', 'change']
                }],
                reNewPass: [{
                    validator: validateReNewPass,
                    trigger: ['blur', 'change']
                }]
            },
            nowStrength: 0
        };
    },
    methods: {
        customColorMethod(percentage) {
            if (percentage < 40 && percentage >= 0) {
                return '#f56c6c';
            } else if (percentage < 60 && percentage >= 40) {
                return '#e6a23c';
            } else if (percentage < 80 && percentage >= 60) {
                return '#1989fa';
            } else if (percentage >= 80) {
                return '#5cb87a';
            }
        },
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    var _con = [{
                        "cn": "USER_ID",
                        "cp": "=",
                        "v1": top.LogInfor.UserID,
                        "v2": null
                    }];
                    var tempoldmes = loaddata("SYS_USERS", _con);
                    var oldpass = tempoldmes.d ? tempoldmes.d.USER_PWD : "";
                    var _val = {
                        "USER_PWD": this.ruleForm.reNewPass
                    };
                    if (oldpass != this.ruleForm.oldpass) {
                        this.$message.error('原密码不正确！');
                        return false;
                    } else {
                        var postnew = updateMDBData("SYS_USERS", _val, _con);
                        var tempflag = postnew === 0 ? true : false;
                        if (tempflag) {
                            addUserOperLog("在【修改个人密码】页面更改了密码",top.LogInfor.UserName, top.LogInfor.clientip);
                            this.$message({
                                message: '个人密码修改成功，将在3s后返回登录！',
                                type: 'success'
                            });
                            $('#changePwdIframe').fadeOut();
                            setTimeout(() => {
                                $('#loadingDiv').css('display', 'none');
                            }, 300);
                            mainpage.showchangepwddialog = true;
                            setTimeout(() => {
                                this.changelogout();
                            }, 3000);
                            return true;

                        }
                    }
                } else {
                    return false;
                }

            });
        },
        //更改密码后自动登出
        changelogout() {
            var lginoutdata = {
                "t": "logout",
                "i": top.LogInfor.sid,
                "d": {
                    "eid": "",
                    "uid": top.LogInfor.UserID,
                }
            }
            var lginoutD = RequestHd(lginoutdata);
            if (lginoutD.s == 0) {
                sessionStorage.clear();
                window.location.href = "login.html";
            } else {
                this.$message({
                    message: '注销失败请联系管理员！',
                    type: 'error'
                })
                return;
            }
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
        }
    }
});


$('#StartTime').datetimepicker({
    format: 'Y-m-d H:i',
    value: FormatDateTimeBoxMM(new Date().DatePart())
});
$('#EndTime').datetimepicker({
    format: 'Y-m-d H:i',
    value: FormatDateTimeBoxMM(new Date().AddDays(1).DatePart())
});
//2022 04 22 时间自动补零
function AppendZero(para) {
    if (para < 10) {
        return "0" + para;
    } else {
        return para;
    }
}