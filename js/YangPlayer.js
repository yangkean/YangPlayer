(function() {
  'use strict';

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

      parentElement.style.position = window.getComputedStyle(parentElement).position || 'relative';
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
      // todo
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
    // @param {[object YangPlayer]} player
    constructor(player) {
      this.player = player;
      this.volumeButton = document.querySelector('.YangPlayer-volume-button');
      this.volumeUpButton = document.querySelector('.YangPlayer-volume-up');
      this.volumeDownButton = document.querySelector('.YangPlayer-volume-down');
      this.volumeOffButton = document.querySelector('.YangPlayer-volume-off');
      this.volumeChangeRect = document.querySelector('.YangPlayer-volume-change');
      this.volumeNumber = document.querySelector('.YangPlayer-volume-number');
      this.volumeNumberValue = 50; // relative to 100(1 - 100), default: 50
      this.realVolumeValue = 0.5; // relative to 1(0.01 - 1.00), default: 0.5
      this.volumeBar = document.querySelector('.YangPlayer-volume-bar');
      this.volumeDragButton = document.querySelector('.YangPlayer-volume-dragButton');
      this.currentVolumeReverseBar = document.querySelector('.YangPlayer-currentVolume-reverseBar');
      this.currentVolumeBarH = null; // the height from the bottom of volumeDragButton to the bottom of volumeBar
      this.mouseYMax = null; // max currentVolumeBarH or mouse max y offset(px) relative to volumeBar when volume is min
    }

    init() {
      this.displayVolumeButton();
      this.player.volume = this.realVolumeValue;
      this.volumeNumber.innerHTML = this.volumeNumberValue;
      this.controlVolumeButton();
    }

    // control the drag button of volume to adjust volume
    controlVolumeButton() {
      let volumeDragButtonX = Number.parseInt(window.getComputedStyle(this.volumeDragButton).left);

      this.volumeDragButton.onmousedown = (event1) => {
        Utility.addClass('draggable', this.volumeDragButton);

        this.volumeDragButton.onmousemove = (event2) => {
          // current mouse y offset
          let mouseY = event2.pageY - (Utility.outerHeight(this.volumeDragButton) / 2) - Utility.getPageY(this.volumeBar);
          // mouse max y offset(px) relative to volumeBar when volume is min
          this.mouseYMax = Utility.outerHeight(this.volumeBar) - Utility.outerHeight(this.volumeDragButton);
          // correct mouse y offset after adjusting
          let adjustMouseY = (mouseY <= 0) ? 0 : (mouseY >= this.mouseYMax ? this.mouseYMax : mouseY);

          Utility.offset({
            top: adjustMouseY,
            left: volumeDragButtonX,
          }, document.querySelector('.draggable'));

          // change real volume adcording to volumeDragButton
          this.currentVolumeBarH = Utility.outerHeight(this.volumeBar) - adjustMouseY - Utility.outerHeight(this.volumeDragButton);
          this.changeVolume(this.currentVolumeBarH);

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
    // @param {number(px)} currentVolumeBarH - the height from the bottom of volumeDragButton to the bottom of volumeBar
    changeVolume(currentVolumeBarH) {
      this.volumeNumberValue = Number.parseInt(currentVolumeBarH / this.mouseYMax * 100);
      this.realVolumeValue = (currentVolumeBarH / this.mouseYMax).toFixed(2);

      this.volumeNumber.innerHTML = this.volumeNumberValue;
      this.player.volume = this.realVolumeValue;
      this.currentVolumeReverseBar.style.height = `${Utility.getOffsetTop(this.volumeDragButton) / Utility.outerHeight(this.volumeBar) * 100}%`;
    }

    // display volumeButton
    displayVolumeButton() {
      this.volumeButton.onmouseover = () => {
        this.volumeChangeRect.style.display = 'block';
        this.volumeButton.style.backgroundColor = '#ccc';

        this.volumeChangeRect.onmousemove = () => {
          if(this.volumeNumberValue === 0) {
            this.volumeOffButton.style.display = 'inline-block';
            this.volumeUpButton.style.display = 'none';
            this.volumeDownButton.style.display = 'none';
            return;
          }

          if(this.volumeNumberValue > 0 && this.volumeNumberValue < 50) {
            this.volumeDownButton.style.display = 'inline-block';
            this.volumeUpButton.style.display = 'none';
            this.volumeOffButton.style.display = 'none';
            return;
          }

          this.volumeUpButton.style.display = 'inline-block';
          this.volumeDownButton.style.display = 'none';
          this.volumeOffButton.style.display = 'none';
        };
      };

      this.volumeButton.onmouseout = () => {
        this.volumeChangeRect.style.display = 'none';
        this.volumeButton.style.backgroundColor = '#eee';
      };
    }
  }

  // a class of video player progress bar
  class ProgressBar {
    // @param {[object YangPlayer]} player
    constructor(player) {
      this.player = player;
      this.progressBar = document.querySelector('.YangPlayer-playedbar');
      this.playedTime = document.querySelector('.YangPlayer-played-time');
      this.totalTime = document.querySelector('.YangPlayer-total-time');
    }

    init() {
      this.progressBarDisplay();
    }

    progressBarDisplay() {
      setInterval(() => {
        if(this.player.played.length > 0) {
          let playedPercent = `${Math.floor(this.player.played.end(0) / this.player.duration * 100)}%`;

          this.progressBar.style.width = playedPercent;
          this.progressTimeDisplay(this.player.played.end(0), this.player.duration);
        }
        else if(this.player.duration > 0) {
          this.progressTimeDisplay(0, this.player.duration);
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

  // a class controling the mode of video player screen
  class ScreenMode {
    constructor() {
      this.fullscreenElement = null;
      this.isFullscreen = false;
      this.fullscreenEnabled = false;
    }

    init() {
      if(ScreenMode.getBrowserSupportObj()) {
        this.fullscreenElement = () => document[ScreenMode.getBrowserSupportObj().fullscreenElement];
        this.isFullscreen = () => Boolean(this.fullscreenElement);
        this.fullscreenEnabled = () => document[ScreenMode.getBrowserSupportObj().fullscreenEnabled];
      }
      else {
        throw new Error('Current browser don\'t support Fullscreen API!');
      }
    }

    // return current browser supporting Fullscreen API
    // @return {object|boolean} a Fullscreen API object if any, otherwise `false`
    static getBrowserSupportObj() {
      let fnMap = [
        [
          'requestFullscreen',
          'exitFullscreen',
          'onfullscreenerror',
          'onfullscreenchange',
          'fullscreenElement',
          'fullscreenEnabled',
          'fullscreen',
        ],
        // Blink (Chrome & Opera) / Edge / WebKit (Safari)
        [
          'webkitRequestFullscreen',
          'webkitExitFullscreen',
          'onwebkitfullscreenerror',
          'onwebkitfullscreenchange',
          'webkitFullscreenElement',
          'webkitFullscreenEnabled',
          'webkitIsFullScreen',
        ],
        // Gecko (Firefox)
        [
          'mozRequestFullScreen',
          'mozCancelFullScreen',
          'onmozfullscreenerror',
          'onmozfullscreenchange',
          'mozFullScreenElement',
          'mozFullScreenEnabled',
          'mozFullScreen',
        ],
        // IE 11
        [
          'msRequestFullscreen',
          'msExitFullscreen',
          'onmsfullscreenerror',
          'onmsfullscreenchange',
          'msFullscreenElement',
          'msFullscreenEnabled',
          null,
        ],
      ];
      let ret = {};

      for(let i = 0; i < fnMap.length; i++) {
        let val = fnMap[i];

        if(val[1] in document) {
          for(let j = 0; j < val.length; j++) {
            ret[fnMap[0][j]] = val[j];
          }

          return ret;
        }
      }

      return false;
    }

    // @param {[object HTMLElement]} element
    requestFullscreen(element = document.documentElement) {
      if(ScreenMode.getBrowserSupportObj()) {
        let request = ScreenMode.getBrowserSupportObj().requestFullscreen;

        element[request]();
      }
      else {
        throw new Error('Current browser don\'t support Fullscreen API!');
      }
    }

    exitFullscreen() {
      if(ScreenMode.getBrowserSupportObj()) {
        let exit = ScreenMode.getBrowserSupportObj().exitFullscreen;

        document[exit]();
      }
      else {
        throw new Error('Current browser don\'t support Fullscreen API!');
      }
    }

    // toggle fullscreen mode
    // @param {[object HTMLElement]} element
    toggle(element) {
      if(this.isFullscreen) {
        this.exitFullscreen();
      }
      else {
        this.requestFullscreen(element);
      }
    }
  }

  // main class of YangPlayer video player
  class YangPlayer {
    constructor() {
      // current possible states of video player
      this.loadingState = new LoadingState(this);
      this.playingState = new PlayingState(this);
      this.pausingState = new PausingState(this);

      // some important properties about YangPlayer video player
      this.YangPlayer = document.querySelector('#YangPlayer');
      this.playButton = document.querySelector('.YangPlayer-play-button');
      this.pauseButton = document.querySelector('.YangPlayer-pause-button');
      this.playCircle = document.querySelector('.YangPlayer-play-circle');
      this.playLoading = document.querySelector('.YangPlayer-loading');
      this.controlPlayButton = document.querySelector('.YangPlayer-controlPlay-button');
      this.playerState = null;
      this.volumeButton = null; // the button control volume in control bar
      this.progressBar = null; // the progress bar and its time bar
    }

    init() {
      this.YangPlayer.removeAttribute('controls');

      // initialize volume button
      this.volumeButton = new Volume(this.YangPlayer);
      this.volumeButton.init();

      // initialize progress bar
      this.progressBar = new ProgressBar(this.YangPlayer);
      this.progressBar.init();

      this.YangPlayer.oncanplaythrough = () => {
        this.playLoading.style.display = 'none';
        this.YangPlayer.style.opacity = .6;
        this.playCircle.style.display = 'block';
        this.setPlayerState(this.pausingState);

        this.controlPlayButton.onclick = () => {
          this.playerState.playButtonWasClicked();
        };

        this.YangPlayer.onclick = () => {
          this.playerState.playButtonWasClicked();
        };

        this.playCircle.onclick = () => {
          this.playerState.playButtonWasClicked();
        };

        document.onkeydown = (event) => {
          let keyCode = event.which || event.keyCode;
          
          if(keyCode === 32) { // the Unicode vaule of `Space`
            this.playerState.playButtonWasClicked();
          }
        };
      };
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
  }

  let player = new YangPlayer();
  player.init();
})();
