class State {
  constructor(player) {
    this.player = player;
  }
  playButtonWasClicked() {
    throw new Error('父类的 playButtonWasClicked 方法必须被重写！');
  }
}

class LoadingState extends State {
  playButtonWasClicked() {
    // 加载中应该做的事
  }
}

class PlayingState extends State {
  playButtonWasClicked() {
    this.player.pauseVideo();
  }
}

class PausingState extends State {
  playButtonWasClicked() {
    this.player.playVideo();
  }
}

class YangPlayer {
  constructor() {
    // 播放器当前可能处于的状态种类
    this.loadingState = new LoadingState(this);
    this.playingState = new PlayingState(this);
    this.pausingState = new PausingState(this);

    // 控制栏中控制视频播放或暂停的按钮
    this.constrolPlayButton = null;
  }

  init() {
    this.YangPlayer = document.querySelector('#YangPlayer');
    this.playButton = document.querySelector('.YangPlayer-play-button');
    this.pauseButton = document.querySelector('.YangPlayer-pause-button');
    this.playCircle = document.querySelector('.YangPlayer-play-circle');
    this.playLoading = document.querySelector('.YangPlayer-loading');
    this.constrolPlayButton = document.querySelector('.YangPlayer-controlPlay-button');
    this.setPlayerState(this.pausingState);

    this.YangPlayer.removeAttribute('controls');

    this.YangPlayer.addEventListener('canplaythrough', () => {
      this.playLoading.style.display = 'none';
      this.YangPlayer.style.opacity = .6;
      this.playCircle.style.display = 'block';
      this.playerState = this.pausingState;

      this.constrolPlayButton.onclick = () => {
        this.playerState.playButtonWasClicked();
      };

      this.YangPlayer.onclick = () => {
        this.playerState.playButtonWasClicked();
      };

      this.playCircle.onclick = () => {
        this.playerState.playButtonWasClicked();
      };

      window.onkeypress = (event) => {
        let keyCode = event.which || event.keyCode;
				
        if(keyCode === 32) { // 空格的 Unicode 码
          this.playerState.playButtonWasClicked();
        }
      };
    }, false);
  }

  playVideo() {
    this.YangPlayer.play();

    this.playButton.style.display = 'none';
    this.pauseButton.style.display = 'inline-block';
    this.YangPlayer.style.opacity = 1;
    this.playCircle.style.display = 'none';
    this.setPlayerState(this.playingState);
  }

  auseVideo() {
    this.YangPlayer.pause();

    this.pauseButton.style.display = 'none';
    this.playButton.style.display = 'inline-block';
    this.YangPlayer.style.opacity = .6;
    this.playCircle.style.display = 'block';
    this.setPlayerState(this.pausingState);
  }

  setPlayerState(playerState) {
    this.playerState = playerState;
  }
}

let player = new YangPlayer();
player.init();
