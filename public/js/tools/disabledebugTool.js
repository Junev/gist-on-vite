//禁用使用右键菜单查看源码
document.oncontextmenu = function() {
    event.returnValue = false;
};

//监听键盘事件
function mAlert() {
	alert("警告：严禁使用技术手段操作本程序！！！");
}

document.onkeydown = function(event){
    let e = event || window.event || arguments.callee.caller.arguments[0];
    //F12
    if(e && e.keyCode == 123) {
        return false;
    }else if((e.ctrlKey) && (e.shiftKey) && (e.keyCode == 73)){
        return false;
    //Shift+F10
    }else if((e.shiftKey) && (e.keyCode == 121)){
        return false;
    //Ctrl+U
    }else if((e.ctrlKey) && (e.keyCode == 85)){
        return false;
    }
}

var h = window.innerHeight,w = window.innerWidth;
//打开控制台时网页的大小会被重置，这种方式会影响重置网页的功能，而且对实际使用应用功能的用户不友好
window.onresize = function () {
    if (h != window.innerHeight || w != window.innerWidth) {
        //window.close()
        //window.open("about:blank", (target = "_self"));
    }
};