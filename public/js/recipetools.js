//ksec-recipetool 控件处理类 2018-02-3 11:40--2018-3-25 zhaojiaqing 

var ctrlkey = false;//全局CTL键是否被按下
var shiftkey = false;//全局shift键是否被按下，用于元素选择框模式
var runtime = false;//运行模式
var spos, l_spos, l_npos;//鼠标位置
var l_cspos, l_cnpos;//鼠标位置
var l_cwidth, l_cheight;
var seldiv__ctl;//选择框控件
var linkdot_l__ctl;//左连接锚点控件
var linkdot_r__ctl;//右连接锚点控件
var linkdot_ctl;//连接锚点目标控件
var issel__mode = false;//当前模式是否为选择模式，按下shift键并移动鼠标
var drag__mode = false;
var islink__mode = false;
var alineh = 6;//连接端点圆点的高度件
var idmaxnow = 0;//当前在程序框中的元素id最大值
function RFalse() { return false; }
//拖动连接控件的锚点时，自动捕获需要连接的目标元素，lr=1表示当前拖动的是左连接锚点
function getnew_linkdot_ctl(lr) {
    regetnew_linkdot_ctl();

    var linkdot_lpos = $(linkdot_l__ctl).offset();
    var linkdot_rpos = $(linkdot_r__ctl).offset();
    var linktools = $("#target>.ksec-recipetool[data-type!=14][data-type!="+ (lr=="l"?"8":"7") +"]");
    var linkpos = lr == "l" ? linkdot_lpos : linkdot_rpos;
    $(linktools).removeClass('ksec-recipetoolsel').each(function (k, t) {//通过each循环每个tool
        var tpos = $(t).offset();
        tpos = { left:tpos.left-10,top:tpos.top-10};
        var twidth = $(t).width()+20;
        var theight = $(t).height()+20;
        if (linkpos.left > tpos.left && linkpos.left < (tpos.left + twidth) && linkpos.top > tpos.top && linkpos.top < (tpos.top + theight)) {
            //alert("DFSFDF");
            $(t).addClass('ksec-recipetoolsel');
            return false;
        }
    });
}
//拖动连接控件的锚点时，自动重新绘制连接控件
function regetnew_linkdot_ctl()
{
    var linkdot_lpos = $(linkdot_l__ctl).offset();
    var linkdot_rpos = $(linkdot_r__ctl).offset();
    //var border = parseInt($(linkdot_ctl).css("border-left-width"));
    $(linkdot_ctl).offset({ left: (linkdot_lpos.left < linkdot_rpos.left ? linkdot_lpos.left : linkdot_rpos.left), top: linkdot_lpos.top < linkdot_rpos.top ? linkdot_lpos.top : linkdot_rpos.top });
    $(linkdot_ctl).width(Math.abs(linkdot_lpos.left - linkdot_rpos.left) + 2*alineh);
    $(linkdot_ctl).height(Math.abs(linkdot_lpos.top - linkdot_rpos.top) + 2 * alineh);
    if (linkdot_lpos.left < linkdot_rpos.left && linkdot_lpos.top < linkdot_rpos.top){
        $(linkdot_ctl).attr("data-linkpos", "1");
       // $(linkdot_ctl).attr("data-linktype", "1");//垂直控制流连接
    }
    if (linkdot_lpos.left > linkdot_rpos.left && linkdot_lpos.top < linkdot_rpos.top){
        $(linkdot_ctl).attr("data-linkpos", "2");
       // $(linkdot_ctl).attr("data-linktype", "1");//垂直控制流连接
    }
    if (linkdot_lpos.left > linkdot_rpos.left && linkdot_lpos.top > linkdot_rpos.top) {
        $(linkdot_ctl).attr("data-linkpos", "3");
       // if($(linkdot_ctl).attr("data-linktype")=="1")
        //    $(linkdot_ctl).attr("data-linktype", "3");//水平同步连接
    }
    if (linkdot_lpos.left < linkdot_rpos.left && linkdot_lpos.top > linkdot_rpos.top) {
        $(linkdot_ctl).attr("data-linkpos", "4");
       // if ($(linkdot_ctl).attr("data-linktype") == "1")
        //    $(linkdot_ctl).attr("data-linktype", "3");//水平同步连接
    }
    redraw_recipetool(linkdot_ctl);
}
//改变连接控件的连接源
function link_fromctl(ctl) {
    var linkin_type = $(ctl).attr("data-type");//连接源的控件类型
    var linkout_type = $(linkdot_ctl).attr("data-linkout") == "" ? "" : $("#" + $(linkdot_ctl).attr("data-linkout")).attr("data-type");//连接目标的控件类型
    $(linkdot_ctl).attr("data-linkin", '');
    var linkdot_ctltype=$(linkdot_ctl).attr("data-linktype");
    if ((linkdot_ctltype == "2" || linkdot_ctltype == "3") && linkin_type != 6 && linkin_type != 4 && linkin_type != 3) {
        $.messager.alert('Warning', "该同步或传送连接不支持目标元素类型！", "error");
        return;
    }
    if (linkdot_ctltype == "1" && linkin_type != 11 && linkin_type != 9 && $("#target>.ksec-recipetool[data-type=14][data-linktype='1'][data-linkin ='" + $(ctl).attr("id") + "']").length > 0) {//目标元素已经存在连接输出 && $(linkdot_ctl).attr("id") != $(ctl).attr("data-linkout")
        $.messager.alert('Warning', "目标元素已经存在连接输出，请先解除该元素的输出连接关系！", "error");
        return;
    }
    //做基本的连接错误判断，两个连接元素的类型不能有冲突
    if (!check_link(linkin_type, linkout_type))
    {
        $.messager.alert('Warning', "两个连接元素不匹配，无法进行连接！", "error");
        return;
    }
    //绑定连接关系
    //$(ctl).data("linkout", $(linkdot_ctl).attr("id"));
    $(linkdot_ctl).attr("data-linkin", $(ctl).attr("id"));
   // alert($(linkdot_ctl).attr("data-linkin") + $(linkdot_ctl).attr("data-linkout"));
    //找连接目标的(连出）锚点后重新绘制连接线条控件
    $(linkdot_l__ctl).offset(get_ctl_linkoutpos(ctl, $(linkdot_l__ctl).offset()));
    regetnew_linkdot_ctl();
    hidelinkdot();
}
//得到一个控件的连接输出锚点，默认是控件bottom线中点
function get_ctl_linkoutpos(ctl, linkdotpos) {
    linkout_type = $(ctl).attr("data-type");
    var newpos = $(ctl).offset();
    var linkdot_ctltype = $(linkdot_ctl).attr("data-linktype");
    if ((linkdot_ctltype == "2" || linkdot_ctltype == "3")) {
        newpos = { left: linkdotpos.left > (newpos.left + $(ctl).width() / 2) ? newpos.left + $(ctl).width() : newpos.left - 2 * alineh, top: newpos.top + $(ctl).height() / 2 - alineh };
    }
    else {
        if (linkout_type == 11 || linkout_type == 9)
            newpos = { left: linkdotpos.left, top: newpos.top + $(ctl).height() - 0.5 * alineh };
        else
            newpos = { left: newpos.left + $(ctl).width() / 2 - alineh, top: newpos.top + $(ctl).height() - alineh };
    }
    return newpos;
}
//得到一个控件的连接输入锚点，默认是控件top线中点
function get_ctl_linkinpos(ctl, linkdotpos) {
    linkin_type = $(ctl).attr("data-type");
    var newpos = $(ctl).offset();

    var linkdot_ctltype = $(linkdot_ctl).attr("data-linktype");
    if ((linkdot_ctltype == "2" || linkdot_ctltype == "3"))
        newpos = { left: linkdotpos.left > (newpos.left + $(ctl).width() / 2) ? newpos.left + $(ctl).width() : newpos.left - 2 * alineh, top: newpos.top + $(ctl).height() / 2 - alineh };
    else {
        if (linkin_type == 12 || linkin_type == 10)
            newpos = { left: linkdotpos.left, top: newpos.top - 2 * alineh };
        else
            newpos = { left: newpos.left + $(ctl).width() / 2 - alineh, top: newpos.top - 1.5 * alineh };
    }
    return newpos;
}

