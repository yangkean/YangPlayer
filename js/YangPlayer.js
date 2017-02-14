// a utility class containing some utilities
class Utility {
  // add a class name for a html element
  // @param {string} className
  // @param {[object HTMLElement]} element
  static addClass(className, element) {
    if(!element) {
      return;
    }
    
    let currentClassName = element.className;

    element.className = `${currentClassName} ${className}`;
  }

  // remove a class name for a html element
  // @param {string} className
  // @param {[object HTMLElement]} element
  static removeClass(className, element) {
    if(!element) {
      return;
    }
    
    let currentClassName = element.className;

    if(currentClassName.includes(className)) {
      element.className = currentClassName.slice(0, currentClassName.indexOf(`${className}`) - 1);
    }
  }

  // set the offset of an element relative to its parent node
  // @param {object} coordinates - an object containing two properties: top, left
  //        => {number(px)} top - new top coordinate for the element
  //        => {number(px)} left - new left coordinate for the element
  // @param {[object HTMLElement]} element
  static offset(coordinates, element) {
    if(!element) {
      return;
    }

    let offsetX = coordinates.left;
    let offsetY = coordinates.top;
    let parentElement = element.parentNode;

    parentElement.style.position = parentElement.style.position || 'relative';
    element.style.position = 'absolute';
    element.style.left = `${offsetX}px`;
    element.style.top = `${offsetY}px`;
  }

  // @param {[object HTMLElement]} element
  // @return {number(px)} the width containing content,padding and border of an element
  static outerWidth(element) {
    if(!element) {
      return;
    }

    return element.offsetWidth;
  }

  // @param {[object HTMLElement]} element
  // @return {number(px)} the height containing content,padding and border of an element
  static outerHeight(element) {
    if(!element) {
      return;
    }
    
    return element.offsetHeight;
  }

  // get the x offset of the element relative to its parent node
  // @param {[object HTMLElement]} element
  // @return {number(px)} x coordinate of the element
  static getOffsetLeft(element) {
    if(!element) {
      return;
    }
    
    return element.offsetLeft;
  }

  // get the y coordinate of the element relative to its parent node
  // @param {[object HTMLElement]} element
  // @return {number(px)} y coordinate of the element
  static getOffsetTop(element) {
    if(!element) {
      return;
    }
    
    return element.offsetTop;
  }

  // get the x coordinate of the element relative to document
  // @param {[object HTMLElement]} element
  // @return {number(px)} x coordinate of the element
  static getPageX(element) {
    if(!element) {
      return;
    }
    
    let pageXOffset = window.pageXOffset; // current scrolling horizontal offset of document
    let clientX = element.getBoundingClientRect().left;
    let pageX = pageXOffset + clientX;

    return pageX;
  }

  // get the y coordinate of the element relative to document
  // @param {[object HTMLElement]} element
  // @return {number(px)} y coordinate of the element
  static getPageY(element) {
    if(!element) {
      return;
    }
    
    let pageYOffset = window.pageYOffset; // current scrolling vertical offset of document
    let clientY = element.getBoundingClientRect().top;
    let pageY = pageYOffset + clientY;

    return pageY;
  }
}

// an abstract class of some video player states
class State {
  // @param {[object YangPlayer]} player
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

// a class of video player volume
class Volume {
  // @param {number} volume - current volume number of video player
  constructor(volume) {
    this.currentVolume = volume;
    this.volumeButton = document.querySelector('.YangPlayer-volume-button');
    this.volumeNumber = document.querySelector('.YangPlayer-volume-number');
    this.volumeBar = document.querySelector('.YangPlayer-volume-bar');
    this.volumeDragButton = document.querySelector('.YangPlayer-volume-dragButton');
    this.currentVolumeBar = document.querySelector('.YangPlayer-currentVolume-bar');
  }

