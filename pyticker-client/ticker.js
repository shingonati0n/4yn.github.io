jQuery(function($){

	var WebSocket = window.WebSocket || null;
	var Deferred = $.Deferred.bind($);

	$('#ip-address').val(localStorage.getItem("ip-address"))
	$('#port').val(localStorage.getItem("port"))
	if($('#ip-address').val()==''){
		$('#ip-address').val("localhost")
	}
	if($('#port').val()==''){
		$('#port').val("9001")
	}

	function enableFullScreen() {
	  if (!document.fullscreenElement &&    // alternative standard method
	      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
	    if (document.documentElement.requestFullscreen) {
	      document.documentElement.requestFullscreen();
	    } else if (document.documentElement.msRequestFullscreen) {
	      document.documentElement.msRequestFullscreen();
	    } else if (document.documentElement.mozRequestFullScreen) {
	      document.documentElement.mozRequestFullScreen();
	    } else if (document.documentElement.webkitRequestFullscreen) {
	      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	    }
	  }
	};

	if(!WebSocket){
		alert("No Websocket Support!");
		return;
	}

	var connector = new function Connector(){
		var _this = this; this.uri = ""; this.ws = null;
		this.connect = function Connector$connect(addr, port) {
			this.uri = "ws://"+addr+":"+port;
			return Deferred(function(defer){
				_this.ws = new WebSocket(_this.uri);
				_this.ws.onerror = function(e){
					_this.uri = "";
					_this.ws = null;
					defer.reject();
				};
				_this.ws.onopen = function(e){
					console.log("opened");
					setTimeout(_this.requestData,500);
					defer.resolve();
				};
				_this.ws.onmessage = function(msg){
					$('#ticker').html(msg.data.split(' ').join("&nbsp;"));
				}
			});
		};
		this.send = function Connector$send(data){
			this.ws && this.ws.send(data);
		};
		this.requestData = function(){
			console.log("reqdata");
			if(_this.ws.readyState == 1){
				_this.send("1");
				setTimeout(_this.requestData,50);
			}
		}
	};

	$('#connect').click(function openConnection(){
		setTimeout(function(){$('body').scrollTop(1);}, 500);
		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
			enableFullScreen();
		}

		var remoteAddr = $('#ip-address').val();
		var remotePort = $('#port').val();
		if(remoteAddr=="") return;
		$("#connect, #ip-address, #port").attr('disabled', true);

		localStorage.setItem("ip-address",remoteAddr);
		localStorage.setItem("port",remotePort);

		connector.connect(remoteAddr, remotePort).done(function(){
			$('#setup').hide();
			$('#ticker,#ticker-ghost').show();
			connector.ws.onclose = function(){
				$('#setup').show();
				$('#ticker,#ticker-ghost').hide();
				$("#connect, #ip-address, #port").removeAttr('disabled');
			};
		}).fail(function(){
			$("#connect, #ip-address, #port").removeAttr('disabled');
		});
	});

	// cosmetics
	$('#settings-icon').click(function() {
		$('#settings').toggleClass('settings-open');
	})

	var cssSel = {
		"skins" : [
			{
				"id" : 0 ,
				"name" : "Default",
				"link" : "ticker.css"
			},
			{
				"id" : 1 ,
				"name" : "Pendual Black",
				"link" : "css/ticker22black.css"
			},
			{
				"id" : 2 ,
				"name" : "Pendual Purple",
				"link" : "css/ticker22purple.css"
			},
			{
				"id" : 3 ,
				"name" : "Pendual Silver",
				"link" : "css/ticker22silver.css"
			}
		]
	};

	attatchCSS = function(which){
		$('#stylesheet').attr('href',cssSel.skins[which].link);
	};

	$.each(cssSel.skins, function(index, skin){
		var inside = '<ul class="skinsel" id=' + index + ' >'+ skin.name +'</ul>';
		$('#settings').append(inside);
		$('.skinsel#'+index).click(function(){
			attatchCSS(index);
		});
	});
	
});