//移动目标控件元素时，自动重新设置与之连接的连出、连入的连接控件大小、位置
//ctl 被移动了的控件元素，oldpos移动前的ctl位置
function regetnew_ctls_link(oldpos,ctl)
{
    //控件的新位置
    var newpos = ctl.offset();
    var xoff = newpos.left - oldpos.left;//水平方向的移动量
    var yoff = newpos.top - oldpos.top;//垂直方向的移动量
    var ctltype = $(ctl).attr("data-type");//被移动控件的类型 start、allocation、condition、operation.....
    var linkintools = $("#target>.ksec-recipetool[data-type=14][data-linkout ='" + $(ctl).attr("id") + "']");//连接进该控件的link
    var linkouttools = $("#target>.ksec-recipetool[data-type=14][data-linkin ='" + $(ctl).attr("id") + "']");//该控件连接出的link
    $(linkintools).each(function (i, t) {
        var linkpos = $(t).attr("data-linkpos");//连接的位置1-3，2-4，3-1，4-2
        var linktype = $(t).attr("data-linktype");//连接的类型1-水平、垂直控制流连接，2-水平传送连接，3-水平同步连接
        if (xoff != 0) {//水平方向被移动了
            if (linkpos == 1 || linkpos == 4) {//连接起点在左侧，连接控件的位置不变，宽度增加或减小
                var newwidth = $(t).width() + xoff;//默认需要改变的新的宽度
                if (xoff < 0 && newwidth < 2 * alineh) {//宽度减小，减小过量到大于控件的最小宽度
                    var overx = Math.abs(xoff) - ($(t).width() - 2 * alineh);//过量的度
                    $(t).width(2 * alineh + overx);
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left - overx, top: newpos.top });//调整位置
                    $(t).attr("data-linkpos", linkpos == 1 ? 2 : 3);//改变连接点为反向
                }
                else
                    $(t).width(newwidth);//取默认需要改变的目标值
            }
            else {//连接起点在右侧，连接控件的位置跟着变，宽度减小或增加
                var newwidth = $(t).width() - xoff;//默认需要改变的新的宽度
                if (xoff > 0 && newwidth < 2 * alineh) {//宽度减小，减小过量到大于控件的最小宽度
                    var overx = Math.abs(xoff) - ($(t).width() - 2 * alineh);//过量的度
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left + ($(t).width() - 2 * alineh), top: newpos.top });//调整位置
                    $(t).width(2 * alineh + overx);
                    $(t).attr("data-linkpos", linkpos == 2 ? 1 : 4);//改变连接点为反向
                }
                else {
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left + xoff, top: newpos.top });
                    $(t).width(newwidth);//取默认需要改变的目标值
                }
            }
        }

        if (yoff != 0) {//垂直方向被移动了
            if (linkpos == 1 || linkpos == 2) {//连接起点在上方，高度增加或减小
                var newheight = $(t).height() + yoff;//默认需要改变的新的高度
                if (yoff < 0 && newheight < 2 * alineh) {//高度减小，减小过量到大于控件的最小高度
                    var overx = Math.abs(yoff) - ($(t).height() - 2 * alineh);//过量的度
                    $(t).height(2 * alineh + overx);
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left, top: newpos.top - overx });//调整位置
                    $(t).attr("data-linkpos", linkpos == 1 ? 4 : 3);//改变连接点为反向
                }
                else
                    $(t).height(newheight);//取默认需要改变的目标值
            }
            else {//连接起点在下方，高度减小或增加
                var newheight = $(t).height() - yoff;//默认需要改变的新的高度
                if (yoff > 0 && newheight < 2 * alineh) {//宽度减小，减小过量到大于控件的最小高度
                    var overx = Math.abs(yoff) - ($(t).height() - 2 * alineh);//过量的度
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left, top: newpos.top + ($(t).height() - 2 * alineh) });//调整位置
                    $(t).height(2 * alineh + overx);
                    $(t).attr("data-linkpos", linkpos == 4 ? 1 : 2);//改变连接点为反向
                }
                else {
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left, top: newpos.top + yoff });
                    $(t).height(newheight);//取默认需要改变的目标值
                }
            }
        }
        redraw_recipetool(t);
    });

    $(linkouttools).each(function (i, t) {
        var linkpos = $(t).attr("data-linkpos");//连接的位置1-3，2-4，3-1，4-2
        var linktype = $(t).attr("data-linktype");//连接的类型1-水平、垂直控制流连接，2-水平传送连接，3-水平同步连接
        if (xoff != 0) {//水平方向被移动了
            if (linkpos == 2 || linkpos == 3) {//连接起点在右侧，连接控件的位置不变，宽度增加或减小
                var newwidth = $(t).width() + xoff;//默认需要改变的新的宽度
                if (xoff < 0 && newwidth < 2 * alineh) {//宽度减小，减小过量到大于控件的最小宽度
                    var overx = Math.abs(xoff) - ($(t).width() - 2 * alineh);//过量的度
                    $(t).width(2 * alineh + overx);
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left - overx, top: newpos.top });//调整位置
                    $(t).attr("data-linkpos", linkpos == 2 ? 1 : 4);//改变连接点为反向
                }
                else
                    $(t).width(newwidth);//取默认需要改变的目标值
            }
            else {//连接起点在左侧，连接控件的位置跟着变，宽度减小或增加
                var newwidth = $(t).width() - xoff;//默认需要改变的新的宽度
                if (xoff > 0 && newwidth < 2 * alineh) {//宽度减小，减小过量到大于控件的最小宽度
                    var overx = Math.abs(xoff) - ($(t).width() - 2 * alineh);//过量的度
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left + ($(t).width() - 2 * alineh), top: newpos.top });//调整位置
                    $(t).width(2 * alineh + overx);
                    $(t).attr("data-linkpos", linkpos == 1 ? 2 : 3);//改变连接点为反向
                }
                else {
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left + xoff, top: newpos.top });
                    $(t).width(newwidth);//取默认需要改变的目标值
                }
            }
        }

        if (yoff != 0) {//垂直方向被移动了
            if (linkpos == 3 || linkpos == 4) {//连接起点在下方，高度增加或减小
                var newheight = $(t).height() + yoff;//默认需要改变的新的高度
                if (yoff < 0 && newheight < 2 * alineh) {//高度减小，减小过量到大于控件的最小高度
                    var overx = Math.abs(yoff) - ($(t).height() - 2 * alineh);//过量的度
                    $(t).height(2 * alineh + overx);
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left, top: newpos.top - overx });//调整位置
                    $(t).attr("data-linkpos", linkpos == 3 ? 2 : 1);//改变连接点为反向
                }
                else
                    $(t).height(newheight);//取默认需要改变的目标值
            }
            else {//连接起点在上方，高度减小或增加
                var newheight = $(t).height() - yoff;//默认需要改变的新的高度
                if (yoff > 0 && newheight < 2 * alineh) {//宽度减小，减小过量到大于控件的最小高度
                    var overx = Math.abs(yoff) - ($(t).height() - 2 * alineh);//过量的度
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left, top: newpos.top + ($(t).height() - 2 * alineh) });//调整位置
                    $(t).height(2 * alineh + overx);
                    $(t).attr("data-linkpos", linkpos == 1 ? 4 : 3);//改变连接点为反向
                }
                else {
                    newpos = $(t).offset();
                    $(t).offset({ left: newpos.left, top: newpos.top + yoff });
                    $(t).height(newheight);//取默认需要改变的目标值
                }
            }
        }
        redraw_recipetool(t);
    });
}
//改变连接控件的连接目标
function link_toctl(ctl) {
    var linkin_type = $(linkdot_ctl).attr("data-linkin") == "" ? "" : $("#" + $(linkdot_ctl).attr("data-linkin")).attr("data-type");//连接源的控件类型
    var linkout_type = $(ctl).attr("data-type");
    $(linkdot_ctl).attr("data-linkout", '');

    var linkdot_ctltype = $(linkdot_ctl).attr("data-linktype");
    if ((linkdot_ctltype == "2" || linkdot_ctltype == "3") && linkout_type != 6 && linkout_type != 4 && linkout_type != 3) {
        $.messager.alert('Warning', "该同步或传送连接不支持目标元素类型！", "error");
        return;
    }
    if (linkdot_ctltype == "1" && linkout_type != 12 && linkout_type != 10 && $("#target>.ksec-recipetool[data-type=14][data-linktype='1'][data-linkout ='" + $(ctl).attr("id") + "']").length > 0) {//目标元素已经存在连接输入
        $.messager.alert('Warning', "目标元素已经存在连接输入，请先解除该元素的输入连接关系！", "error");
        return;
    }
    //做基本的连接错误判断，两个连接元素的类型不能有冲突
    if (!check_link(linkin_type, linkout_type)) {
        $.messager.alert('Warning', "两个连接元素不匹配，无法进行连接！", "error");
        return;
    }
    //绑定连接关系
   // $(ctl).data("linkin", $(linkdot_ctl).attr("id"));
    $(linkdot_ctl).attr("data-linkout", $(ctl).attr("id"));
    //alert($(linkdot_ctl).attr("data-linkout"));
    //找连接目标的(连入）锚点后重新绘制连接线条控件
    $(linkdot_r__ctl).offset(get_ctl_linkinpos(ctl, $(linkdot_r__ctl).offset()));
    regetnew_linkdot_ctl();
    hidelinkdot();
}
function check_link(linkin_type, linkout_type) {
    //if (linkin_type != "" && linkout_type != "" && (linkin_type.indexOf("start") >= 0 && linkout_type.indexOf("end") >= 0))//不允许开始即结束
    //    return false;
    //else
        return true;
}
function init_recipe(_runtime) {
    runtime=_runtime;
    if (!runtime) {
        $("<div id='seldiv' style=\"background: rgba(0,0,0,0.1);opacity:0.5;border:3px dotted #1bbeef;border-radius:5px;position:absolute;left:0px;top:0px;\"/>").appendTo($('#target'));
        linkdot_l__ctl = $("<div id='linkdot_l__ctl' style=\"background: lime;z-index:1000;border:1px dotted darkgreen;border-radius:10px;position:absolute;left:10px;top:10px;\" title='link from'/>").width(alineh*2).height(alineh*2).appendTo($('#target')).draggable(
            {
                onStartDrag: function () {
                    $("#target>.ksec-recipetoolsel").removeClass("ksec-recipetoolsel");
                    islink__mode = true;
                },
                onDrag: function () {
                    getnew_linkdot_ctl("l");
                },
                onEndDrag: function () {
                    islink__mode = false;
                    var targetx = $("#target>.ksec-recipetoolsel[data-type!=14]").removeClass("ksec-recipetoolsel");
                    if (targetx.length > 0)
                        link_fromctl(targetx[0]);
                    else {
                        //解除连接关系绑定
                       // $(linkdot_ctl).attr("data-linkin");//本连接控件解绑
                        $(linkdot_ctl).attr("data-linkin", "");//本连接控件解绑
                       // $("#target>.ksec-recipetoolsel[data-type!='link']")//连接到本连接控件的目标控件解绑
                        //$(ctl).data("linkout", $(linkdot_ctl).attr("id"));
                        //$(linkdot_ctl).data("linkin", $(ctl).attr("id"));
                    }
                }
            }).tooltip({ position: "right" }).hide();
        linkdot_r__ctl = $("<div id='linkdot_r__ctl' style=\"background: lime;z-index:1000;border:1px dotted darkgreen;border-radius:10px;position:absolute;left:10px;top:10px;\" title='link to'/>").width(alineh * 2).height(alineh * 2).appendTo($('#target')).draggable(
            {
                onStartDrag: function () {
                    $("#target>.ksec-recipetoolsel").removeClass("ksec-recipetoolsel");
                    islink__mode = true;
                },
                onDrag: function () {
                    getnew_linkdot_ctl("r");
                },
                onEndDrag: function () {
                    islink__mode = false;
                    var targetx = $("#target>.ksec-recipetoolsel[data-type!=14]").removeClass("ksec-recipetoolsel");;
                    if (targetx.length > 0)
                        link_toctl(targetx[0]);
                    else
                    {
                        //解除连接关系绑定
                        $(linkdot_ctl).attr("data-linkout", "")
                    }
                }
            }).tooltip({ position: "right" }).hide();
    }
    $('.ksec-recipetool').each(function (k, t) {//通过each循环每个tool
        init_recipetool(t);
    });
    if (runtime)
        return;
    $(document).keydown(function (e) {
        var stepfast = 5;//5个像素一步
        var step = 1;//1个像素
        switch (e.keyCode) {
            case (37)://左
                $("#target>.ksec-recipetoolsel[data-type!=14]").each(function (k, t) {
                    regetnew_ctls_link($(t).offset(),$(t).offset(function (n, c) { return { left: c.left - (37 == e.keyCode && e.shiftKey ? step : stepfast), top: c.top }; }));
                });
                break;
            case (39)://右
                $("#target>.ksec-recipetoolsel[data-type!=14]").each(function (k, t) {
                    regetnew_ctls_link($(t).offset(), $(t).offset(function (n, c) { return { left: c.left + (39 == e.keyCode && e.shiftKey ? step : stepfast), top: c.top }; }));
                });
                break;
            case (38)://上
                $("#target>.ksec-recipetoolsel[data-type!=14]").each(function (k, t) {
                    regetnew_ctls_link($(t).offset(), $(t).offset(function (n, c) { return { left: c.left, top: c.top - (38 == e.keyCode && e.shiftKey ? step : stepfast) }; }));
                });
                break;
            case (40)://下
                $("#target>.ksec-recipetoolsel[data-type!=14]").each(function (k, t) {
                    regetnew_ctls_link($(t).offset(), $(t).offset(function (n, c) { return { left: c.left, top: c.top + (40 == e.keyCode && e.shiftKey ? step : stepfast) }; }));
                });
                break;
            default:
                ctrlkey = e.ctrlKey;
                shiftkey = e.shiftKey;
        }
    });
    $(document).keyup(function (e) {
        ctrlkey = false;
        shiftkey = false;
    });
    $(document).mouseup(function () {
        if (issel__mode) {
            $(seldiv__ctl).offset({ left: 0, top: 0 });
            $(seldiv__ctl).hide();
        }
        issel__mode = false;

        $(document).unbind("selectstart", RFalse);
    });
    $('#target').mousedown(function (event) {
        $(document).bind("selectstart", RFalse);
        hidelinkdot();
        if ($('.ksec-recipetoolsel').length>0)//按住shift键，并且不要选中任何元素
            return;
        spos = { left: event.pageX, top: event.pageY };//记录下鼠标按下的位置
        if(seldiv__ctl==null)
            seldiv__ctl = $('#seldiv');
        $(seldiv__ctl).offset({ left: event.pageX, top: event.pageY });
        $(seldiv__ctl).width(0);
        $(seldiv__ctl).height(0);
        $(seldiv__ctl).show();
        issel__mode = true;
        $('#propertygrid').propertygrid('loadData', []);
    });
    $('#target').mousemove(function (e) {
        if (!issel__mode)//按住shift键，并且不要选中任何元素
            return;
        var nw = e.pageX - spos.left;
        var nh = e.pageY - spos.top;
        var npos = { left: nw > 0 ? spos.left : e.pageX, top: nh>0 ? spos.top : e.pageY };
        $(seldiv__ctl).offset(npos);
        $(seldiv__ctl).width(Math.abs(nw));
        $(seldiv__ctl).height(Math.abs(nh));
        var xpos;
        var xw;
        var xh;
        $(".ksec-recipetool").each(function (k, t) {//通过each循环每个没有被选中的tool
            if (!$(t).data("isrecipetool")) {
                xpos = $(t).offset();
                xw = $(t).width();
                xh = $(t).height();
                if ((xpos.left > npos.left && xpos.left < npos.left + Math.abs(nw) && xpos.top > npos.top && xpos.top < npos.top + Math.abs(nh)) || (xpos.left + xw > npos.left && xpos.left + xw < npos.left + Math.abs(nw) && xpos.top + xh > npos.top && xpos.top + xh < npos.top + Math.abs(nh)) || (xpos.left > npos.left && xpos.left < npos.left + Math.abs(nw) && xpos.top + xh > npos.top && xpos.top + xh < npos.top + Math.abs(nh)) || (xpos.left + xw > npos.left && xpos.left + xw < npos.left + Math.abs(nw) && xpos.top > npos.top && xpos.top < npos.top + Math.abs(nh)))
                    $(t).addClass('ksec-recipetoolsel');
                else
                    $(t).removeClass('ksec-recipetoolsel');
            }
        });
        if ($('.ksec-recipetoolsel').length > 0)
            drag__mode = true;
    });


    $('#propertygrid').propertygrid('loadData', []);
    $('#propertygrid').propertygrid({ onAfterEdit: onPropertyEdit });
 }