  // control the drag button of volume to adjust volume
  controlVolumeButton() {
    let volumeDragButtonX = Number.parseInt(window.getComputedStyle(this.volumeDragButton).left);

    this.volumeDragButton.onmousedown = (event1) => {
      Utility.addClass('draggable', this.volumeDragButton);

      this.volumeDragButton.onmousemove = (event2) => {
        // current mouse y offset
        let mouseY = event2.pageY - (Utility.outerHeight(this.volumeDragButton) / 2) - Utility.getPageY(this.volumeBar);
        // mouse max y offset when volume is min
        let mouseYMax = Utility.outerHeight(this.volumeBar) - Utility.outerHeight(this.volumeDragButton);

        Utility.offset({
          top: (mouseY <= 0) ? 0 : (mouseY >= mouseYMax ? mouseYMax : mouseY),
          left: volumeDragButtonX,
        }, document.querySelector('.draggable'));

        event2.preventDefault();
      };

      this.volumeDragButton.onmouseup = (event3) => {
        Utility.removeClass('draggable', this.volumeDragButton);

        this.volumeDragButton.onmousemove = null; // remove mousemove event binding

        event3.preventDefault();
      };

      this.volumeDragButton.onmouseout = (event4) => {
        Utility.removeClass('draggable', this.volumeDragButton);

        this.volumeDragButton.onmousemove = null; // remove mousemove event binding

        event4.preventDefault();
      };

      event1.preventDefault();
    };
  }

  // change real volume adcording to volumeDragButton and display it
  changeVolume() {

  }
}

// main class of YangPlayer video player
class YangPlayer {
  constructor() {
    // current possible states of video player
    this.loadingState = new LoadingState(this);
    this.playingState = new PlayingState(this);
    this.pausingState = new PausingState(this);

    this.constrolPlayButton = null; // the button controling playing or pausing in control bar
    this.volumeButton = null; // the button control volume in control bar
  }

  init() {
    this.YangPlayer = document.querySelector('#YangPlayer');
    this.playButton = document.querySelector('.YangPlayer-play-button');
    this.pauseButton = document.querySelector('.YangPlayer-pause-button');
    this.playCircle = document.querySelector('.YangPlayer-play-circle');
    this.playLoading = document.querySelector('.YangPlayer-loading');
    this.constrolPlayButton = document.querySelector('.YangPlayer-controlPlay-button');
    this.progressBar = document.querySelector('.YangPlayer-playedbar');
    this.playedTime = document.querySelector('.YangPlayer-played-time');
    this.totalTime = document.querySelector('.YangPlayer-total-time');
    this.setPlayerState(this.pausingState);

    this.YangPlayer.removeAttribute('controls');

    this.YangPlayer.addEventListener('canplaythrough', () => {
      this.playLoading.style.display = 'none';
      this.YangPlayer.style.opacity = .6;
      this.playCircle.style.display = 'block';
      this.playerState = this.pausingState;

      this.progressBarDisplay();

      this.volumeButton = new Volume(this.YangPlayer.volume);
      this.volumeButton.controlVolumeButton();

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
				
        if(keyCode === 32) { // the Unicode vaule of `Space`
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

  pauseVideo() {
    this.YangPlayer.pause();

    this.pauseButton.style.display = 'none';
    this.playButton.style.display = 'inline-block';
    this.YangPlayer.style.opacity = .6;
    this.playCircle.style.display = 'block';
    this.setPlayerState(this.pausingState);
  }

  // @param {[object State]} playerState - the state of video player
  setPlayerState(playerState) {
    this.playerState = playerState;
  }

  progressBarDisplay() {
    setInterval(() => {
      if(this.YangPlayer.played.length > 0) {
        let playedPercent = `${Math.floor(this.YangPlayer.played.end(0) / this.YangPlayer.duration * 100)}%`;

        this.progressBar.style.width = playedPercent;
        this.progressTimeDisplay(this.YangPlayer.played.end(0), this.YangPlayer.duration);
      }
    }, 1000);
  }

  // @param {number(seconds)} playedTime
  // @param {number(seconds)} totalTime
  progressTimeDisplay(playedTime, totalTime) {
    let H, M, S, h, m, s;

    let playedHours = (h = Math.floor(playedTime / 3600)) < 10 ? (`0${h}`) : h;
    let playedMinutes = (m = Math.floor(playedTime % 3600 / 60)) < 10 ? (`0${m}`) : m;
    let playedSeconds = (s = Math.floor(playedTime % 3600 % 60)) < 10 ? (`0${s}`) : s;

    let totalHours = (H = Math.floor(totalTime / 3600)) < 10 ? (`0${H}`) : H;
    let totalMinutes = (M = Math.floor(totalTime % 3600 / 60)) < 10 ? (`0${M}`) : M;
    let totalSeconds = (S = Math.floor(totalTime % 3600 % 60)) < 10 ? (`0${S}`) : S;

    this.playedTime.innerHTML = `${playedHours}:${playedMinutes}:${playedSeconds}`;
    this.totalTime.innerHTML = `${totalHours}:${totalMinutes}:${totalSeconds}`;
  }
}

let player = new YangPlayer();
player.init();
