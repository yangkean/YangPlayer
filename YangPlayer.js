var initUI = function() {
	var YangPlayer = document.getElementById("YangPlayer");
	var control = document.getElementsByClassName("control")[0];
	var playedBar = document.getElementsByClassName("playedbar")[0];
	var playbutton = document.getElementsByClassName("playbutton")[0];
	var volumeAddButton = document.getElementsByClassName("add")[0];
	var volumeSubButton = document.getElementsByClassName("sub")[0];
	var loading = document.getElementsByClassName("loading")[0];
	var clickBoolean = true;
	loading.style.display = "block";
	YangPlayer.removeAttribute("controls");
	YangPlayer.addEventListener("canplaythrough", function() { 
		loading.style.display = "none";
		YangPlayer.play(); // 媒体内容加载完毕时开始流畅播放

		setInterval(function() { // 实时显示播放进度
			var playedPercent = Math.floor(YangPlayer.played.end(0) / YangPlayer.duration * 100) + '%';
			playedBar.style.width = playedPercent; 
		}, 1000);

		playbutton.onclick = function() { // 手动控制视频播放
			if(clickBoolean) {
				YangPlayer.pause();
			}
			else {
				YangPlayer.play();
			}
			clickBoolean = !clickBoolean;
		};

		volumeAddButton.onclick = function() { // 增大音量
			if(YangPlayer.volume >= 1) {
				alert("已经是最大音量了！");
				return;
			}
			YangPlayer.volume = YangPlayer.volume + 0.1;
		};

		volumeSubButton.onclick = function() { // 减小音量
			if(YangPlayer.volume <= 0.1) {
				alert("已经是最小音量了！");
				return;
			}
			YangPlayer.volume = YangPlayer.volume - 0.1;
		};
	}, false);	
};

initUI();