function init_recipetool(t) {
    $(t).html("");
    var $c=$("<canvas>not support canvas. </canvas>").appendTo($(t));
    if (!runtime && !$(t).data("isrecipetool")) {
        $c.mousedown(function () { toggletoolsel($(this).parent()); return $(t).attr("data-type") == 14 ? false : true; });
        var len = $(t).attr("id").length;
        var tid = parseInt($(t).attr("id").slice(len - 3, len));
        if (tid > idmaxnow)
            idmaxnow = tid;
    }
    if (!runtime && !$(t).data("isrecipetool") && $(t).attr("data-type") != 14) {
        
        //alert($(t).attr("id") + "    " + $(t).attr("id").slice(len - 3, len));
        $(t).draggable({
            onStartDrag: function () {
                spos = $(this).offset();
            },
            onDrag: function () {
                var npos = $(this).offset();
                $("#target>.ksec-recipetoolsel[data-type!=14]").each(function (k, t) {
                    regetnew_ctls_link($(t).offset(), $(t).offset(function (n, c) { return { left: c.left + npos.left - spos.left, top: c.top + npos.top - spos.top }; }));
                });
                spos = npos;
            },
            onEndDrag: function () {
                $(this).addClass('ksec-recipetoolsel');
            }
        }).resizable({
            onResize: function (e) {
                redraw_recipetool(this);
                return true;
            }
        });
    }
    if (!$(t).data("isrecipetool") && $(t).attr("data-type") == 14) {
        $(t).css("border", "0px");
        $(t).css("background", "transparent");
        $(t).data("showtext",false);
    }
    redraw_recipetool(t);
}
var mod_item;//当前正在更改属性的元素
function toggletoolsel(item) {
    mod_item = null;
    hidelinkdot();
    if (!$(item).hasClass("ksec-recipetoolsel")) {
        if (!ctrlkey && !shiftkey) //如果没有按下ctrl键，把其它选中的所有元素取消
        {
            $('.ksec-recipetool').removeClass('ksec-recipetoolsel');
            rowsDis[0].value = $(item).attr("id");//ID
            rowsDis[1].value = $(item).attr("data-Text");//Text
            rowsDis[2].value = $(item).attr("data-ShowText");//ShowText
            rowsDis[3].value = $(item).attr("data-ToolTip");//data-ToolTip
            switch (parseInt($(item).attr("data-type"))) {
                case (6)://allocation
                    $('#propertygrid').propertygrid('loadData', rowsDis.concat(rowsallocation));
                    break;
                case (13):// condition
                    $('#propertygrid').propertygrid('loadData', rowsDis.concat(rowscondition));
                    break;
                case (4):// operation
                    $('#propertygrid').propertygrid('loadData', rowsDis.concat(rowsoperation));
                    break;
                case (3)://Unit Procedure
                    rowsunit[0].value = $(item).attr("data-DerivedRE");
                    rowsunit[1].value = $(item).attr("data-DerivedVersion");
                    rowsunit[2].value = $(item).attr("data-RE_Function");
                    rowsunit[3].value = $(item).attr("data-Priority");
                    rowsunit[4].value = $(item).attr("data-ProcessUnit");
                    rowsunit[4].editor.options.data =cur_cellobj.Child_BXT_EquipElement;
                    $('#propertygrid').propertygrid('loadData', rowsDis.concat(rowsunit));


                    break;
                default://start end start branch end branch start parallel end parallel link
                    $('#propertygrid').propertygrid('loadData', rowsDis);
            }
            mod_item = item;
        }
        else
            $('#propertygrid').propertygrid('loadData', []);

        $(item).addClass('ksec-recipetoolsel');
        if (!runtime && $(item).attr("data-type") == 14 && $('.ksec-recipetoolsel').length == 1)
            showlinkdot(item);
        drag__mode = false;
    }
}
function showlinkdot(linkx) {
    $(linkdot_l__ctl).show(); $(linkdot_r__ctl).show();
    var offsetx = $(linkx).offset();
    var linkpos = $(linkx).attr("data-linkpos");
    var border = parseInt($(linkx).css("border-left-width"));
    var p1 = { left: offsetx.left + border, top: offsetx.top};
    var p2 = { left: offsetx.left + $(linkx).width() - alineh*2, top: p1.top };
    var p3 = { left: p2.left, top: offsetx.top + $(linkx).height() - alineh*2};
    var p4 = { left: p1.left, top: p3.top};
    switch (linkpos) {
        case ("2"):
            $(linkdot_l__ctl).offset(p2);
            $(linkdot_r__ctl).offset(p4);
            break;
        case ("3"):
            $(linkdot_l__ctl).offset(p3);
            $(linkdot_r__ctl).offset(p1);
            break;
        case ("4"):
            $(linkdot_l__ctl).offset(p4);
            $(linkdot_r__ctl).offset(p2);
            break;
        default:
            $(linkdot_l__ctl).offset(p1);
            $(linkdot_r__ctl).offset(p3);
    }
    linkdot_ctl = linkx;
}
function hidelinkdot() {
    $(linkdot_l__ctl).hide(); $(linkdot_r__ctl).hide();
}
function redraw_recipetool(toolx)//重绘控
{
    if ($(toolx).attr("data-ToolTip") != null && $(toolx).attr("data-ToolTip") != "") {
        $(toolx).tooltip({
            position: "right", content: $(toolx).attr("data-ToolTip")
        });
    }
    var $tCanvas = $($(toolx).children("canvas")[0]);
    var w = $(toolx).width();
    var h = $(toolx).height();
    var lw = $(toolx).data("linew");//线宽
    var typex = $(toolx).attr("data-type");
    var linecolor = $(toolx).data("linecolor");
    var acolor = $(toolx).data("acolor");//连接端点的圆点颜色
    $tCanvas.width(w);
    $tCanvas.height(h);
    $tCanvas.attr("width", w);
    $tCanvas.attr("height", h);
    $tCanvas.clearCanvas();

    var textx = $(toolx).attr("data-Text");
    var th = h / 2;// title标签的垂直位置
    //h = h;
    switch (parseInt(typex)) {
        case (7):
            th = h / 3;// title标签的垂直位置
            $tCanvas.drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                closed: true,
                x1: lw, y1: lw,
                x2: w - lw, y2: lw,
                x3: w / 2, y3: h - alineh
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: h - alineh / 2,
                width: alineh - 1, height: alineh - 1
            });
            break;
        case (6):

            $tCanvas.drawEllipse({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                x: w / 2, y: h / 2,
                width: w - 2 * lw, height: h - 2 * alineh
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: alineh / 2,
                width: alineh - 1, height: alineh - 1
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: h - alineh / 2,
                width: alineh - 1, height: alineh - 1
            });
            break;
        case (13):
            $tCanvas.drawPath({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                p1: {
                    type: 'line',
                    x1: lw / 2, y1: alineh,
                    x2: w - lw / 2, y2: alineh
                },
                p2: {
                    type: 'line',
                    x1: lw / 2, y1: h - alineh,
                    x2: w - lw / 2, y2: h - alineh
                }
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: alineh / 2,
                width: alineh - 1, height: alineh - 1
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: h - alineh / 2,
                width: alineh - 1, height: alineh - 1
            });
            break;
        case (3):
            $tCanvas.drawPath({
                strokeStyle: linecolor,
                strokeWidth: lw,
                rounded: true,
                p1: {
                    type: 'line',
                    x1: w / 4, y1: alineh,
                    x2: 0, y2: (2 * h / 5)
                },
                p2: {
                    type: 'line',
                    x1: w - w / 4, y1: alineh,
                    x2: w, y2: (2 * h / 5)
                },
                p3: {
                type: 'line',
                x1: w - w / 4, y1: h - alineh,
                x2: w, y2: (h - 2 * h / 5)
            }
            }).drawRect({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                x: w / 2, y: h / 2,
                width: w - lw, height: h - 2 * alineh,
                cornerRadius: lw
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: alineh / 2,
                width: alineh - 1, height: alineh - 1
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: h - alineh / 2,
                width: alineh - 1, height: alineh - 1
            });
            break;
        case (4):
            $tCanvas.drawPath({
                strokeStyle: linecolor,
                strokeWidth: lw,
                rounded: true,
                p1: {
                    type: 'line',
                    x1: w / 4, y1: alineh,
                    x2: 0, y2: (2 * h / 5)
                },
                p2: {
                    type: 'line',
                    x1: w - w / 4, y1: alineh,
                    x2: w, y2: (2 * h / 5)
                }
            }).drawRect({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                x: w / 2, y: h / 2,
                width: w - lw, height: h - 2 * alineh,
                cornerRadius: lw
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: alineh / 2,
                width: alineh - 1, height: alineh - 1
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: h - alineh / 2,
                width: alineh - 1, height: alineh - 1
            });
            break;
        case (11):
            $tCanvas.drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                x1: lw, y1: h - lw,
                x2: w - lw, y2: h - lw
            }).drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                x1: w / 2, y1: alineh,
                x2: w / 2, y2: h
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: alineh / 2,
                width: alineh - 1, height: alineh - 1
            });
            break;
        case (12):
            $tCanvas.drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                x1: lw, y1: lw,
                x2: w - lw, y2: lw
            }).drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                x1: w / 2, y1: 0,
                x2: w / 2, y2: h - lw / 2
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: h - alineh / 2,
                width: alineh - 1, height: alineh - 1
            });
            break;
        case (9):
            th = h / 2;
            $tCanvas.drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                x1: lw, y1: h - lw,
                x2: w - lw, y2: h - lw
            }).drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                x1: lw, y1: alineh,
                x2: w - lw, y2: alineh
            }).drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                x1: w / 2, y1: lw / 2,
                x2: w / 2, y2: alineh
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: alineh / 2,
                width: alineh - 1, height: alineh - 1
            });
            break;
        case (10):
            th = h / 2 - alineh / 2;
            $tCanvas.drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                x1: lw, y1: lw,
                x2: w - lw, y2: lw
            }).drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                x1: lw, y1: h - alineh,
                x2: w - lw, y2: h - alineh
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: h - alineh / 2,
                width: alineh - 1, height: alineh - 1
            });
            break;
        case (8):
            th = 2 * h / 3;
            $tCanvas.drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw * 2,
                rounded: true,
                closed: true,
                x1: w / 2, y1: alineh,
                x2: lw, y2: h - lw,
                x3: w - lw, y3: h - lw
            }).drawLine({
                strokeStyle: linecolor,
                strokeWidth: lw,
                rounded: true,
                x1: w / 2, y1: alineh,
                x2: w / 2, y2: lw / 2
            }).drawEllipse({
                fillStyle: acolor,
                strokeStyle: linecolor,
                strokeWidth: 1,
                x: w / 2, y: alineh / 2,
                width: alineh - 1, height: alineh - 1
            });
            break;
        case (14):
            th -= 2 * lw + alineh;// title标签的垂直位置
            if ($(toolx).attr("data-linktype") == "1") {//水平垂直控制流连接
                switch ($(toolx).attr("data-linkpos")) {
                    case ("2"):
                        $tCanvas.drawLine({
                            strokeStyle: linecolor,
                            strokeWidth: lw * 2,
                            rounded: true,
                            x1: w - alineh, y1: alineh,
                            x2: w - alineh, y2: (h) / 2,
                            x3: alineh, y3: (h) / 2,
                            x4: alineh, y4: h - alineh
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: w - alineh, y: 0,
                            radius: alineh,
                            start: 90, end: 270
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: alineh, y: h - alineh,
                            radius: alineh,
                            start: 90, end: 270
                        });
                        break;
                    case ("3"):
                        $tCanvas.drawLine({
                            strokeStyle: linecolor,
                            strokeWidth: lw * 2,
                            rounded: true,
                            x1: w - alineh, y1: h - alineh,
                            x2: w / 2, y2: h - alineh,
                            x3: w / 2, y3: alineh,
                            x4: alineh, y4: alineh
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: alineh, y: alineh,
                            radius: alineh,
                            start: 180, end: 360
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: w, y: h - alineh,
                            radius: alineh,
                            start: 180, end: 360
                        });
                        break;
                    case ("4"):
                        $tCanvas.drawLine({
                            strokeStyle: linecolor,
                            strokeWidth: lw * 2,
                            rounded: true,
                            x1: alineh, y1: h - alineh,
                            x2: w / 2, y2: h - alineh,
                            x3: w / 2, y3: alineh,
                            x4: w - alineh, y4: alineh
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: 0, y: h - alineh,
                            radius: alineh,
                            start: 0, end: 180
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: w - alineh, y: alineh,
                            radius: alineh,
                            start: 0, end: 180
                        });
                        break;
                    default:
                        $tCanvas.drawLine({
                            strokeStyle: linecolor,
                            strokeWidth: lw * 2,
                            rounded: true,
                            x1: alineh, y1: alineh,
                            x2: alineh, y2: (h) / 2,
                            x3: w - alineh, y3: (h) / 2,
                            x4: w - alineh, y4: h - alineh
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: alineh, y: 0,
                            radius: alineh,
                            start: 90, end: 270
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: w - alineh, y: h - alineh,
                            radius: alineh,
                            start: 90, end: 270
                        });
                }
            }
            else {//水平同步或传送连接
                switch ($(toolx).attr("data-linkpos")) {
                    case ("2"):
                        $tCanvas.drawLine({
                            strokeStyle: linecolor,
                            strokeWidth: lw,
                            strokeDash: [3, 5],
                            rounded: true,
                            x1: w - alineh, y1: alineh,
                            x2: w / 2, y2: alineh,
                            x3: w / 2, y3: h - alineh,
                            x4: alineh, y4: h - alineh
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: w, y: alineh,
                            radius: alineh,
                            start: -180, end: 0
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: alineh, y: h - alineh,
                            radius: alineh,
                            start: -180, end: 0
                        }).drawText({
                            fillStyle: $(toolx).css("color"),
                            strokeWidth: lw,
                            x: w - 5 * alineh, y: alineh,
                            fontSize: $(toolx).css("font-size"),
                            fontFamily: $(toolx).css("font-family"),
                            text: $(toolx).attr("data-linktype") == "2" ? "TR" : "SYS"
                        }).drawText({
                            fillStyle: $(toolx).css("color"),
                            strokeWidth: lw,
                            x: 4 * alineh, y: h - alineh,
                            fontSize: $(toolx).css("font-size"),
                            fontFamily: $(toolx).css("font-family"),
                            text: $(toolx).attr("data-linktype") == "2" ? "TR" : "SYS"
                        });
                        break;
                    case ("3"):
                        $tCanvas.drawLine({
                            strokeStyle: linecolor,
                            strokeWidth: lw,
                            strokeDash: [3, 5],
                            rounded: true,
                            x1: w - alineh, y1: h - alineh,
                            x2: w / 2, y2: h - alineh,
                            x3: w / 2, y3: alineh,
                            x4: alineh, y4: alineh
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: alineh, y: alineh,
                            radius: alineh,
                            start: 180, end: 360
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: w, y: h - alineh,
                            radius: alineh,
                            start: 180, end: 360
                        }).drawText({
                            fillStyle: $(toolx).css("color"),
                            strokeWidth: lw,
                            x: 4 * alineh, y: alineh,
                            fontSize: $(toolx).css("font-size"),
                            fontFamily: $(toolx).css("font-family"),
                            text: $(toolx).attr("data-linktype") == "2" ? "TR" : "SYS"
                        }).drawText({
                            fillStyle: $(toolx).css("color"),
                            strokeWidth: lw,
                            x: w - 4 * alineh, y: h - alineh,
                            fontSize: $(toolx).css("font-size"),
                            fontFamily: $(toolx).css("font-family"),
                            text: $(toolx).attr("data-linktype") == "2" ? "TR" : "SYS"
                        });
                        break;
                    case ("4"):
                        $tCanvas.drawLine({
                            strokeStyle: linecolor,
                            strokeWidth: lw,
                            strokeDash: [3, 5],
                            rounded: true,
                            x1: alineh, y1: h - alineh,
                            x2: w / 2, y2: h - alineh,
                            x3: w / 2, y3: alineh,
                            x4: w - alineh, y4: alineh
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: 0, y: h - alineh,
                            radius: alineh,
                            start: 0, end: 180
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: w - alineh, y: alineh,
                            radius: alineh,
                            start: 0, end: 180
                        }).drawText({
                            fillStyle: $(toolx).css("color"),
                            strokeWidth: lw,
                            x: 4 * alineh, y: h - alineh,
                            fontSize: $(toolx).css("font-size"),
                            fontFamily: $(toolx).css("font-family"),
                            text: $(toolx).attr("data-linktype") == "2" ? "TR" : "SYS"
                        }).drawText({
                            fillStyle: $(toolx).css("color"),
                            strokeWidth: lw,
                            x: w - 4 * alineh, y: alineh,
                            fontSize: $(toolx).css("font-size"),
                            fontFamily: $(toolx).css("font-family"),
                            text: $(toolx).attr("data-linktype") == "2" ? "TR" : "SYS"
                        });
                        break;
                    default:
                        $tCanvas.drawLine({
                            strokeStyle: linecolor,
                            strokeWidth: lw,
                            strokeDash: [3, 5],
                            rounded: true,
                            x1: alineh, y1: alineh,
                            x2: w / 2, y2: alineh,
                            x3: w / 2, y3: h - alineh,
                            x4: w - alineh, y4: h - alineh
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: 0, y: alineh,
                            radius: alineh,
                            start: 0, end: 180
                        }).drawArc({
                            fillStyle: acolor,
                            strokeStyle: linecolor,
                            strokeWidth: 1,
                            x: w - alineh, y: h - alineh,
                            radius: alineh,
                            start: 0, end: 180
                        }).drawText({
                            fillStyle: $(toolx).css("color"),
                            strokeWidth: lw,
                            x: 5 * alineh, y: alineh,
                            fontSize: $(toolx).css("font-size"),
                            fontFamily: $(toolx).css("font-family"),
                            text: $(toolx).attr("data-linktype") == "2" ? "TR" : "SYS"
                        }).drawText({
                            fillStyle: $(toolx).css("color"),
                            strokeWidth: lw,
                            x: w - 4 * alineh, y: h-alineh,
                            fontSize: $(toolx).css("font-size"),
                            fontFamily: $(toolx).css("font-family"),
                            text: $(toolx).attr("data-linktype") == "2" ? "TR" : "SYS"
                        });
                }
            }
        default:
    }

    if ($(toolx).attr("data-ShowText")=="true" && textx != null && textx != "") {
        $tCanvas.drawText({
            fillStyle: $(toolx).css("color"),
            strokeWidth: lw,
            x: w / 2, y: th,
            fontSize: $(toolx).css("font-size"),
            fontFamily: $(toolx).css("font-family"),
            text: textx
        });
    }
}
function load_pfc(mod_recipe) {
    idmaxnow = 0;
    hidelinkdot();
    $('#propertygrid').propertygrid('loadData', []);
    $("#target>.ksec-recipetool").remove();
    var RES = ksec.Common.GetModelSource("BXT_MRecipeElementDA.svc/web/Get", { paras: [{ ColumnName: "RE_ID", CompareStr: "=", ColumnValue1: mod_recipe.RE_ID, ColumnValue2: null }, { ColumnName: "REVersion", CompareStr: "=", ColumnValue1: mod_recipe.REVersion, ColumnValue2: null }], GetWithChild: true });
    if (RES) {
        $.each(RES.Child_BXT_MRecipeTransition, function (index, Mrt) {//每一个Transition
            var n = $('<div class="ksec-recipetool" data-isrecipetool="false" data-type="13" data-condition="" data-Text="" data-ShowText="true" data-Textheight="20" data-linew="2" data-linecolor="#8aa8bd" data-acolor="#8aa8bd" ToolTip=""></div>')
                .attr("id", Mrt.TransitionID).attr("data-condition", Mrt.Condition).attr("data-Text", Mrt.Text).attr("data-ToolTip", Mrt.ToolTip).attr("data-ShowText", Mrt.ShowText)
                .appendTo($("#target")).width(Mrt.HorizontalStop - Mrt.HorizontalStart).height(Mrt.VerticalStop - Mrt.VerticalStart);
            init_recipetool($(n));
            $(n).css("position", "absolute").offset({ left: Mrt.HorizontalStart, top: Mrt.VerticalStart });
        });
        $.each(RES.Child_BXT_MRecipeLink, function (index, link) {//每一个Link
            var n = $('<div class="ksec-recipetool" data-isrecipetool="false" data-type="14" data-linkin="" data-linkout="" data-linkpos="1" data-linktype="1" data-Text="" data-ShowText="true" data-Textheight="20" data-linew="2" data-linecolor="#8aa8bd" data-acolor="#8aa8bd" ToolTip=""></div>')
                .attr("id", link.LinkID).attr("data-linktype", link.LinkType).attr("data-linkpos", link.LinkPos).attr("data-linkin", link.FromElement).attr("data-linkout", link.ToElement).attr("data-Text", link.Text).attr("data-ToolTip", link.ToolTip).attr("data-ShowText", link.ShowText)
                .appendTo($("#target")).width(link.HorizontalStop - link.HorizontalStart).height(link.VerticalStop - link.VerticalStart);
            init_recipetool($(n));
            $(n).css("position", "absolute").offset({ left: link.HorizontalStart, top: link.VerticalStart });
        });
        $.each(RES.Child_BXT_MRecipeStep, function (index, step) {//每一个Step
            var stepre = ksec.Common.GetModelSource("BXT_MRecipeElementDA.svc/web/Get", { paras: [{ ColumnName: "RE_ID", CompareStr: "=", ColumnValue1: step.StepID, ColumnValue2: null }, { ColumnName: "REVersion", CompareStr: "=", ColumnValue1: "V01", ColumnValue2: null }], GetWithChild: false });
            var n = $('<div class="ksec-recipetool" data-isrecipetool="false" data-type=7 data-Text="start" data-ShowText="true" data-Textheight="20" data-linew="2" data-linecolor="#8aa8bd" data-acolor="#8aa8bd" ToolTip=""></div>')
                .attr("id", step.StepID).attr("data-Text", step.Text).attr("data-ToolTip", step.ToolTip).attr("data-ShowText", step.ShowText)


                .attr("data-type", stepre.RE_Type)
                .attr("data-DerivedRE", stepre.DerivedRE)
                .attr("data-DerivedVersion", stepre.DerivedVersion)
                .attr("data-RE_Function", stepre.RE_Function)
                .attr("data-Priority", stepre.Priority)
                .attr("data-ProcessUnit", stepre.ProcessUnitID)


                .appendTo($("#target")).width(step.HorizontalStop - step.HorizontalStart).height(step.VerticalStop - step.VerticalStart);
            init_recipetool($(n));
            $(n).css("position", "absolute").offset({ left: step.HorizontalStart, top: step.VerticalStart });
        });
    }
}


