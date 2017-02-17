(function() {
  'use strict';

  // @param {string} selector - a CSS selector string
  function $(selector) {
    return document.querySelector(selector);
  }

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
    // @param {[object YangPlayer]} playerObject - an object `new` from class `YangPlayer`
    constructor(playerObject) {
      this.playerObject = playerObject;
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
      this.playerObject.pauseVideo();
    }
  }

  class PausingState extends State {
    playButtonWasClicked() {
      this.playerObject.playVideo();
    }
  }

  // a class of control-play button
  class ControlPlayBtn {
    // @param {[object HTMLElement]} player
    constructor(player) {
      // current possible states of video player
      this.loadingState = new LoadingState(this);
      this.playingState = new PlayingState(this);
      this.pausingState = new PausingState(this);

      this.player = player;
      this.playButton = $('.YangPlayer-play-button');
      this.pauseButton = $('.YangPlayer-pause-button');
      this.playCircle = $('.YangPlayer-play-circle');
      this.playLoading = $('.YangPlayer-loading');
      this.controlPlayButton = $('.YangPlayer-controlPlay-button');
      this.playerState = null;
    }

    init() {
      this.player.oncanplaythrough = () => {
        this.playLoading.style.display = 'none';
        this.player.style.opacity = .5;
        this.playCircle.style.display = 'block';
        this.setPlayerState(this.pausingState);

        this.controlPlayButton.onclick = () => {
          this.playerState.playButtonWasClicked();
        };

        this.player.onclick = () => {
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
      this.player.play();

      this.playButton.style.display = 'none';
      this.pauseButton.style.display = 'inline-block';
      this.player.style.opacity = 1;
      this.playCircle.style.display = 'none';
      this.setPlayerState(this.playingState);
    }

    pauseVideo() {
      this.player.pause();

      this.pauseButton.style.display = 'none';
      this.playButton.style.display = 'inline-block';
      this.player.style.opacity = .5;
      this.playCircle.style.display = 'block';
      this.setPlayerState(this.pausingState);
    }
    
    // @param {[object State]} playerState - the state of video player
    setPlayerState(playerState) {
      this.playerState = playerState;
    }
  }

  // a class of video player volume
  class Volume {
    // @param {[object HTMLElement]} player
    constructor(player) {
      this.player = player;
      this.volumeButton = $('.YangPlayer-volume-button');
      this.volumeUpButton = $('.YangPlayer-volume-up');
      this.volumeDownButton = $('.YangPlayer-volume-down');
      this.volumeOffButton = $('.YangPlayer-volume-off');
      this.volumeChangeRect = $('.YangPlayer-volume-change');
      this.volumeNumber = $('.YangPlayer-volume-number');
      this.volumeNumberValue = 50; // relative to 100(1 - 100), default: 50
      this.realVolumeValue = 0.5; // relative to 1(0.01 - 1.00), default: 0.5
      this.volumeBar = $('.YangPlayer-volume-bar');
      this.volumeDragButton = $('.YangPlayer-volume-dragButton');
      this.currentVolumeReverseBar = $('.YangPlayer-currentVolume-reverseBar');
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
          }, $('.draggable'));

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
    // @param {[object HTMLElement]} player
    constructor(player) {
      this.player = player;
      this.progressBar = $('.YangPlayer-playedbar');
      this.playedTime = $('.YangPlayer-played-time');
      this.totalTime = $('.YangPlayer-total-time');
    }

    init() {
      ProgressBar.setProgressLength();
      this.progressBarDisplay();
    }

    // set the percent width of the progress bar
    static setProgressLength() {
      let controlsLength = Utility.outerWidth($('#YangPlayer'));
      let playBtnLength = Utility.outerWidth($('.YangPlayer-controlPlay-button'));
      let timeBarLength = Utility.outerWidth($('.YangPlayer-time'));
      let volumeBtnLength = Utility.outerWidth($('.YangPlayer-volume-button'));
      let screenModeLength = Utility.outerWidth($('.YangPlayer-screen-mode'));
      let progressLength = controlsLength - playBtnLength - timeBarLength - volumeBtnLength - screenModeLength - 20;

      $('.YangPlayer-progress').style.width = `${progressLength / controlsLength * 100}%`;
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
    // @param {[object HTMLElement]} player
    constructor(player) {
      this.player = player;
      this.controlBar = $('.YangPlayer-control');
      this.timeoutId = null;
      this.controlBarBox = $('.YangPlayer-control-box');
      this.screenModeButton = $('.YangPlayer-screen-mode');
      this.fullscreenButton = $('.YangPlayer-fullscreen');
      this.minscreenButton = $('.YangPlayer-minscreen');
      this.fullscreenElement = null;
      this.isFullscreen = false;
      this.fullscreenEnabled = false;
    }

    init() {
      if(ScreenMode.getBrowserSupportObj()) {
        // make these properties function in order to get their real-time values
        this.fullscreenElement = () => document[ScreenMode.getBrowserSupportObj().fullscreenElement];
        this.isFullscreen = () => Boolean(this.fullscreenElement());
        this.fullscreenEnabled = () => document[ScreenMode.getBrowserSupportObj().fullscreenEnabled];

        this.screenModeButton.onclick = () => {
          // compatible with the different implementations of the Gecko and WebKit Fullscreen API
          //        => Gecko: only stretch element to fill the screen and siblings are still placed relative to fullscreen element ancestor and will be overrided by fullscreen element(z-index setting is invalid)
          //        => Webkit: stretch element but siblings seems to be placed relative to fullscreen element
          let fullscreenElement = document.mozCancelFullScreen ? $('.YangPlayer-container') : this.player;

          this.toggle(fullscreenElement);
            // .then(
            //   function fullfilled(val) {
            //     // invalid: `ProgressBar.setProgressLength();`
            //     // setTimeout(() => ProgressBar.setProgressLength(), 100);
            //   },
            //   function rejected(err) {
            //     throw new Error(err);
            //   }
            // )
            // .catch(function(err) {
            //   throw new Error(err);
            // });

          // refresh progress bar when the fullscreen state of the page changes (because of `ESC`)
          this.onfullscreenchange(ProgressBar.setProgressLength);

          // refresh progress bar when DevTool is opened and resized
          window.onresize = ProgressBar.setProgressLength;
        };
      }
      else {
        throw new Error('Current browser doesn\'t support Fullscreen API!');
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

    // trigger callback when the fullscreen state of the page changes
    // @param {function} callback
    onfullscreenchange(callback) {
      if(ScreenMode.getBrowserSupportObj()) {
        let change = ScreenMode.getBrowserSupportObj().onfullscreenchange;
        let callbackAdd = () => {
          callback();

          this.notOverControlBar();
        };

        return (document[change] = callbackAdd);
      }

      throw new Error('Current browser doesn\'t support Fullscreen API!');
    }

    // bottom control bar disappears when cursor isn's over it in fullscreen mode
    notOverControlBar() {
      if(!this.isFullscreen()) {
        this.fullscreenButton.style.display = 'inline-block';
        this.minscreenButton.style.display = 'none';

        this.controlBar.onmouseenter = null;
        this.controlBarBox.onmouseenter = null;
        this.controlBar.onmouseleave = null;
        clearTimeout(this.timeoutId); // avoid the impact of the remaining timer
        this.controlBar.style.visibility = 'visible';
      }
      else {
        this.fullscreenButton.style.display = 'none';
        this.minscreenButton.style.display = 'inline-block';

        this.controlBar.onmouseleave = () => {
          this.timeoutId = setTimeout(() => {
            this.controlBar.style.visibility = 'hidden';
          }, 3000);
        };

        this.controlBarBox.onmouseenter = () => {
          this.controlBar.style.visibility = 'visible';
        };

        this.controlBar.onmouseenter = () => {
          clearTimeout(this.timeoutId);
        };
      }
    }

    // @param {[object HTMLElement]} element
    requestFullscreen(element = document.documentElement) {
      if(ScreenMode.getBrowserSupportObj()) {
        let request = ScreenMode.getBrowserSupportObj().requestFullscreen;

        this.fullscreenButton.style.display = 'none';
        this.minscreenButton.style.display = 'inline-block';

        return element[request](); // requestFullscreen() method issues an `asynchronous` request to make the element be displayed full-screen

        // latest version of Chrome(56)/ Firefox(51) / Safari(10) not return a Promise in Fullscreen API
        // invalid: `return element[request]();`
        // return Promise.resolve();
      }

      throw new Error('Current browser doesn\'t support Fullscreen API!');
    }

    exitFullscreen() {
      if(ScreenMode.getBrowserSupportObj()) {
        let exit = ScreenMode.getBrowserSupportObj().exitFullscreen;

        this.fullscreenButton.style.display = 'inline-block';
        this.minscreenButton.style.display = 'none';
        return document[exit](); // async

        // latest version of Chrome(56)/ Firefox(51) / Safari(10) not return a Promise in Fullscreen API
        // invalid: `return document[exit]();`
        // return Promise.resolve();
      }
      
      throw new Error('Current browser doesn\'t support Fullscreen API!');
    }

    // toggle fullscreen mode
    // @param {[object HTMLElement]} element
    toggle(element) {
      if(this.isFullscreen()) {
        // return Promise.resolve(this.exitFullscreen());
        return this.exitFullscreen();
      }

      // return Promise.resolve(this.requestFullscreen(element));
      return this.requestFullscreen(element);
    }
  }

  // a class control `bullet screen`
  class BulletScreen {
    constructor() {
      // todo
    }

    init() {
      // todo
    }
  }

  // main class of YangPlayer video player
  class YangPlayer {
    constructor() {
      // some important properties about YangPlayer video player
      this.YangPlayer = $('#YangPlayer');
      this.controlPlay = null; // the button control playing and pausing
      this.volumeButton = null; // the button control volume in control bar
      this.progressBar = null; // the progress bar and its time bar
      this.screenMode = null; // the button controling fullscreen and minscreen
    }

    init() {
      // initialize control-play button and related loading img and pausing play-circle
      this.controlPlay = new ControlPlayBtn(this.YangPlayer);
      this.controlPlay.init();

      // initialize progress bar
      this.progressBar = new ProgressBar(this.YangPlayer);
      this.progressBar.init();

      // initialize volume button
      this.volumeButton = new Volume(this.YangPlayer);
      this.volumeButton.init();

      // initialize screen mode button
      this.screenMode = new ScreenMode(this.YangPlayer);
      this.screenMode.init();
    }
  }

  let player = new YangPlayer();
  player.init();
})();
