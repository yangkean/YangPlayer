(function() {
  'use strict';

  const YangPlayer_GLOBAL = {
    playerPlayState: null, // {object} store the play state of video
  };

  // @param {string} selector - a CSS selector string
  function $(selector) {
    return document.querySelector(selector);
  }

  // a utility class containing some utilities
  class Utility {
    // get the Browser type and its version by `navigator.userAgent`
    // NOTE: It is easy to spoof `navigator.userAgent`, so the result may be not reliable
    // @return {object} an object containing `browser` and `version` properties
    // from [http://stackoverflow.com/questions/2400935/browser-detection-in-javascript#answer-2401861]
    static getBrowserInfo() {
      let ua = navigator.userAgent;
      let tem;
      let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

      if(/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];

        return {
          browser: 'IE',
          version: (tem[1] || ''),
        };
      }

      if(M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);

        if(tem) {
          return {
            browser: 'Opera',
            version: tem.slice(1)[1],
          };
        }
      }

      M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];

      if((tem = ua.match(/version\/(\d+)/i))) {
        M.splice(1, 1, tem[1]);
      }

      return {
        browser: M[0],
        version: M[1],
      };
    }

    // detect the browser by `duck typing`
    // @param {string} browser - the name of browser
    // @return {boolean}
    // from [http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser#answer-9851769]
    static isWhichBrowser(browser) {
      if(!browser) {
        throw new Error('param "browser" of method "isWhichBrowser" is not given!');
      }

      let browserName = browser.toLowerCase();

      // Opera 8.0+
      let isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

      // Firefox 1.0+
      let isFirefox = typeof InstallTrigger !== 'undefined';

      // Internet Explorer 6-11
      let isIE = /*@cc_on!@*/false || !!document.documentMode;

      // Edge 20+
      let isEdge = !isIE && !!window.StyleMedia;

      // Chrome 1+
      let isChrome = !!window.chrome && !!window.chrome.webstore;

      // Safari 3.0+ "[object HTMLElementConstructor]"
      let isSafari = (/constructor/i.test(window.HTMLElement))
                      || ((function(p) {
                        return p.toString() === '[object SafariRemoteNotification]';
                      })(!window.safari || safari.pushNotification))
                      || (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0)
                      || (!isChrome && !isOpera && window.webkitAudioContext !== undefined);

      // Blink engine detection
      // let isBlink = (isChrome || isOpera) && !!window.CSS;

      let browserObj = {
        opera: isOpera,
        firefox: isFirefox,
        safari: isSafari,
        ie: isIE,
        edge: isEdge,
        chrome: isChrome,
      };

      return browserObj[browserName];
    }

    // add a class name for a html element
    // @param {string} className
    // @param {[object HTMLElement]} element
    static addClass(className, element) {
      if(!element) {
        throw new Error('second param "element" of method "addClass" is not given!');
      }
      
      let currentClassName = element.className;

      element.className = `${currentClassName} ${className}`;
    }

    // remove a class name for a html element
    // @param {string} className
    // @param {[object HTMLElement]} element
    static removeClass(className, element) {
      if(!element) {
        throw new Error('second param "element" of method "removeClass" is not given!');
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
        throw new Error('second param "element" of method "offset" is not given!');
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
        throw new Error('param "element" of method "outerWidth" is not given!');
      }

      return element.offsetWidth;
    }

    // @param {[object HTMLElement]} element
    // @return {number(px)} the height containing content,padding and border of an element
    static outerHeight(element) {
      if(!element) {
        throw new Error('param "element" of method "outerHeight" is not given!');
      }
      
      return element.offsetHeight;
    }

    // get the x offset of the element relative to its parent node
    // @param {[object HTMLElement]} element
    // @return {number(px)} x coordinate of the element
    static getOffsetLeft(element) {
      if(!element) {
        throw new Error('param "element" of method "getOffsetLeft" is not given!');
      }
      
      return element.offsetLeft;
    }

    // get the y coordinate of the element relative to its parent node
    // @param {[object HTMLElement]} element
    // @return {number(px)} y coordinate of the element
    static getOffsetTop(element) {
      if(!element) {
        throw new Error('param "element" of method "getOffsetTop" is not given!');
      }
      
      return element.offsetTop;
    }

    // get the x coordinate of the element relative to document
    // @param {[object HTMLElement]} element
    // @return {number(px)} x coordinate of the element
    static getPageX(element) {
      if(!element) {
        throw new Error('param "element" of method "getPageX" is not given!');
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
        throw new Error('param "element" of method "getPageY" is not given!');
      }
      
      let pageYOffset = window.pageYOffset; // current scrolling vertical offset of document
      let clientY = element.getBoundingClientRect().top;
      let pageY = pageYOffset + clientY;

      return pageY;
    }
  }

  // an abstract class of some video player states
  class State {
    // @param {[object Class]} classObject - an object `new` from a kind of Class
    constructor(classObject) {
      this.classObject = classObject;
    }

    buttonWasClicked() {
      throw new Error('method "buttonWasClicked" of super class must be overrided!');
    }
  }

  class LoadingState extends State {
    buttonWasClicked() {
      this.classObject.pauseVideo();
    }
  }

  class PlayingState extends State {
    buttonWasClicked() {
      this.classObject.pauseVideo();
    }
  }

  class PausingState extends State {
    buttonWasClicked() {
      this.classObject.playVideo();
    }
  }

  class PlayErrorState extends State {
    // @param {[object Class]} classObject - an object `new` from a kind of Class
    constructor(classObject) {
      const MEDIA_ERROR_CODE = {
        abort: 1, // MediaError.MEDIA_ERR_ABORTED, the fetching process for the `media resource` was aborted by the user agent at the user's request
        network: 2, // MediaError.MEDIA_ERR_NETWORK, a network error of some description caused the user agent to stop fetching the `media resource`, after the resource was established to be usable
        decode: 3, // MediaError.MEDIA_ERR_DECODE, an error of some description occurred while decoding the `media resource`, after the resource was established to be usable
        support: 4, // MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED, the `media resource` indicated by the src attribute was not suitable
      };
      const ERROR_MESSAGE = {
        network: '哎呀，网络好像出错了！\n刷新网页试一下:P',
        decode: '咦，视频解码错误，\n这一定不是我的锅，\n换其他视频看看:）',
        support: '天啦噜，视频不存在或者当前的浏览器不支持这个格式的视频:(，\n换其他视频看看',
      };

      super(classObject);
      this.mediaErrorCode = MEDIA_ERROR_CODE;
      this.errorMessage = ERROR_MESSAGE;
      this.errDisplay = $('.YangPlayer-error-prompt');
    }

    // Note: here `buttonWasClicked` doesn't mean which button was clicked, and it just means something must
    //       to be done after `PlayErrorState` state is triggered
    buttonWasClicked(code, intervalId) {
      this.displayErrorMsg(code, intervalId);
    }

    // @param {number} code - media error code
    displayErrorMsg(code, intervalId) {
      this.errDisplay.style.display = 'block';
      this.classObject.forbidEventBinding();

      for(let i in this.mediaErrorCode) {
        if(this.mediaErrorCode[i] === code) {
          this.errDisplay.innerHTML = this.errorMessage[i];
          window.clearInterval(intervalId);
        }
      }
    }
  }

  class NetworkState {
    // @param {[object Class]} classObject - an object `new` from a kind of Class
    constructor(classObject) {
      const NETWORK_STATE_CODE = {
        empty: 0, // HTMLMediaElement.NETWORK_EMPTY, the element has not yet been initialized. All attributes are in their initial states. The readyState is also HAVE_NOTHING
        idle: 1, // HTMLMediaElement.NETWORK_IDLE, the element's `resource selection algorithm` is active and has selected a `resource`, but it is not actually using the network at this time
        loading: 2, // HTMLMediaElement.NETWORK_LOADING, The user agent is actively trying to download data
        source: 3, // HTMLMediaElement.NETWORK_NO_SOURCE, the element's `resource selection algorithm` is active, but it has not yet found a `resource` to use
      };

      this.classObject = classObject;
      this.networkStateCode = NETWORK_STATE_CODE;
      this.errDisplay = $('.YangPlayer-error-prompt');
    }

    // @param {number} code - network state code
    sourceState(code, intervalId) {
      if(code === 3) {
        let message = '哎呀，这个视频地址的资源好像不见了！\n刷新网页或者换其他视频看看';

        this.errDisplay.style.display = 'block';
        this.classObject.forbidEventBinding();
        this.classObject.setErrorSign();
        this.errDisplay.innerHTML = message;
        window.clearInterval(intervalId);
      }
    }
  }

  class ReadyState {
    // @param {[object Class]} classObject - an object `new` from a kind of Class
    constructor(classObject) {
      const READY_STATE_CODE = {
        nothing: 0, // HTMLMediaElement.HAVE_NOTHING, no information is available about the media resource
        metadata: 1, // HTMLMediaElement.HAVE_METADATA, enough of the resource metadata (dimensions, track list, duration, etc) has been fetched and is available. No `media data` is available for the immediate `current playback position`
        current: 2, // HTMLMediaElement.HAVE_CURRENT_DATA, data is available for the `current playback position`, but not enough to actually play more than one frame
        future: 3, // HTMLMediaElement.HAVE_FUTURE_DATA, data for the `current playback position` as well as for at least a little bit of time into the future is available (in other words, at least two frames of video, for example)
        enough: 4, // HTMLMediaElement.HAVE_ENOUGH_DATA, enough data is available—and the download rate is high enough — that the media can be played through to the end without interruption
      };

      this.classObject = classObject;
      this.readyStateCode = READY_STATE_CODE;
    }

    // @param {number} code - ready state code
    toggleLoadingSign(code) {
      if(code < 3) {
        this.classObject.setLoadingSign();

        return;
      }
      if(code >= 3) {
        this.classObject.playVideo();
      }
    }
  }

  class NormalVolumeState extends State {
    buttonWasClicked() {
      this.classObject.muteVolume();
    }
  }

  class MuteVolumeState extends State {
    buttonWasClicked() {
      this.classObject.normalVolume();
    }
  }

  class SwitchOnState extends State {
    // @param {string} btnType
    //        => 'loop' - the button of looping video
    //        => 'auto' - the button of autoplaying video
    buttonWasClicked(btnType) {
      if(btnType) {
        if(btnType === 'loop') {
          this.classObject.loopPlayOff();

          return;
        }
        if(btnType === 'auto') {
          this.classObject.autoPlayOff();

          return;
        }

        throw new Error('param "btnType" of method "buttonWasClicked" is incorrect!');
      }

      throw new Error('param "btnType" of method "buttonWasClicked" is not given!');
    }
  }

  class SwitchOffState extends State {
    // @param {string} btnType
    //        => 'loop' - the button of looping video
    //        => 'auto' - the button of autoplaying video
    buttonWasClicked(btnType) {
      if(btnType) {
        if(btnType === 'loop') {
          this.classObject.loopPlayOn();

          return;
        }
        if(btnType === 'auto') {
          this.classObject.autoPlayOn();

          return;
        }

        throw new Error('param "btnType" of method "buttonWasClicked" is incorrect!');
      }

      throw new Error('param "btnType" of method "buttonWasClicked" is not given!');
    }
  }

  // a class of control-play button
  class ControlPlay {
    // @param {[object HTMLElement]} player
    constructor(player) {
      // current possible states of video player
      this.loadingState = new LoadingState(this);
      this.playingState = new PlayingState(this);
      this.pausingState = new PausingState(this);
      this.playErrorState = new PlayErrorState(this);

      this.player = player;
      this.playButton = $('.YangPlayer-play-button');
      this.pauseButton = $('.YangPlayer-pause-button');
      this.playCircle = $('.YangPlayer-play-circle');
      this.playLoading = $('.YangPlayer-loading');
      this.controlPlayButton = $('.YangPlayer-controlPlay-button');
      this.replayButton = $('.YangPlayer-replay');
      this.playerState = YangPlayer_GLOBAL.playerPlayState;
      this.readyState = new ReadyState(this);
      this.networkState = new NetworkState(this);
    }

    init() {
      this.player.oncanplaythrough = () => {
        this.setPausingSign();

        this.controlPlayButton.onclick = () => {
          this.playerState.buttonWasClicked();
        };

        this.player.onclick = () => {
          this.playerState.buttonWasClicked();
        };

        this.playCircle.onclick = () => {
          this.playerState.buttonWasClicked();
        };

        document.onkeydown = (event) => {
          let keyCode = event.key || event.keyCode; // be careful that `event.keyCode` has been removed from the Web standards
          
          if(keyCode === ' ' || keyCode === 32) { // the Unicode vaule of `Space`
            this.playerState.buttonWasClicked();
          }
        };

        this.player.oncanplaythrough = null; // remove this event binding after video first can be played through
      };
    }

    // @param {number} intervalId - a numeric, non-zero value which identifies the timer created by the call to setInterval()
    listenError(intervalId) {
      if(this.player.error) {
        let errorCode = this.player.error.code;

        if(errorCode === 1) {
          return;
        }

        this.setErrorSign();
        this.playerState.buttonWasClicked(errorCode, intervalId);
      }
    }

    listenReadyState() {
      if(!this.player.paused) {
        let readyCode = this.player.readyState;

        this.readyState.toggleLoadingSign(readyCode);
      }
    }

    // @param {number} intervalId - a numeric, non-zero value which identifies the timer created by the call to setInterval()
    listenNetwork(intervalId) {
      let networkCode = this.player.networkState;

      this.networkState.sourceState(networkCode, intervalId);
    }

    listenAll(intervalId) {
      this.listenReadyState();
      this.listenError(intervalId);
      this.listenNetwork(intervalId);
    }

    forbidEventBinding() {
      this.controlPlayButton.onclick = null;
      this.player.onclick = null;
      this.playCircle.onclick = null;
      document.onkeydown = null;
    }

    setErrorSign() {
      this.playLoading.style.display = 'none';
      this.player.style.opacity = 0;
      this.playCircle.style.display = 'none';
      this.pauseButton.style.display = 'none';
      this.playButton.style.display = 'inline-block';
      this.setState(this.playErrorState);
    }

    setLoadingSign() {
      this.playLoading.style.display = 'block';
      this.player.style.opacity = .5;
      this.playCircle.style.display = 'none';
      this.pauseButton.style.display = 'inline-block';
      this.playButton.style.display = 'none';
      this.setState(this.loadingState);
    }

    setPausingSign() {
      this.playLoading.style.display = 'none';
      this.player.style.opacity = .5;
      this.playCircle.style.display = 'block';
      this.pauseButton.style.display = 'none';
      this.playButton.style.display = 'inline-block';
      this.setState(this.pausingState);
    }

    setPlayingSign() {
      this.playLoading.style.display = 'none';
      this.replayButton.style.display = 'none';
      this.playButton.style.display = 'none';
      this.pauseButton.style.display = 'inline-block';
      this.player.style.opacity = 1;
      this.playCircle.style.display = 'none';
      this.setState(this.playingState);
    }

    setReplayPausingSign() {
      this.playLoading.style.display = 'none';
      this.player.style.opacity = .5;
      this.playCircle.style.display = 'none';
      this.replayButton.style.display = 'block';
      this.playButton.style.display = 'inline-block';
      this.pauseButton.style.display = 'none';
      this.setState(this.pausingState);
    }

    // @param {object} progressBarObj - an object `new` from Class `ProgressBars`
    replayVideo(progressBarObj) {
      progressBarObj.progressDragButton.style.left = 0;
      progressBarObj.progressPlayedbarDisplay();
      this.playVideo();
    }

    // @param {object} progressBarObj - an object `new` from Class `ProgressBars`
    setReplayEventBinding(progressBarObj) {
      this.setReplayPausingSign();

      this.controlPlayButton.onclick = () => {
        this.replayVideo(progressBarObj);
        this.restoreDefaultBinding();
      };

      this.replayButton.onclick = () => {
        this.replayVideo(progressBarObj);
        this.restoreDefaultBinding();
      };

      this.player.onclick = () => {
        this.replayVideo(progressBarObj);
        this.restoreDefaultBinding();
      };

      document.onkeydown = (event) => {
        let keyCode = event.key || event.keyCode; // be careful that `event.keyCode` has been removed from the Web standards
          
        if(keyCode === ' ' || keyCode === 32) { // the Unicode vaule of `Space`
          this.replayVideo(progressBarObj);
          this.restoreDefaultBinding();
        }
      };
    }

    // restore default playing or pausing binding after replayBtn was clicked
    restoreDefaultBinding() {
      this.controlPlayButton.onclick = () => {
        this.playerState.buttonWasClicked();
      };

      this.replayButton.onclick = null;

      this.player.onclick = () => {
        this.playerState.buttonWasClicked();
      };

      document.onkeydown = (event) => {
        let keyCode = event.key || event.keyCode; // be careful that `event.keyCode` has been removed from the Web standards
        
        if(keyCode === ' ' || keyCode === 32) { // the Unicode vaule of `Space`
          this.playerState.buttonWasClicked();
        }
      };
    }

    // Note: In Chrome 55, `MediaElement.play()` will return a promise, so it is async
    playVideo() {
      let error = 'AbortError: The play() request was interrupted by a call to pause().';

      this.setPlayingSign();

      let promise = this.player.play();

      promise
      .catch((e) => {
        // avoid Chrome `AbortError` bug
        if(e.toString() === error) {
          console.log('Abort `play` promise.');

          return;
        }
        console.log(e);
      });
    }

    // Note: `MediaElement.pause()` won't return a promise and return nothing. It is not async.
    //        If `pause()` method is triggered before the promise of `MediaElement.play()`
    //        is resolved, it will produce an error: "The play() request was interrupted by a call to
    //        pause()". You can use timer to delay `pause()` if you need.
    //        Find more info here: https://html.spec.whatwg.org/multipage/embedded-content.html#dom-media-pause
    pauseVideo() {
      this.setPausingSign();

      this.player.pause();
    }
    
    // @param {[object State]} playerState - the state of video player
    setState(playerState) {
      YangPlayer_GLOBAL.playerPlayState = playerState;

      this.playerState = playerState;
    }
  }

  // a class of video player volume
  class Volume {
    // @param {[object HTMLElement]} player
    constructor(player) {
      const VOLUME_MIDDLE_NUMBER = 50;
      const VOLUME_MIDDLE_VALUE = .5;
      const VOLUME_MIDDLE_BAR_HEIGHT = 28; // the height from the bottom of volumeDragButton to the bottom of volumeBar when volume is middle (unit: px)
      const VOLUME_MIN_MOUSE_MAXY = 56; // mouse max y offset(px) relative to volumeBar when volume is min (unit: px)

      // current possible state of volume button
      this.normalVolumeState = new NormalVolumeState(this);
      this.muteVolumeState = new MuteVolumeState(this);

      this.player = player;
      this.volumeButton = $('.YangPlayer-volume-button');
      this.volumeUpButton = $('.YangPlayer-volume-up');
      this.volumeDownButton = $('.YangPlayer-volume-down');
      this.volumeOffButton = $('.YangPlayer-volume-off');
      this.volumeChangeRect = $('.YangPlayer-volume-change');
      this.volumeNumber = $('.YangPlayer-volume-number');
      this.midVolumeBarH = VOLUME_MIDDLE_BAR_HEIGHT;
      this.volumeNumberValue = VOLUME_MIDDLE_NUMBER; // relative to 100(1 - 100), default: 50
      this.realVolumeValue = VOLUME_MIDDLE_VALUE; // relative to 1(0.01 - 1.00), default: 0.5
      this.volumeBar = $('.YangPlayer-volume-bar');
      this.volumeDragButton = $('.YangPlayer-volume-dragButton');
      this.currentVolumeReverseBar = $('.YangPlayer-currentVolume-reverseBar');
      this.currentVolumeBarH = VOLUME_MIDDLE_BAR_HEIGHT; // the height from the bottom of volumeDragButton to the bottom of volumeBar, default: 28
      this.mouseYMax = VOLUME_MIN_MOUSE_MAXY; // mouse max y offset(px) relative to volumeBar when volume is min, being equal to max `this.currentVolumeBarH`
      this.volumeState = null;
      this.mousedownFired = false;
    }

    init() {
      this.setState(this.normalVolumeState);
      this.displayVolumeButton(); // display different volume button
      this.normalVolume(); // change volume to normal volume
      this.controlVolumeButton(); // let user change volume by controling the position of drag button

      this.volumeButton.onclick = () => {
        if(this.mousedownFired) {
          this.mousedownFired = false;

          return;
        }

        this.volumeState.buttonWasClicked();
      };

      this.volumeChangeRect.onclick = () => {
        this.mousedownFired = true;
      };
    }

    // control the drag button of volume to adjust volume
    // @param {number(px)} [mouseYOffset] - the y offset you need to set the drag button
    controlVolumeButton(mouseYOffset) {
      let volumeDragButtonX = Number.parseInt(window.getComputedStyle(this.volumeDragButton).left);

      // if mouseYOffset is given
      if(mouseYOffset) {
        Utility.offset({
          top: mouseYOffset,
          left: volumeDragButtonX,
        }, this.volumeDragButton);

        this.currentVolumeReverseBar.style.height = `${Utility.getOffsetTop(this.volumeDragButton) / Utility.outerHeight(this.volumeBar) * 100}%`;

        return;
      }

      this.volumeDragButton.onmousedown = (event1) => {
        // mousedown event will trigger click event and the click event will bubble to parents elements
        // the order in Chrome is: mousedown, mouseup, click
        // in order to avoid click event being triggered by mousedown, use flag `mousedownFired` to judge if `this.volumeButton.onclick` should happen
        this.mousedownFired = true;

        Utility.addClass('draggable', this.volumeDragButton);

        this.volumeDragButton.onmousemove = (event2) => {
          // current mouse y offset
          let mouseY = event2.pageY - (Utility.outerHeight(this.volumeDragButton) / 2) - Utility.getPageY(this.volumeBar);
          // correct mouse y offset after adjusting
          let adjustMouseY = (mouseY <= 0) ? 0 : (mouseY >= this.mouseYMax ? this.mouseYMax : mouseY);

          Utility.offset({
            top: adjustMouseY,
            left: volumeDragButtonX,
          }, $('.draggable'));

          this.currentVolumeReverseBar.style.height = `${Utility.getOffsetTop(this.volumeDragButton) / Utility.outerHeight(this.volumeBar) * 100}%`;

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
    }

    // display volumeButton
    // @param {string} [type] - the volume type you want to display
    //        => 'normal' - volume = 0.5
    //        => 'mute' - volume = 0
    displayVolumeButton(type) {
      // if type is given
      if(type) {
        if(type === 'normal') {
          this.displayWhichVolumeBtn('up');

          return;
        }

        if(type === 'mute') {
          this.displayWhichVolumeBtn('off');

          return;
        }
      }

      this.volumeButton.onmouseover = () => {
        this.volumeChangeRect.style.opacity = 1;
        this.volumeChangeRect.style.visibility = 'visible';
        this.volumeButton.style.backgroundColor = '#ccc';

        this.volumeChangeRect.onmousemove = () => {
          if(this.volumeNumberValue === 0) {
            this.displayWhichVolumeBtn('off');

            return;
          }

          if(this.volumeNumberValue > 0 && this.volumeNumberValue < 50) {
            this.displayWhichVolumeBtn('down');

            return;
          }

          this.displayWhichVolumeBtn('up');
        };
      };

      this.volumeButton.onmouseout = () => {
        this.volumeChangeRect.style.opacity = 0;
        this.volumeChangeRect.style.visibility = 'hidden';
        this.volumeButton.style.backgroundColor = '#eee';
      };
    }

    // @param {string} type
    //        => 'down' - volumeDownButton
    //        => 'up' - volumeUpButton
    //        => 'off' - volumeOffButton
    displayWhichVolumeBtn(type) {
      this.volumeDownButton.style.display = 'none';
      this.volumeUpButton.style.display = 'none';
      this.volumeOffButton.style.display = 'none';

      if(type === 'down') {
        this.volumeDownButton.style.display = 'inline-block';
      }
      else if(type === 'up') {
        this.volumeUpButton.style.display = 'inline-block';
      }
      else if(type === 'off') {
        this.volumeOffButton.style.display = 'inline-block';
      }
    }

    // set normal volume
    normalVolume() {
      this.changeVolume(this.midVolumeBarH); // change real volume
      this.controlVolumeButton(this.midVolumeBarH); // change the position of drag button
      this.displayVolumeButton('normal'); // display different volume button
      this.setState(this.normalVolumeState);
    }

    // set mute volume
    muteVolume() {
      this.changeVolume(0); // change real volume
      this.controlVolumeButton(this.mouseYMax); // change the position of drag button
      this.displayVolumeButton('mute'); // display different volume button
      this.setState(this.muteVolumeState);
    }

    // set the state of volume button
    // @param {[object State]} volumeBtnState
    setState(volumeBtnState) {
      this.volumeState = volumeBtnState;
    }
   }

  // a class of video player progress bar
  class ProgressBar {
    // @param {[object HTMLElement]} player
    constructor(player) {
      this.player = player;
      this.intervalId = null; // store the ID of `window.setInterval()`
      this.intervalFunc = null;
      this.progressBar = $('.YangPlayer-progress');
      this.progressPlayedbar = $('.YangPlayer-playedbar');
      this.progressBufferedbar = $('.YangPlayer-bufferedbar');
      this.playedTime = $('.YangPlayer-played-time');
      this.totalTime = $('.YangPlayer-total-time');
      this.progressDragButton = $('.YangPlayer-progress-dragButton');

      // mouse max x offset when progress is end
      this.mouseXMax = () => (Utility.outerWidth(this.progressBar) - Utility.outerWidth(this.progressDragButton));
    }

    init() {
      ProgressBar.setProgressLength();
      this.progressPlayedbarDisplay();
      this.controlProgressButton();
    }

    // set the percent width of the progress bar
    static setProgressLength() {
      // the offsetWidth of video(controlsBar) is 0 when Safari 10 is in fullscreen mode, so choose to use `window.innerWidth` to get its width
      let controlsLength = (Utility.isWhichBrowser('Safari') && document.webkitIsFullScreen) ? window.innerWidth : Utility.outerWidth($('#YangPlayer'));

      let playBtnLength = Utility.outerWidth($('.YangPlayer-controlPlay-button'));
      let timeBarLength = Utility.outerWidth($('.YangPlayer-time'));
      let volumeBtnLength = Utility.outerWidth($('.YangPlayer-volume-button'));
      let screenModeLength = Utility.outerWidth($('.YangPlayer-screen-mode'));
      let settingBtnLength = Utility.outerWidth($('.YangPlayer-setting-button'));
      let progressLength = controlsLength - playBtnLength - timeBarLength - volumeBtnLength - screenModeLength - settingBtnLength - 30;

      $('.YangPlayer-progress').style.width = `${progressLength / controlsLength * 100}%`;
    }

    // control the drag button of progress bar to adjust playback position
    // @param {number(px)} [mouseXOffset] - the x offset you need to set the drag button
    // @param {object} [controlPlayObj] - an object `new` form Class `ControlPlay`
    controlProgressButton(mouseXOffset, controlPlayObj) {
      let progressDragButtonY = Number.parseInt(window.getComputedStyle(this.progressDragButton).top);
      let controlPlayObject = controlPlayObj;

      // if mouseXOffset is given
      if(mouseXOffset) {
        Utility.offset({
          top: progressDragButtonY,
          left: mouseXOffset,
        }, this.progressDragButton);

        this.progressPlayedbar.style.width = `${Utility.getOffsetLeft(this.progressDragButton) / Utility.outerWidth(this.progressBar) * 100}%`;

        return;
      }

      this.progressDragButton.onmousedown = (event1) => {
        Utility.addClass('draggable', this.progressDragButton);

        this.progressDragButton.onmousemove = (event2) => {
          // current mouse x offset
          let mouseX = event2.pageX - (Utility.outerWidth(this.progressDragButton) / 2) - Utility.getPageX(this.progressBar);
          // correct mouse x offset after adjusting
          let adjustMouseX = (mouseX <= 0) ? 0 : (mouseX >= this.mouseXMax() ? this.mouseXMax() : mouseX);

          Utility.offset({
            top: progressDragButtonY,
            left: adjustMouseX,
          }, $('.draggable'));

          this.progressPlayedbar.style.width = `${(Utility.getOffsetLeft(this.progressDragButton)) / Utility.outerWidth(this.progressBar) * 100}%`;

          if(this.player.paused) {
            controlPlayObject.playVideo();
            this.intervalId = window.setInterval(this.intervalFunc, 1000);
          }

          // change real currentTime
          this.player.currentTime = Utility.getOffsetLeft(this.progressDragButton) * this.player.duration / this.mouseXMax();

          event2.preventDefault();
        };

        this.progressDragButton.onmouseup = (event3) => {
          Utility.removeClass('draggable', this.progressDragButton);

          this.progressDragButton.onmousemove = null; // remove mousemove event binding

          event3.preventDefault();
        };

        this.progressDragButton.onmouseout = (event4) => {
          Utility.removeClass('draggable', this.progressDragButton);

          this.progressDragButton.onmousemove = null; // remove mousemove event binding

          event4.preventDefault();
        };

        event1.preventDefault();
      };
    }

    progressPlayedbarDisplay() {
      this.player.currentTime = 0;
      this.progressPlayedbar.style.width = 0;
      this.progressBufferedbar.style.width = 0;

      let controlPlayObj = new ControlPlay(this.player);

      this.intervalFunc = () => {
        if(this.player.duration > 0) {
          let playedPercent = `${Math.floor(this.player.currentTime / this.player.duration * 100)}%`;
          let mouseXOffset = this.player.currentTime * this.mouseXMax() / this.player.duration;

          this.progressPlayedbar.style.display = 'block';
          this.progressPlayedbar.style.width = playedPercent;
          this.progressTimeDisplay(this.player.currentTime, this.player.duration);
          this.controlProgressButton(mouseXOffset, controlPlayObj);
        }

        controlPlayObj.listenAll(this.intervalId);

        if(this.player.ended) {
          controlPlayObj.setReplayEventBinding(this);

          window.clearInterval(this.intervalId);
        }

        this.progressBufferedDisplay();
      };

      this.intervalId = window.setInterval(this.intervalFunc, 1000);
    }

    progressBufferedDisplay() {
      if(this.player.buffered.length > 0) {
        let bufferedPercent = `${Math.floor(this.player.buffered.end(0) / this.player.duration * 100)}%`;

        this.progressBufferedbar.style.display = 'block';
        this.progressBufferedbar.style.width = bufferedPercent;
      }
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

  // a class of video player setting button
  class SettingBtn {
    // @param {[object HTMLElement]} player
    constructor(player) {
      const PLAYBACK_RATE = [0.5, 1.0, 1.5, 2.0, 4.0];

      this.switchOnState = new SwitchOnState(this);
      this.switchOffState = new SwitchOffState(this);

      this.player = player;
      this.settingBtn = $('.YangPlayer-setting-button');
      this.settingPane = $('.YangPlayer-setting-pane');
      this.loopSwitch = $('.YangPlayer-loop-switch');
      this.loopSwitchOn = $('.YangPlayer-loop-on');
      this.loopSwitchOff = $('.YangPlayer-loop-off');
      this.autoSwitch = $('.YangPlayer-auto-switch');
      this.autoSwitchOn = $('.YangPlayer-auto-on');
      this.autoSwitchOff = $('.YangPlayer-auto-off');
      this.rateBtn = $('.YangPlayer-rate-btn');
      this.rate = PLAYBACK_RATE;
      this.loopState = null;
      this.autoState = null;
    }

    init() {
      this.setSwitchState(this.switchOffState, 'loop');
      this.setSwitchState(this.switchOffState, 'auto');

      this.displaySettingBtn();

      this.loopSwitch.onclick = () => {
        this.loopState.buttonWasClicked('loop');
      };

      this.autoSwitch.onclick = () => {
        this.autoState.buttonWasClicked('auto');
      };

      this.controlPlayRate();
    }

    displaySettingBtn() {
      this.settingBtn.onmouseover = () => {
        this.settingPane.style.opacity = 1;
        this.settingPane.style.visibility = 'visible';
        this.settingBtn.style.backgroundColor = '#ccc';
      };

      this.settingBtn.onmouseout = () => {
        this.settingPane.style.opacity = 0;
        this.settingPane.style.visibility = 'hidden';
        this.settingBtn.style.backgroundColor = '#eee';
      };
    }

    // control play rate by button
    controlPlayRate() {
      for(let i = 0; i < this.rateBtn.children.length; i++) {
        this.rateBtn.children[i].onclick = () => {
          for(let j = 0; j < this.rateBtn.children.length; j++) {
            this.rateBtn.children[j].style.opacity = .4;
          }

          this.rateBtn.children[i].style.opacity = 1;
          this.setPlayRate(this.rate[i]);
        };
      }
    }

    loopPlayOn() {
      this.loopSwitchOff.style.display = 'none';
      this.loopSwitchOn.style.display = 'inline-block';
      this.player.loop = true;
      this.setSwitchState(this.switchOnState, 'loop');
    }

    loopPlayOff() {
      this.loopSwitchOff.style.display = 'inline-block';
      this.loopSwitchOn.style.display = 'none';
      this.player.loop = false;
      this.setSwitchState(this.switchOffState, 'loop');
    }

    autoPlayOn() {
      this.autoSwitchOff.style.display = 'none';
      this.autoSwitchOn.style.display = 'inline-block';
      this.player.autoplay = true;
      this.setSwitchState(this.switchOnState, 'auto');

      if(this.player.paused) {
        let player = new ControlPlay(this.player);

        player.playVideo();
      }
    }

    autoPlayOff() {
      this.autoSwitchOff.style.display = 'inline-block';
      this.autoSwitchOn.style.display = 'none';
      this.player.autoplay = false;
      this.setSwitchState(this.switchOffState, 'auto');
    }

    // @param {number} rate - playback rate
    setPlayRate(rate) {
      this.player.playbackRate = rate;
    }

    // @param {[object State]} switchState
    // @param {string} switchType
    //        => 'loop' - the button of looping video
    //        => 'auto' - the button of autoplaying video
    setSwitchState(switchState, switchType) {
      if(switchType) {
        if(switchType === 'loop') {
          this.loopState = switchState;

          return;
        }
        if(switchType === 'auto') {
          this.autoState = switchState;

          return;
        }

        throw new Error('second param "switchType" of method "setSwitchState" is incorrect!');
      }
      
      throw new Error('second param "switchType" of method "setSwitchState" is not given!');
    }
  }

  // a class controling the mode of video player screen
  class ScreenMode {
    // @param {[object HTMLElement]} player
    constructor(player) {
      this.player = player;
      this.playerContainer = $('.YangPlayer-container');
      this.controlBar = $('.YangPlayer-control');
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
          let fullscreenElement = document.mozCancelFullScreen ? this.playerContainer : this.player;

          this.toggle(fullscreenElement);
            // .then(
            //   function fullfilled(val) {
            //     // invalid: `ProgressBar.setProgressLength();`
            //     // window.setTimeout(() => ProgressBar.setProgressLength(), 100);
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

        return;
      }
      
      throw new Error('Current browser doesn\'t support Fullscreen API!');
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

        this.controlBarBox.onmouseenter = null;
        this.controlBar.onmouseleave = null;
        this.controlBar.style.transition = 'none';
        this.controlBar.style.opacity = 1;
        this.controlBar.style.visibility = 'visible';
      }
      else {
        this.fullscreenButton.style.display = 'none';
        this.minscreenButton.style.display = 'inline-block';
        this.controlBar.style.transition = 'all 0.5s linear';

        this.controlBar.onmouseleave = () => {
          this.controlBar.style.opacity = 0;
          this.controlBar.style.visibility = 'hidden';
        };

        this.controlBarBox.onmouseenter = () => {
          this.controlBar.style.opacity = 1;
          this.controlBar.style.visibility = 'visible';
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
      this.controlPlay = null; // the button controling playing and pausing
      this.progressBar = null; // the progress bar and its time bar
      this.volumeButton = null; // the button controling volume in control bar
      this.settingButton = null; // the button controling setting
      this.screenMode = null; // the button controling fullscreen and minscreen
    }

    init() {
      // initialize control-play button and related loading img and pausing play-circle
      this.controlPlay = new ControlPlay(this.YangPlayer);
      this.controlPlay.init();

      // initialize progress bar
      this.progressBar = new ProgressBar(this.YangPlayer);
      this.progressBar.init();

      // initialize volume button
      this.volumeButton = new Volume(this.YangPlayer);
      this.volumeButton.init();

      // initialize setting button
      this.settingButton = new SettingBtn(this.YangPlayer);
      this.settingButton.init();

      // initialize screen mode button
      this.screenMode = new ScreenMode(this.YangPlayer);
      this.screenMode.init();
    }
  }

  let player = new YangPlayer();
  player.init();
})();