function onPropertyEdit(rowIndex, rowData, changes) {
    if (mod_item && changes.value) {
        $("#target>.ksec-recipetoolsel").attr("data-" + rowData.name, changes.value);
        if (rowData.name == "ProcessUnit" && changes && changes.value != null && changes.value != '') {
            $("#target>.ksec-recipetoolsel").attr("data-Text", $.Enumerable.From(rowData.editor.options.data).Where("$.EquipmentID == '" + changes.value + "'").ToArray()[0].EquipmentName);
            rowsDis[1].value = $("#target>.ksec-recipetoolsel").attr("data-Text");
            $('#propertygrid').propertygrid('refreshRow', 1);
        }
        if (rowData.group == "Display Settings" || rowData.name == "ProcessUnit")
            $("#target>.ksec-recipetoolsel").each(function (k, t) { redraw_recipetool(t); });
    }
}
var rowsDis = [
        { "name": "id", "group": "Display Settings", "value": ""},
        { "name": "Text", "group": "Display Settings", "value": "", "editor": "text" },
        {
            "name": "ShowText", "group": "Display Settings", "value": "", "editor": {
                "type": "checkbox",
                "options": {
                    "on": "true",
                    "off": "false"
                }
            }
        },
        { "name": "ToolTip", "group": "Display Settings", "value": "", "editor": "text" }
];
var rowsallocation = [
        { "name": "Paras", "value": "", "group": "App Settings", "editor": "text" }
];
var rowscondition = [
        { "name": "Conditions", "value": "", "group": "App Settings", "editor": "text" }
];
var rowsoperation = [
        { "name": "Function", "value": "", "group": "App Settings", "editor": "text" },
        { "name": "Paras", "value": "", "group": "App Settings", "editor": "text" }
];
var rowsunit = [
        { "name": "DerivedRE", "value": "", "group": "App Settings"},
        { "name": "DerivedVersion", "value": "", "group": "App Settings" },
        { "name": "RE_Function", "value": "", "group": "App Settings" },
        {
            "name": "Priority", "value": "0", "group": "App Settings"
            //, "editor": {
            //    "type": "numberbox",
            //    "options": {
            //        required: true
            //    }
            //}
        },
        {
            "name": "ProcessUnit", "value": "", "group": "App Settings", "editor": {
                "type": "combobox",
                "options": {
                    "data": [],
                    "panelHeight": "auto",
                    "valueField": 'EquipmentID',
                    "textField": 'EquipmentName', editable: false
                }
            }
        }
];

