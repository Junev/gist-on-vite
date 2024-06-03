(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$(".toggle-password").click(function() {

	  $(this).toggleClass("fa-eye fa-eye-slash");
	  var input = $($(this).attr("toggle"));
	  if (input.attr("type") == "password") {
	    input.attr("type", "text");
	  } else {
	    input.attr("type", "password");
	  }
	});


	function sendData() {
    var XHR = new XMLHttpRequest();

    // 我们把这个 FormData 和表单元素绑定在一起。
    var FD  = new FormData(form);
		FD.append("grant_type", "password");
		FD.append("client_id", "password");
		FD.append("client_secret", "123");

    // 我们定义了数据成功发送时会发生的事。
    XHR.addEventListener("load", function(event) {
			const res = JSON.parse(event.target.responseText);
			sessionStorage.setItem("sid", res.access_token)
			window.location.href = "/dist/EMS_Equipment.html";
    });

    // 我们定义了失败的情形下会发生的事
    XHR.addEventListener("error", function(event) {
      alert('哎呀！出了一些问题。');
    });

    // 我们设置了我们的请求
    XHR.open("POST", "http://localhost:9090/oauth/token");

    // 发送的数据是由用户在表单中提供的
    XHR.send(FD);
  }

  // 我们需要获取表单元素
  var form = document.getElementById("signin-form");

  // ...然后接管表单的提交事件
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    sendData();
  });
})(jQuery);