function CheckSFC() {
    try {
        var sfcstart = $("#target>.ksec-recipetool[data-type=7]");
        if (sfcstart == null || sfcstart.length != 1)
            throw "路线流程无开始,或存在错误的多开始符号！";
        var ids = [];
        var curPriority = 0;
        checksubitem(ids, sfcstart[0], curPriority);
        //主流程无问题，看看有无流程外的元素不在流程里
        $("#target>.ksec-recipetool").each(function (i, t) {
            if ($.inArray($(t).attr("id"), ids) == -1)
                throw "存在主路径流程外的控件元素！";
        });
        return "";
    }
    catch (err) {
        return err;
    }
}
//递归漫游连接控件，直到遇到结束符号或控件无输出连接
function checksubitem(ids, toolx, curPriority) {
    ids.push($(toolx).attr("id"));
    var linkx = $("#target>.ksec-recipetool[data-type=14][data-linktype='1'][data-linkin ='" + $(toolx).attr("id") + "']");
    if (linkx == null || linkx.length == 0 || $(linkx).attr("data-linkout") == "")//该控件已无连接,或是连接无输出控件
    {
        if ($(toolx).attr("data-type") != 8)
            throw "路线流程无连接结束符号！";
    }
    ids.push($(linkx).attr("id"));
    var ntoolx = $("#target>.ksec-recipetool[id='" + $(linkx).attr("data-linkout") + "']");
    if (ntoolx == null || ntoolx.length == 0)
        throw "路线流程过程连接输出错误，找不到连接的输出控件，连接控件id：" + $(linkx).attr("id");
    if ($(ntoolx).attr("data-type") == 3) {//单元程序
        $(ntoolx).attr("data-RE_Function", "");
        if ($(ntoolx).attr("data-ProcessUnit") == 0)//单元程序无引用单元
            throw "单元程序：" + $(ntoolx).attr("id") + " 无引用单元！";
        curPriority += 1;
        $(ntoolx).attr("data-Priority", curPriority);
        var syslink = $("#target>.ksec-recipetool[data-type=14][data-linktype='3'][data-linkout ='" + $(ntoolx).attr("id") + "']");
        if (syslink != null && syslink.length > 0) {//存在同步连接//例如:同步的旁线加工单元
            var ntoolx_sys = $("#target>.ksec-recipetool[id='" + $(syslink).attr("data-linkin") + "']");
            if (ntoolx_sys == null || ntoolx_sys.length == 0)
                throw "路线流程过程连接输入错误，找不到连接的输入控件，连接控件id：" + $(syslink).attr("id");
            ids.push($(syslink).attr("id"));
            if ($(ntoolx_sys).attr("data-type") == 3) {//同步的是单元程序
                if ($(ntoolx_sys).attr("data-ProcessUnit") == 0)//同步的单元程序无引用单元
                    throw "单元程序：" + $(ntoolx_sys).attr("id") + " 无引用单元！";
                $(ntoolx_sys).attr("data-Priority", curPriority);//同步单元与主流程单元共用一个优先级
                $(ntoolx_sys).attr("data-RE_Function", "sys");//同步单元与主流程单元共用一个优先级
            }
            ids.push($(ntoolx_sys).attr("id"));
        }
    }
    if ($(ntoolx).attr("data-type") != 8)//不是结束符号，递归下一控件
        checksubitem(ids, ntoolx, curPriority);
    else
        ids.push($(ntoolx).attr("id"));
}
