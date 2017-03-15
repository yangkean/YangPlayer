(function() {
  'use strict';

  const YangPlayer_GLOBAL = {
    playerPlayState: null, // {object} store the play state of video
    isFullscreen: false, // {boolean}
    controlPlay: null, // {object} `new` from Class `ControlPlay`
    progressBar: null, // {object} `new` from Class `ProgressBar`
    settingBtn: null, // {object} `new` from Class `SettingBtn`
    bulletScreen: null, // {object} `new` from Class `BulletScreen`
  };

  // @param {string} selector - a CSS selector string
  function $(selector) {
    return document.querySelector(selector);
  }

  // a utility class containing some utilities
  class Utility {
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
      let isOpera = () => (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

      // Firefox 1.0+
      let isFirefox = () => typeof InstallTrigger !== 'undefined';

      // Internet Explorer 6-11
      let isIE = () => /*@cc_on!@*/false || !!document.documentMode;

      // Edge 20+
      let isEdge = () => !isIE() && !!window.StyleMedia;

      // Chrome 1+
      let isChrome = () => !!window.chrome && !!window.chrome.webstore;

      // Safari 3.0+
      let isSafari = () => (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0)
                     || (!isChrome() && !isOpera() && window.webkitAudioContext !== undefined);

      let browserObj = {
        opera: isOpera,
        firefox: isFirefox,
        safari: isSafari,
        ie: isIE,
        edge: isEdge,
        chrome: isChrome,
      };

      return browserObj[browserName]();
    }

    // add a class name for a html element
    // @param {string} className
    // @param {[object HTMLElement]} element
    static addClass(className, element) {
      if(!element) {
        throw new Error('second param "element" of method "addClass" is not given!');
      }
      
      let currentClassName = element.className ? `${element.className} ` : '';

      element.className = `${currentClassName}${className}`;
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

    // search a class name for a html element or an array of several elements
    // @param {string} className
    // @param {[object HTMLElement]} element - a single element
    // @return {boolean} `true` if exists, otherwise `false`
    static hasClass(className, element) {
      if(!element) {
        throw new Error('second param "element" of method "hasClass" is not given!');
      }
      
      return element.className.includes(className);
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

      // element.parentNode.style.position = window.getComputedStyle(element.parentNode).position || 'relative';
      // in this library, the above line doesn't need
      element.style.cssText += `position: absolute; left: ${offsetX}px; top: ${offsetY}px`;
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

    // get the x real-time offset of the element relative to its parent node
    // @param {[object HTMLElement]} element
    // @return {number(px)} x coordinate of the element
    static getOffsetLeft(element) {
      if(!element) {
        throw new Error('param "element" of method "getOffsetLeft" is not given!');
      }

      let offsetLeft = element.getBoundingClientRect().left - element.parentNode.getBoundingClientRect().left;

      return Math.round(offsetLeft);
    }

    // get the y real-time coordinate of the element relative to its parent node
    // @param {[object HTMLElement]} element
    // @return {number(px)} y coordinate of the element
    static getOffsetTop(element) {
      if(!element) {
        throw new Error('param "element" of method "getOffsetTop" is not given!');
      }
      
      let offsetTop = element.getBoundingClientRect().top - element.parentNode.getBoundingClientRect().top;

      return Math.round(offsetTop);
    }

    // in order to optimize performance, this method can offer `width`, `height`, `offsetLeft`, `offsetRight`,
    // `offsetTop`, `parentWidth`, `parentHeight` of the element relative to its parent node at a time
    // @param {[object HTMLElement]} element
    // @return {object} an object containing properties mentioned above
    static getOffsetAndLength(element) {
      if(!element) {
        throw new Error('param "element" of method "getOffsetAndLength" is not given!');
      }

      let elementClientRect = element.getBoundingClientRect();
      let parentClientRect = element.parentNode.getBoundingClientRect();

      return {
        width: elementClientRect.width,
        height: elementClientRect.height,
        offsetLeft: Math.round(elementClientRect.left - parentClientRect.left),
        offsetRight: Math.round(parentClientRect.right - elementClientRect.right),
        offsetTop: Math.round(elementClientRect.top - parentClientRect.top),
        parentWidth: parentClientRect.width,
        parentHeight: parentClientRect.height,
      };
    }

    // get the x real-time coordinate of the element relative to document
    // @param {[object HTMLElement]} element
    // @return {number(px)} x coordinate of the element
    static getPageX(element) {
      if(!element) {
        throw new Error('param "element" of method "getPageX" is not given!');
      }
      
      let pageXOffset = window.pageXOffset; // current scrolling horizontal offset of document
      let clientX = element.getBoundingClientRect().left;
      let pageX = pageXOffset + clientX;

      return Math.round(pageX);
    }

    // get the y real-time coordinate of the element relative to document
    // @param {[object HTMLElement]} element
    // @return {number(px)} y coordinate of the element
    static getPageY(element) {
      if(!element) {
        throw new Error('param "element" of method "getPageY" is not given!');
      }
      
      let pageYOffset = window.pageYOffset; // current scrolling vertical offset of document
      let clientY = element.getBoundingClientRect().top;
      let pageY = pageYOffset + clientY;

      return Math.round(pageY);
    }

    // control moving of drag button of slide bar
    // @param {object} obj - an object containing following properties:
    //        => {string} orientation - the orientation of slidebar(parent node), `v` for 'vertical' or `h` for 'horizontal'
    //        => {number(px)} fixedOffset - the offset of the orientation that is non-slide of the dragBtn relative to slidebar
    //        => {number(px)|function} mouseMaxOffset - mouse max x(y) offset when dragBtn is at the end(bottom) of slidebar relative to slide bar
    //        => {[object HTMLElement]} dragBtn
    //        => {[object HTMLElement]} slidebar
    //        => {function} mousedownCb - callback function executed when `mousedown` event is triggered
    //        => {function} mousemoveCb
    //        => {function} mouseupCb
    //        => {function} mouseoutCb
    //        => {object} context
    static sliderDragBtn(obj) {
      let orientation = obj.orientation;
      let fixedOffset = obj.fixedOffset;
      let mouseMaxOffset = obj.mouseMaxOffset;
      let dragBtn = obj.dragBtn;
      let slidebar = obj.slidebar;
      let mousedownCb = obj.mousedownCb || (function() {});
      let mousemoveCb = obj.mousemoveCb || (function() {});
      let mouseupCb = obj.mouseupCb || (function() {});
      let mouseoutCb = obj.mouseoutCb || (function() {});
      let context = obj.context;
      let mouseOffset = null;
      let adjustMouseOffset = null;
      let d = null;

      dragBtn.onmousedown = (event1) => {
        Utility.addClass('YangPlayer-draggable', dragBtn);

        mousedownCb.call(context);

        dragBtn.onmousemove = (event2) => {
          if(orientation === 'v') {
            // current mouse y offset
            mouseOffset = event2.pageY - (Utility.outerHeight(dragBtn) / 2) - Utility.getPageY(slidebar);
          }
          else if(orientation === 'h') {
            // current mouse x offset
            mouseOffset = event2.pageX - (Utility.outerWidth(dragBtn) / 2) - Utility.getPageX(slidebar);
          }
          else {
            throw new Error('the type of `orientation` is incorrect');
          }

          // correct mouse offset after adjusting
          if((typeof mouseMaxOffset) === 'number') {
            adjustMouseOffset = (mouseOffset <= 0) ? 0 : (mouseOffset >= mouseMaxOffset ? mouseMaxOffset : mouseOffset);
          }
          else if((typeof mouseMaxOffset) === 'function') {
            adjustMouseOffset = (mouseOffset <= 0) ? 0 : (mouseOffset >= (d = mouseMaxOffset.call(context)) ? d : mouseOffset);
          }
          else {
            throw new Error('the type of `mouseMaxOffset` is incorrect');
          }

          if(orientation === 'v') {
            Utility.offset({
              top: adjustMouseOffset,
              left: fixedOffset,
            }, $('.YangPlayer-draggable'));
          }
          else if(orientation === 'h') {
            Utility.offset({
              top: fixedOffset,
              left: adjustMouseOffset,
            }, $('.YangPlayer-draggable'));
          }

          mousemoveCb.call(context, adjustMouseOffset);

          event2.preventDefault();
        };

        dragBtn.onmouseup = (event3) => {
          Utility.removeClass('YangPlayer-draggable', dragBtn);

          dragBtn.onmousemove = null; // remove mousemove event binding

          mouseupCb.call(context);

          event3.preventDefault();
        };

        dragBtn.onmouseout = (event4) => {
          Utility.removeClass('YangPlayer-draggable', dragBtn);

          dragBtn.onmousemove = null; // remove mousemove event binding

          mouseoutCb.call(context);

          event4.preventDefault();
        };

        event1.preventDefault();
      };
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

      if(YangPlayer_GLOBAL.bulletScreen.bulletScreenStatus) {
        YangPlayer_GLOBAL.bulletScreen.controlPauseBulletScreen();
      }
    }
  }

  class PausingState extends State {
    buttonWasClicked() {
      this.classObject.playVideo();

      if(YangPlayer_GLOBAL.bulletScreen.bulletScreenStatus) {
        YangPlayer_GLOBAL.bulletScreen.controlContinueBulletScreen();
      }
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
    buttonWasClicked(code) {
      this.displayErrorMsg(code);
    }

    // @param {number} code - media error code
    displayErrorMsg(code) {
      this.errDisplay.style.display = 'block';
      this.classObject.forbidEventBinding();
      YangPlayer_GLOBAL.progressBar.forbidEventBinding();
      YangPlayer_GLOBAL.settingBtn.forbidEventBinding();
      YangPlayer_GLOBAL.bulletScreen.forbidEventBinding();
      this.classObject.setErrorSign();
      window.clearInterval(YangPlayer_GLOBAL.progressBar.intervalId);
      YangPlayer_GLOBAL.progressBar.intervalId = null;
      window.clearInterval(YangPlayer_GLOBAL.bulletScreen.intervalId);
      YangPlayer_GLOBAL.bulletScreen.intervalId = null;

      for(let i in this.mediaErrorCode) {
        if(this.mediaErrorCode[i] === code) {
          this.errDisplay.innerHTML = this.errorMessage[i];
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
    sourceState(code) {
      if(code === 3) {
        let message = '哎呀，这个视频地址的资源好像不见了！\n刷新网页或者换其他视频看看';

        this.errDisplay.style.display = 'block';
        this.classObject.forbidEventBinding();
        YangPlayer_GLOBAL.progressBar.forbidEventBinding();
        YangPlayer_GLOBAL.settingBtn.forbidEventBinding();
        YangPlayer_GLOBAL.bulletScreen.forbidEventBinding();
        this.classObject.setErrorSign();
        window.clearInterval(YangPlayer_GLOBAL.progressBar.intervalId);
        YangPlayer_GLOBAL.progressBar.intervalId = null;
        window.clearInterval(YangPlayer_GLOBAL.bulletScreen.intervalId);
        YangPlayer_GLOBAL.bulletScreen.intervalId = null;
        this.errDisplay.innerHTML = message;
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

        // pause bulletscreens when video player is in loading state
        if(YangPlayer_GLOBAL.bulletScreenStatus) {
          YangPlayer_GLOBAL.bulletScreen.controlPauseBulletScreen();
        }

        return;
      }
      if(code >= 3 && !this.classObject.player.paused) {
        this.classObject.playVideo();

        if(YangPlayer_GLOBAL.bulletScreenStatus) {
          YangPlayer_GLOBAL.bulletScreen.controlContinueBulletScreen();
        }
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

      YangPlayer_GLOBAL.controlPlay = this;
      this.player = player;
      this.playerLayer = $('.YangPlayer-video-layer');
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
        if(this.player.paused) {
          this.setPausingSign();
        }

        this.controlPlayButton.onclick = () => {
          this.playerState.buttonWasClicked();
        };

        this.playerLayer.onclick = () => {
          this.playerState.buttonWasClicked();
        };

        this.playCircle.onclick = () => {
          this.playerState.buttonWasClicked();
        };

        this.player.oncanplaythrough = null; // remove this event binding after video first can be played through
      };
    }

    listenError() {
      if(this.player.error) {
        let errorCode = this.player.error.code;

        if(errorCode === 1) {
          return;
        }

        this.setErrorSign();
        this.playerState.buttonWasClicked(errorCode);
      }
    }

    listenReadyState() {
      if(!this.player.paused) {
        let readyCode = this.player.readyState;

        this.readyState.toggleLoadingSign(readyCode);
      }
    }

    listenNetwork() {
      let networkCode = this.player.networkState;

      this.networkState.sourceState(networkCode);
    }

    listenAll() {
      this.listenReadyState();
      this.listenError();
      this.listenNetwork();
    }

    forbidEventBinding() {
      this.controlPlayButton.onclick = null;
      this.playerLayer.onclick = null;
      this.playCircle.onclick = null;
      document.onkeydown = null;
    }

    setErrorSign() {
      this.player.style.opacity = 0;

      // this.playLoading.style.display = 'none';
      if(!Utility.hasClass('YangPlayer-display-none', this.playLoading)) {
        Utility.addClass('YangPlayer-display-none', this.playLoading);
      }
        
      // this.playCircle.style.display = 'none';
      if(Utility.hasClass('YangPlayer-display-block', this.playCircle)) {
        Utility.removeClass('YangPlayer-display-block', this.playCircle);
      }
      
      // this.pauseButton.style.display = 'none';
      if(Utility.hasClass('YangPlayer-display-inlineB', this.pauseButton)) {
        Utility.removeClass('YangPlayer-display-inlineB', this.pauseButton);
      }

      // this.playButton.style.display = 'inline-block';
      if(Utility.hasClass('YangPlayer-display-none', this.playButton)) {
        Utility.removeClass('YangPlayer-display-none', this.playButton);
      }
      
      this.setState(this.playErrorState);
    }

    setLoadingSign() {
      this.player.style.opacity = .5;

      // this.playLoading.style.display = 'block';
      if(Utility.hasClass('YangPlayer-display-none', this.playLoading)) {
        Utility.removeClass('YangPlayer-display-none', this.playLoading);
      }

      // this.playCircle.style.display = 'none';
      if(Utility.hasClass('YangPlayer-display-block', this.playCircle)) {
        Utility.removeClass('YangPlayer-display-block', this.playCircle);
      }

      // this.pauseButton.style.display = 'inline-block';
      if(!Utility.hasClass('YangPlayer-display-inlineB', this.pauseButton)) {
        Utility.addClass('YangPlayer-display-inlineB', this.pauseButton);
      }

      // this.playButton.style.display = 'none';
      if(!Utility.hasClass('YangPlayer-display-none', this.playButton)) {
        Utility.addClass('YangPlayer-display-none', this.playButton);
      }

      this.setState(this.loadingState);
    }

    setPausingSign() {
      this.player.style.opacity = .5;

      // this.playLoading.style.display = 'none';
      if(!Utility.hasClass('YangPlayer-display-none', this.playLoading)) {
        Utility.addClass('YangPlayer-display-none', this.playLoading);
      }
      
      // this.playCircle.style.display = 'block';
      if(!Utility.hasClass('YangPlayer-display-block', this.playCircle)) {
        Utility.addClass('YangPlayer-display-block', this.playCircle);
      }

      // this.pauseButton.style.display = 'none';
      if(Utility.hasClass('YangPlayer-display-inlineB', this.pauseButton)) {
        Utility.removeClass('YangPlayer-display-inlineB', this.pauseButton);
      }

      // this.playButton.style.display = 'inline-block';
      if(Utility.hasClass('YangPlayer-display-none', this.playButton)) {
        Utility.removeClass('YangPlayer-display-none', this.playButton);
      }

      this.setState(this.pausingState);
    }

    setPlayingSign() {
      this.player.style.opacity = 1;

      // this.playLoading.style.display = 'none';
      if(!Utility.hasClass('YangPlayer-display-none', this.playLoading)) {
        Utility.addClass('YangPlayer-display-none', this.playLoading);
      }

      // this.replayButton.style.display = 'none';
      if(Utility.hasClass('YangPlayer-display-block', this.replayButton)) {
        Utility.removeClass('YangPlayer-display-block', this.replayButton);
      }

      // this.playButton.style.display = 'none';
      if(!Utility.hasClass('YangPlayer-display-none', this.playButton)) {
        Utility.addClass('YangPlayer-display-none', this.playButton);
      }

      // this.pauseButton.style.display = 'inline-block';
      if(!Utility.hasClass('YangPlayer-display-inlineB', this.pauseButton)) {
        Utility.addClass('YangPlayer-display-inlineB', this.pauseButton);
      }

      // this.playCircle.style.display = 'none';
      if(Utility.hasClass('YangPlayer-display-block', this.playCircle)) {
        Utility.removeClass('YangPlayer-display-block', this.playCircle);
      }

      this.setState(this.playingState);
    }

    setReplayPausingSign() {
      this.player.style.opacity = .5;

      // this.playLoading.style.display = 'none';
      if(!Utility.hasClass('YangPlayer-display-none', this.playLoading)) {
        Utility.addClass('YangPlayer-display-none', this.playLoading);
      }

      // this.playCircle.style.display = 'none';
      if(Utility.hasClass('YangPlayer-display-block', this.playCircle)) {
        Utility.removeClass('YangPlayer-display-block', this.playCircle);
      }

      // this.replayButton.style.display = 'block';
      if(!Utility.hasClass('YangPlayer-display-block', this.replayButton)) {
        Utility.addClass('YangPlayer-display-block', this.replayButton);
      }

      // this.playButton.style.display = 'inline-block';
      if(Utility.hasClass('YangPlayer-display-none', this.playButton)) {
        Utility.removeClass('YangPlayer-display-none', this.playButton);
      }

      // this.pauseButton.style.display = 'none';
      if(Utility.hasClass('YangPlayer-display-inlineB', this.pauseButton)) {
        Utility.removeClass('YangPlayer-display-inlineB', this.pauseButton);
      }

      this.setState(this.pausingState);

      // pause bullet screens when replay button appear
      if(YangPlayer_GLOBAL.bulletScreenStatus) {
        YangPlayer_GLOBAL.bulletScreen.controlPauseBulletScreen();
      }
    }

    replayVideo() {
      this.player.load();
      YangPlayer_GLOBAL.progressBar.progressDragButton.style.left = 0;
      YangPlayer_GLOBAL.progressBar.progressPlayedbarDisplay();
      this.playVideo();

      // remove bullet screens when press replay button
      for(let userId in YangPlayer_GLOBAL.bulletScreen.userIdCollection) {
        YangPlayer_GLOBAL.bulletScreen.userIdCollection[userId].parentNode.removeChild(YangPlayer_GLOBAL.bulletScreen.userIdCollection[userId]);
        window.clearTimeout(YangPlayer_GLOBAL.bulletScreen.userIdCollection[userId]);

        delete YangPlayer_GLOBAL.bulletScreen.userIdCollection[userId];
        delete YangPlayer_GLOBAL.bulletScreen.userIdCollection[userId];
      }
    }

    setReplayEventBinding() {
      this.setReplayPausingSign();

      this.controlPlayButton.onclick = () => {
        this.replayVideo(YangPlayer_GLOBAL.progressBar);
        this.restoreDefaultBinding();
      };

      this.replayButton.onclick = () => {
        this.replayVideo(YangPlayer_GLOBAL.progressBar);
        this.restoreDefaultBinding();
      };

      this.playerLayer.onclick = () => {
        this.replayVideo(YangPlayer_GLOBAL.progressBar);
        this.restoreDefaultBinding();
      };

      if(YangPlayer_GLOBAL.isFullscreen) {
        document.onkeydown = (event) => {
          let keyCode = event.key || event.keyCode; // be careful that `event.keyCode` has been removed from the Web standards
            
          if(keyCode === ' ' || keyCode === 32) { // the Unicode vaule of `Space`
            this.replayVideo(YangPlayer_GLOBAL.progressBar);
            this.restoreDefaultBinding();
          }
        };
      }
    }

    // restore default playing or pausing binding after replayBtn was clicked
    restoreDefaultBinding() {
      this.controlPlayButton.onclick = () => {
        this.playerState.buttonWasClicked();
      };

      this.replayButton.onclick = null;

      this.playerLayer.onclick = () => {
        this.playerState.buttonWasClicked();
      };

      if(YangPlayer_GLOBAL.isFullscreen) {
        document.onkeydown = (event) => {
          let keyCode = event.key || event.keyCode; // be careful that `event.keyCode` has been removed from the Web standards
          
          if(keyCode === ' ' || keyCode === 32) { // the Unicode vaule of `Space`
            this.playerState.buttonWasClicked();
          }
        };
      }
    }

    // Note: In Chrome 55, `MediaElement.play()` will return a promise, so it is async
    playVideo() {
      let error = 'AbortError: The play() request was interrupted by a call to pause().';

      this.setPlayingSign();

      let promise = this.player.play();

      // `this.player.play()` in firefox doesn't return a promise
      if(promise) {
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
      const VOLUME_DRAG_BUTTON_X = -4; // unit: px, Utility.getOffsetAndLength(this.volumeDragButton).offsetLeft
      const VOLUME_BAR_HEIGHT = 70; // unit: px, Utility.outerHeight(this.volumeBar)
      const VOLUME_DRAG_BUTTON_HEIGHT = 14; // unit: px, Utility.outerHeight(this.volumeDragButton)

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
      this.volumeDragButtonX = VOLUME_DRAG_BUTTON_X;
      this.volumeBarHeight = VOLUME_BAR_HEIGHT;
      this.volumeDragBtnHeight = VOLUME_DRAG_BUTTON_HEIGHT;
    }

    init() {
      this.setState(this.normalVolumeState);
      this.displayVolumeButton(); // display different volume button
      this.player.volume = this.realVolumeValue; // change volume to normal volume
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
      // if mouseYOffset is given
      if(mouseYOffset) {
        Utility.offset({
          top: mouseYOffset,
          left: this.volumeDragButtonX,
        }, this.volumeDragButton);

        this.currentVolumeReverseBar.style.height = `${mouseYOffset / this.volumeBarHeight * 100}%`;

        return;
      }

      let mousedownCb = () => {
        // mousedown event will trigger click event and the click event will bubble to parents elements
        // the order in Chrome is: mousedown, mouseup, click
        // in order to avoid click event being triggered by mousedown, use flag `mousedownFired` to judge if `this.volumeButton.onclick` should happen
        this.mousedownFired = true;
      };

      let mousemoveCb = (adjustMouseY) => {
        this.currentVolumeReverseBar.style.height = `${Utility.getOffsetTop(this.volumeDragButton) / this.volumeBarHeight * 100}%`;

        // change real volume adcording to volumeDragButton
        this.currentVolumeBarH = this.volumeBarHeight - adjustMouseY - this.volumeDragBtnHeight;
        this.changeVolume(this.currentVolumeBarH);
      };

      let obj = {
        orientation: 'v',
        fixedOffset: this.volumeDragButtonX,
        mouseMaxOffset: this.mouseYMax,
        dragBtn: this.volumeDragButton,
        slidebar: this.volumeBar,
        mousedownCb,
        mousemoveCb,
        context: this,
      };

      Utility.sliderDragBtn(obj);
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
        this.volumeChangeRect.style.cssText += 'visibility: visible; opacity: 1;';
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
        this.volumeChangeRect.style.cssText += 'visibility: hidden; opacity: 0;';
        this.volumeButton.style.backgroundColor = '#eee';
      };
    }

    // @param {string} type
    //        => 'down' - volumeDownButton
    //        => 'up' - volumeUpButton
    //        => 'off' - volumeOffButton
    displayWhichVolumeBtn(type) {
      if(type === 'down') {
        this.volumeUpButton.style.display = 'none';
        this.volumeOffButton.style.display = 'none';
        this.volumeDownButton.style.display = 'inline-block';
      }
      else if(type === 'up') {
        this.volumeDownButton.style.display = 'none';
        this.volumeOffButton.style.display = 'none';
        this.volumeUpButton.style.display = 'inline-block';
      }
      else if(type === 'off') {
        this.volumeDownButton.style.display = 'none';
        this.volumeUpButton.style.display = 'none';
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
      const PROGRESS_DRAG_BTN_WIDTH = 14; // unit: px
      const PROGRESS_DRAG_BUTTON_Y = -3; // unit: px, Utility.getOffsetTop(this.progressDragButton)

      YangPlayer_GLOBAL.progressBar = this;
      this.player = player;
      this.intervalId = null; // store the ID of `window.setInterval()`
      this.intervalFunc = null;
      this.progressBar = $('.YangPlayer-progress');
      this.progressPlayedbar = $('.YangPlayer-playedbar');
      this.progressBufferedbar = $('.YangPlayer-bufferedbar');
      this.playedTime = $('.YangPlayer-played-time');
      this.totalTime = $('.YangPlayer-total-time');
      this.progressDragButton = $('.YangPlayer-progress-dragButton');
      this.progressDragBtnWidth = PROGRESS_DRAG_BTN_WIDTH;
      this.progressBarWidth = null;
      this.progressDragButtonY = PROGRESS_DRAG_BUTTON_Y;
      this.totalTimeDisplay = true;

      // mouse max x offset when progress is end
      this.mouseXMax = () => (this.progressBarWidth - this.progressDragBtnWidth);
    }

    init() {
      ProgressBar.setProgressLength();
      this.progressBarWidth = Utility.outerWidth(this.progressBar);
      this.progressPlayedbarDisplay();
      this.controlProgressButton();
    }

    // set the percent width of the progress bar
    static setProgressLength() {
      const playBtnLength = 30; // unit: px, Utility.outerWidth($('.YangPlayer-controlPlay-button'))
      const timeBarLength = 136; // unit: px, Utility.outerWidth($('.YangPlayer-time'))
      const volumeBtnLength = 30; // unit: px, Utility.outerWidth($('.YangPlayer-volume-button'))
      const screenModeLength = 30; // unit: px, Utility.outerWidth($('.YangPlayer-setting-button'))
      const settingBtnLength = 30; // unit: px, Utility.outerWidth($('.YangPlayer-setting-button'))
      const offLightLength = 30; // unit: px, Utility.outerWidth($('.YangPlayer-turnOff-light'))
      const adjustingLength = 30; // unit: px

      // the offsetWidth of video(controlsBar) is 0 when Safari 10 is in fullscreen mode, so choose to use `window.innerWidth` to get its width
      let controlsLength = (Utility.isWhichBrowser('Safari') && document.webkitIsFullScreen) ? window.innerWidth : Utility.outerWidth($('#YangPlayer'));

      let progressLength = controlsLength - (playBtnLength + timeBarLength + volumeBtnLength + screenModeLength + settingBtnLength + offLightLength + adjustingLength);

      YangPlayer_GLOBAL.progressBar.progressBar.style.width = `${progressLength / controlsLength * 100}%`;
    }

    forbidEventBinding() {
      this.progressDragButton.onmousedown = null;
    }

    // control the drag button of progress bar to adjust playback position
    // @param {number(px)} [mouseXOffset] - the x offset you need to set the drag button
    controlProgressButton(mouseXOffset) {
      // if mouseXOffset is given
      if(mouseXOffset) {
        Utility.offset({
          top: this.progressDragButtonY,
          left: mouseXOffset,
        }, this.progressDragButton);

        this.progressPlayedbar.style.width = `${(mouseXOffset + this.progressDragBtnWidth / 2) / this.progressBarWidth * 100}%`;

        return;
      }

      let mousemoveCb = () => {
        let progressDragBtnOffsetLeft = Utility.getOffsetLeft(this.progressDragButton);
        
        this.progressPlayedbar.style.width = `${progressDragBtnOffsetLeft / this.progressBarWidth * 100}%`;

        if(this.player.paused) {
          YangPlayer_GLOBAL.controlPlay.playVideo();
          this.intervalId = window.setInterval(this.intervalFunc, 1000);
        }

        // remove all bullet screens when mousedown and mousemove
        YangPlayer_GLOBAL.bulletScreen.removeAllBulletScreen();

        // change real currentTime
        this.player.currentTime = progressDragBtnOffsetLeft * this.player.duration / this.mouseXMax();
      };

      let mouseupCb = () => {
        if(!YangPlayer_GLOBAL.bulletScreen.intervalId && YangPlayer_GLOBAL.bulletScreen.bulletScreenStatus) {
          YangPlayer_GLOBAL.bulletScreen.ifPauseBulletScreen = false;
          YangPlayer_GLOBAL.bulletScreen.intervalId = window.setInterval(YangPlayer_GLOBAL.bulletScreen.intervalFunc, 1000);
        }
      };

      let obj = {
        orientation: 'h',
        fixedOffset: this.progressDragButtonY,
        mouseMaxOffset: this.mouseXMax,
        dragBtn: this.progressDragButton,
        slidebar: this.progressBar,
        mousemoveCb,
        mouseupCb,
        mouseoutCb: mouseupCb,
        context: this,
      };

      Utility.sliderDragBtn(obj);
    }

    progressPlayedbarDisplay() {
      this.player.currentTime = 0;
      this.progressPlayedbar.style.width = 0;
      this.progressBufferedbar.style.width = 0;

      let playedPercent, mouseXOffset;

      this.intervalFunc = () => {
        if(this.player.duration > 0) {
          playedPercent = `${Math.floor(this.player.currentTime / this.player.duration * 100)}%`;
          mouseXOffset = this.player.currentTime * this.mouseXMax() / this.player.duration;

          this.progressPlayedbar.style.width = playedPercent;
          this.progressTimeDisplay(this.player.currentTime, this.player.duration);
          this.controlProgressButton(mouseXOffset);
        }

        YangPlayer_GLOBAL.controlPlay.listenAll();

        if(this.player.ended) {
          YangPlayer_GLOBAL.controlPlay.setReplayEventBinding();

          window.clearInterval(this.intervalId);
          this.intervalId = null;
        }

        this.progressBufferedDisplay();
      };

      this.intervalId = window.setInterval(this.intervalFunc, 1000);
    }

    progressBufferedDisplay() {
      if(this.player.buffered.length > 0) {
        let bufferedPercent = `${Math.floor(this.player.buffered.end(0) / this.player.duration * 100)}%`;

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

      if(this.totalTimeDisplay) {
        this.totalTimeDisplay = false;

        let totalHours = (H = Math.floor(totalTime / 3600)) < 10 ? (`0${H}`) : H;
        let totalMinutes = (M = Math.floor(totalTime % 3600 / 60)) < 10 ? (`0${M}`) : M;
        let totalSeconds = (S = Math.floor(totalTime % 3600 % 60)) < 10 ? (`0${S}`) : S;
        this.totalTime.innerHTML = `${totalHours}:${totalMinutes}:${totalSeconds}`;
      }

      this.playedTime.innerHTML = `${playedHours}:${playedMinutes}:${playedSeconds}`;
    }
  }

  // a class of video player setting button
  class SettingBtn {
    // @param {[object HTMLElement]} player
    constructor(player) {
      const PLAYBACK_RATE = [0.5, 1.0, 1.5, 2.0, 4.0];

      this.switchOnState = new SwitchOnState(this);
      this.switchOffState = new SwitchOffState(this);

      YangPlayer_GLOBAL.settingBtn = this;
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

    forbidEventBinding() {
      this.loopSwitch.onclick = null;
      this.autoSwitch.onclick = null;
    }

    displaySettingBtn() {
      this.settingBtn.onmouseover = () => {
        this.settingPane.style.cssText += 'opacity: 1; visibility: visible;';
        this.settingBtn.style.backgroundColor = '#ccc';
      };

      this.settingBtn.onmouseout = () => {
        this.settingPane.style.cssText += 'opacity: 0; visibility: hidden;';
        this.settingBtn.style.backgroundColor = '#eee';
      };
    }

    // control play rate by button
    controlPlayRate() {
      Utility.addClass('YangPlayer-opacity-1', this.rateBtn.children[1]);

      for(let i = 0; i < this.rateBtn.children.length; i++) {
        this.rateBtn.children[i].onclick = () => {
          for(let j = 0; j < this.rateBtn.children.length; j++) {
            if(Utility.hasClass('YangPlayer-opacity-1', this.rateBtn.children[j])) {
              Utility.removeClass('YangPlayer-opacity-1', this.rateBtn.children[j]);
              Utility.addClass('YangPlayer-opacity-1', this.rateBtn.children[i]);
              this.setPlayRate(this.rate[i]);

              break;
            }
          }
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
        YangPlayer_GLOBAL.controlPlay.playVideo();

        if(YangPlayer_GLOBAL.bulletScreenStatus) {
          YangPlayer_GLOBAL.bulletScreen.controlContinueBulletScreen();
        }
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

  class OffLight {
    constructor() {
      this.turnOffLight = $('.YangPlayer-turnOff-light');
      this.light = true; // `true` if turn on light, otherwise `false`
    }

    init() {
      this.controlLight();
    }

    controlLight() {
      this.turnOffLight.onclick = () => {
        if(this.light) {
          this.light = false;
          let offLightLayer = document.createElement('div');
          Utility.addClass('YangPlayer-offLight-layer', offLightLayer);
          document.body.appendChild(offLightLayer);
          $('.YangPlayer-container').style.boxShadow = '0 0 5px #fff';
        }
        else {
          this.light = true;
          document.body.removeChild($('.YangPlayer-offLight-layer'));
          $('.YangPlayer-container').style.boxShadow = 'none';
        }
      };
    }
  }

  // a class controling the mode of video player screen
  class ScreenMode {
    // @param {[object HTMLElement]} player
    constructor(player) {
      this.player = player;
      this.playerContainer = $('.YangPlayer-container');
      this.controlBar = $('.YangPlayer-control');
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
        this.isFullscreen = () => {
          YangPlayer_GLOBAL.isFullscreen = Boolean(this.fullscreenElement());

          return YangPlayer_GLOBAL.isFullscreen;
        };
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

    // trigger callback when the fullscreen state of the player changes
    // @param {function} callback
    onfullscreenchange(callback) {
      if(ScreenMode.getBrowserSupportObj()) {
        let change = ScreenMode.getBrowserSupportObj().onfullscreenchange;
        let callbackAdd = () => {
          callback();

          if(this.isFullscreen()) {
            document.onkeydown = (event) => {
              let keyCode = event.key || event.keyCode; // be careful that `event.keyCode` has been removed from the Web standards

              if(keyCode === ' ' || keyCode === 32) { // the Unicode vaule of `Space`
                YangPlayer_GLOBAL.playerPlayState.buttonWasClicked();
              }
            };

            this.notOverControlBar();
          }
          else {
            document.onkeydown = null;

            this.fullscreenButton.style.display = 'inline-block';
            this.minscreenButton.style.display = 'none';

            this.controlBar.onmouseover = null;
            this.controlBar.onmouseout = null;
            this.controlBar.style.opacity = 1;
          }

          // correct bullet screens offset distance when the fullscreen state of the player changes
          // and own properties exist in `YangPlayer_GLOBAL.bulletScreen.userIdCollection`
          for(let i in YangPlayer_GLOBAL.bulletScreen.userIdCollection) {
            if(!this.player.paused && YangPlayer_GLOBAL.bulletScreen.bulletScreenStatus) {
              YangPlayer_GLOBAL.bulletScreen.ifPauseBulletScreen = true;
              YangPlayer_GLOBAL.bulletScreen.controlContinueBulletScreen();

              break;
            }
          }

          YangPlayer_GLOBAL.progressBar.progressBarWidth = Utility.outerWidth(YangPlayer_GLOBAL.progressBar.progressBar);
        };

        return (document[change] = callbackAdd);
      }

      throw new Error('Current browser doesn\'t support Fullscreen API!');
    }

    // bottom control bar disappears when cursor isn's over it in fullscreen mode
    notOverControlBar() {
      this.controlBar.onmouseover = () => {
        this.controlBar.style.opacity = 1;
      };

      this.controlBar.onmouseout = () => {
        this.controlBar.style.opacity = 0;
      };
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

        this.controlBar.onmouseover = null;
        this.controlBar.onmouseout = null;
        this.controlBar.style.opacity = 1;

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
    // @param {[object HTMLElement]} player
    constructor(player) {
      const FONT_SIZE = ['1em', '1.5em', '2em'];
      const BULLET_SCREEN_STYLE = ['top', 'move'];
      const TRANSITION_RATE_SCALE = 5 / 984; // use to transform rate of bullet screens according to different distance
      const BASE_ADD_HEIGHT = 37; // unit: px
      const BULLET_SCREEN_SPACE = 10; // unit: px, correct computation errors

      YangPlayer_GLOBAL.bulletScreen = this;
      this.player = player;
      this.intervalId = null;
      this.intervalFunc = null;
      this.bulletScreenPool = $('.YangPlayer-bulletScreen-pool');
      this.bulletScrenRect = $('.YangPlayer-bullet-screen');
      this.colorBox = $('.YangPlayer-color-box');
      this.colorPane = $('.YangPlayer-color-pane');
      this.colorValue = $('.YangPlayer-color-value');
      this.slider = $('#slider');
      this.picker = $('#picker');
      this.modePane = $('.YangPlayer-mode-pane');
      this.bulletScreenText = $('.YangPlayer-bulletScreen-text');
      this.bulletScreenSend = $('.YangPlayer-bulletScreen-send');
      this.bulletScreenColor = $('.YangPlayer-bulletScreen-color');
      this.bulletScreenMode = $('.YangPlayer-bulletScreen-mode');
      this.bulletScreenSwitch = $('.YangPlayer-bulletScreen-switch');
      this.bulletScreenOn = $('.YangPlayer-bulletScreen-on');
      this.bulletScreenOff = $('.YangPlayer-bulletScreen-off');
      this.fontBtn = $('.YangPlayer-font-btn');
      this.styleBtn = $('.YangPlayer-style-btn');
      this.fontSize = FONT_SIZE;
      this.bulletScreenStyle = BULLET_SCREEN_STYLE;
      this.transitionRateScale = TRANSITION_RATE_SCALE;
      this.baseAddHeight = BASE_ADD_HEIGHT;
      this.bulletScreenSpace = BULLET_SCREEN_SPACE;
      this.sendData = {
        url: null,
        userId: '',
        fontSize: '1.5em',
        mode: 'move',
        color: '#fff',
        message: '',
        playTime: 0,
        date: '',
      };
      this.timeoutIdCollection = {}; // store all timeout ids of `window.setTimeout()` that has not finished
      this.timeoutId = null; // store each timeout id
      this.userIdCollection = {}; // store all `div` bullet screens that have not finished
      this.ifPauseBulletScreen = null; // `true` if bullet screens are paused, otherwise `false`
      this.bulletScreenStatus = true; // `true` if bullet screens are open, otherwise `false`
      this.modePaneDisplay = false;
      this.colorBoxDisplay = false;
    }

    init(url) {
      // do not use `this.player.paused` at the beginning because before `oncanplaythrough`
      // event is triggered, `this.player.paused` is always `true`
      this.ifPauseBulletScreen = !this.player.autoplay;

      this.controlBulletScreenSwitch();

      this.sendData.url = url;

      this.setColorPicker();
      this.setModePane();

      if(this.bulletScreenStatus) {
        this.ajax(this.sendData); // get bullet screens
      }
      
      this.sendBulletScreen();

      this.bulletScrenRect.onmouseover = () => {
        this.bulletScrenRect.style.opacity = 1;
      };

      this.bulletScrenRect.onmouseout = () => {
        this.bulletScrenRect.style.opacity = 0;
      };

      this.bulletScrenRect.onkeydown = (event) => {
        event.stopPropagation();
      };
    }

    controlBulletScreenSwitch() {
      this.bulletScreenOn.onclick = () => {
        this.bulletScreenStatus = true;
        this.bulletScreenOn.style.display = 'none';
        this.bulletScreenOff.style.display = 'inline-block';
        this.sendData.message = '';
        this.ajax(this.sendData);
        this.sendBulletScreen();
      };

      this.bulletScreenOff.onclick = () => {
        this.bulletScreenStatus = false;
        this.bulletScreenOn.style.display = 'inline-block';
        this.bulletScreenOff.style.display = 'none';
        this.removeAllBulletScreen();
      };
    }

    forbidEventBinding() {
      this.bulletScreenOn.onclick = null;
      this.bulletScreenOff.onclick = null;
    }

    // color picker pane
    setColorPicker() {
      this.bulletScreenColor.onclick = () => {
        if(this.colorBoxDisplay) {
          this.colorBoxDisplay = false;

          this.colorBox.style.cssText += 'visibility: hidden; opacity: 0';
        }
        else {
          this.colorBoxDisplay = true;
          this.modePaneDisplay = false;

          this.colorBox.style.cssText += 'visibility: visible; opacity: 1';
          this.modePane.style.cssText += 'visibility: hidden; opacity: 0';
        }
      };

      this.colorBox.onclick = (event) => {
        event.stopPropagation();
      };

      // use [FlexiColorPicker](https://github.com/DavidDurman/FlexiColorPicker)
      ColorPicker(this.slider, this.picker, (hex) => {
        this.colorValue.value = hex.match(/#([0-9a-zA-Z]+)/)[1];
        this.colorPane.style.backgroundColor = hex;
        this.sendData.color = hex;
      });

      this.colorValue.oninput = () => {
        let color = `#${this.colorValue.value.match(/([0-9a-zA-Z]+)/)[1]}`;

        this.colorPane.style.backgroundColor = color;
        this.sendData.color = color;
      };
    }

    setModePane() {
      this.bulletScreenMode.onclick = () => {
        if(this.modePaneDisplay) {
          this.modePaneDisplay = false;

          this.modePane.style.cssText += 'visibility: hidden; opacity: 0';
        }
        else {
          this.modePaneDisplay = true;
          this.colorBoxDisplay = false;

          this.modePane.style.cssText += 'visibility: visible; opacity: 1';
          this.colorBox.style.cssText += 'visibility: hidden; opacity: 0';
        }
      };

      this.modePane.onclick = (event) => {
        event.stopPropagation();
      };

      this.setFontSize();
      this.setMode();
    }

    // @param {[object HTMLElement]} item - top bullet screen `div` element
    renderTopBulletScreen(item) {
      Utility.addClass('YangPlayer-bulletScreen-top', item);

      this.bulletScreenPool.appendChild(item);
      item.style.marginLeft = `-${Utility.outerWidth(item) / 2}px`;

      if(!this.player.paused) {
        this.timeoutId = window.setTimeout(() => {
          if(item.parentNode) {
            item.parentNode.removeChild(item);
          }

          for(let userId in this.userIdCollection) {
            if(userId === item.getAttribute('data-id')) {
              delete this.userIdCollection[userId];
              delete this.timeoutIdCollection[userId];

              break;
            }
          }
        }, 3000);

        this.timeoutIdCollection[item.getAttribute('data-id')] = this.timeoutId;
      }
    }

    // @param {[object HTMLElement]} item - moving bullet screen `div` element
    renderMovingBulletScreen(item) {
      Utility.addClass('YangPlayer-bulletScreen-move', item);

      this.bulletScreenPool.appendChild(item);
      item.style.right = `-${Utility.outerWidth(item)}px`;
    }

    // control pausing of bullet screens
    controlPauseBulletScreen() {
      // top bullet screens
      for(let userId in this.timeoutIdCollection) {
        window.clearTimeout(this.timeoutIdCollection[userId]);

        delete this.timeoutIdCollection[userId];
      }

      // moving bullet screens
      if(!this.ifPauseBulletScreen) {
        for(let userId in this.userIdCollection) {
          this.ifPauseBulletScreen = true;

          if(Utility.hasClass('YangPlayer-bulletScreen-move', this.userIdCollection[userId])) {
            let translateX;

            // solve the bug of method `window.getComputedStyle` in Safari
            // find more info here: [http://stackoverflow.com/questions/22034989/is-there-a-bug-in-safari-with-getcomputedstyle]
            if(Utility.isWhichBrowser('Safari')) {
              let itemRect = Utility.getOffsetAndLength(this.userIdCollection[userId]);

              translateX = (-Number.parseInt(window.getComputedStyle(this.userIdCollection[userId]).right)) + itemRect.parentWidth - itemRect.offsetLeft - itemRect.width;
            }
            else {
              translateX = Number.parseInt(window.getComputedStyle(this.userIdCollection[userId]).left) - Utility.getOffsetLeft(this.userIdCollection[userId]);
            }

            this.userIdCollection[userId].style.cssText += `transition: transform 0s linear; transform: translateX(-${translateX}px);`;
          }
        }
      }
    }

    // control continuing of bullet screens after pause bullet screens
    controlContinueBulletScreen() {
      if(this.ifPauseBulletScreen) {
        for(let userId in this.userIdCollection) {
          this.ifPauseBulletScreen = false;

          if(Utility.hasClass('YangPlayer-bulletScreen-move', this.userIdCollection[userId])) {
            let itemRect = Utility.getOffsetAndLength(this.userIdCollection[userId]);

            let transition = (itemRect.offsetLeft + itemRect.width + this.bulletScreenSpace) * this.transitionRateScale;
            let translateX;

            // solve the bug of method `window.getComputedStyle` in Safari
            // find more info here: [http://stackoverflow.com/questions/22034989/is-there-a-bug-in-safari-with-getcomputedstyle]
            if(Utility.isWhichBrowser('Safari')) {
              translateX = (-Number.parseInt(window.getComputedStyle(this.userIdCollection[userId]).right)) + itemRect.parentWidth + this.bulletScreenSpace;
            }
            else {
              translateX = Number.parseInt(window.getComputedStyle(this.userIdCollection[userId]).left) + itemRect.width + this.bulletScreenSpace;
            }

            this.userIdCollection[userId].style.cssText += `transition: transform ${transition}s linear; transform: translateX(-${translateX}px)`;
          }

          if(Utility.hasClass('YangPlayer-bulletScreen-top', this.userIdCollection[userId])) {
            let timeoutFunc = () => {
              if(this.userIdCollection[userId]) {
                this.userIdCollection[userId].parentNode.removeChild(this.userIdCollection[userId]);
              }

              delete this.userIdCollection[userId];
              delete this.timeoutIdCollection[userId];
            };

            this.timeoutId = window.setTimeout(timeoutFunc, 1000);

            this.timeoutIdCollection[userId] = this.timeoutId;
          }
        }
      }
    }

    // remove moving bullet screens after they disappear
    removeMovingBulletScreen() {
      let itemRect, canRemoveMovingBulletScreen;

      for(let userId in this.userIdCollection) {
        itemRect = Utility.getOffsetAndLength(this.userIdCollection[userId]);
        canRemoveMovingBulletScreen = Utility.hasClass('YangPlayer-bulletScreen-move', this.userIdCollection[userId]) && itemRect.offsetRight >= itemRect.parentWidth;

        if(canRemoveMovingBulletScreen) {
          this.userIdCollection[userId].parentNode.removeChild(this.userIdCollection[userId]);

          delete this.userIdCollection[userId];
        }
      }
    }

    // remove all bullet screens at once and forbid the creation of bullet screens
    removeAllBulletScreen() {
      window.clearInterval(this.intervalId);
      this.intervalId = null;

      for(let userId in this.userIdCollection) {
        this.userIdCollection[userId].parentNode.removeChild(this.userIdCollection[userId]);
        window.clearTimeout(this.timeoutIdCollection[userId]);

        delete this.userIdCollection[userId];
        delete this.timeoutIdCollection[userId];
      }
    }

    // render data with the return data of `this.ajax()`
    // @param {[object Array]} data - about bullet screen information
    renderBulletScreen(data) {
      let playTime, playerCurrentTime, userId, canCreateBulletScreen, fontSize, mode, color, message, item;

      this.intervalFunc = () => {
        for(let i = 0; i < data.length; i++) {
          playTime = Number.parseInt(data[i].playTime);
          playerCurrentTime = Number.parseInt(this.player.currentTime);
          userId = data[i].userId;
          canCreateBulletScreen = playTime === playerCurrentTime && !this.userIdCollection.hasOwnProperty(userId);

          if(canCreateBulletScreen) {
            fontSize = data[i].fontSize;
            mode = data[i].mode;
            color = data[i].color;
            message = data[i].message;
            item = document.createElement('div');

            item.innerHTML = message;
            item.style.cssText += `font-size: ${fontSize}; color: ${color}`;
            item.setAttribute('data-id', userId);
            this.userIdCollection[userId] = item;

            if(mode === 'top') {
              this.renderTopBulletScreen(item);
            }

            if(mode === 'move') {
              this.renderMovingBulletScreen(item);
            }

            this.correctDistance(item, mode, userId);
          }
        }

        this.removeMovingBulletScreen();
      };

      this.intervalId = this.intervalId ? (window.clearInterval(this.intervalId) && window.setInterval(this.intervalFunc, 1000)) : window.setInterval(this.intervalFunc, 1000);
    }

    // simple collision detection
    // @param {[object HTMLElement]} item - a single bullet screen element
    // @param {string} mode - the mode type of `item`
    correctDistance(item, mode, userId) {
      let topModeNumber = 0;
      let prevItem = null;
      let poolChildren = this.bulletScreenPool.children;
      let itemRect = Utility.getOffsetAndLength(item);
      let prevItemRect = null;

      for(let j = 0; j < poolChildren.length; j++) {
        let otherMode = poolChildren[j].className.match(/.*YangPlayer-bulletScreen-([a-zA-Z]+).*/)[1];
        let otherId = poolChildren[j].getAttribute('data-id');

        if(otherId === userId) {
          break;
        }

        if(otherMode === 'top') {
          topModeNumber++;
        }
        else if(otherMode === 'move') {
          prevItem = poolChildren[j];
        }
      }

      if(mode === 'top') {
        item.style.transform = `translateY(${topModeNumber * this.baseAddHeight}px)`;
      }
      else if(mode === 'move') {
        prevItemRect = prevItem && Utility.getOffsetAndLength(prevItem);

        let canMoveModeXAdd = prevItem && (prevItemRect.offsetRight - itemRect.offsetRight <= itemRect.width);

        if(canMoveModeXAdd) {
          let right = prevItemRect.offsetRight - itemRect.width - this.bulletScreenSpace;

          item.style.cssText += `right: ${right}px; top: ${prevItemRect.offsetTop}px`;

          itemRect = Utility.getOffsetAndLength(item); // refresh itemRect
        }

        if(Math.abs(itemRect.offsetRight) > itemRect.parentWidth) {
          let top = prevItemRect.offsetTop + prevItemRect.height;

          item.style.cssText += `right: -${itemRect.width}px; top: ${top}px`;

          itemRect = Utility.getOffsetAndLength(item); // refresh itemRect
        }

        if(!this.player.paused) {
          let translateX = itemRect.offsetLeft + itemRect.width + this.bulletScreenSpace;
          let transition = translateX * this.transitionRateScale;

          item.style.cssText += `transition: transform ${transition}s linear; transform: translateX(-${translateX}px)`;
        }
      }
    }

    // what would do if `this.ajax()` failed
    failSend() {
      console.log('sending bullet screens fail.');
    }

    // @param {object} data - the same as `this.sendData`
    firstSendRender(data) {
      this.bulletScreenText.value = '';

      let userId = data.userId;
      let fontSize = data.fontSize;
      let mode = data.mode;
      let color = data.color;
      let message = data.message;
      let item = document.createElement('div');
      let content = document.createTextNode(message);

      item.appendChild(content);
      item.style.cssText += `font-size: ${fontSize}; color: ${color}; border: 1px solid #fff; padding: 1px`;
      item.setAttribute('data-id', userId);
      this.userIdCollection[userId] = item;

      if(mode === 'top') {
        this.renderTopBulletScreen(item);
      }

      if(mode === 'move') {
        this.renderMovingBulletScreen(item);
      }

      this.correctDistance(item, mode, userId);
    }

    sendBulletScreen() {
      this.bulletScreenSend.onclick = () => {
        if(this.bulletScreenStatus) {
          let message = this.bulletScreenText.value.trim();
          let date = (new Date()).toLocaleString();

          if(message) {
            this.sendData.message = message;
            this.setPlayTime(this.player.currentTime);
            this.sendData.date = date;
            this.setUserId();

            this.firstSendRender(this.sendData);
            this.ajax(this.sendData, this.renderBulletScreen, this.failSend);
          }
        }
      };
    }

    setFontSize() {
      Utility.addClass('YangPlayer-opacity-1', this.fontBtn.children[1]);

      for(let i = 0; i < this.fontBtn.children.length; i++) {
        this.fontBtn.children[i].onclick = () => {
          for(let j = 0; j < this.fontBtn.children.length; j++) {
            if(Utility.hasClass('YangPlayer-opacity-1', this.fontBtn.children[j])) {
              Utility.removeClass('YangPlayer-opacity-1', this.fontBtn.children[j]);
              Utility.addClass('YangPlayer-opacity-1', this.fontBtn.children[i]);
              this.sendData.fontSize = this.fontSize[i];

              break;
            }
          }
        };
      }
    }

    // Note: here just use `Date.now()` to distinguish the same bullet screen from different user.
    //       In production you should use real user id
    setUserId() {
      this.sendData.userId = String(Date.now());
    }

    setMode() {
      Utility.addClass('YangPlayer-opacity-1', this.styleBtn.children[1]);

      for(let i = 0; i < this.styleBtn.children.length; i++) {
        this.styleBtn.children[i].onclick = () => {
          for(let j = 0; j < this.styleBtn.children.length; j++) {
            if(Utility.hasClass('YangPlayer-opacity-1', this.styleBtn.children[j])) {
              Utility.removeClass('YangPlayer-opacity-1', this.styleBtn.children[j]);
              Utility.addClass('YangPlayer-opacity-1', this.styleBtn.children[i]);
              this.sendData.mode = this.bulletScreenStyle[i];

              break;
            }
          }
        };
      }
    }

    // @param {number(s)} playTime - the player currentTime when user sent the message
    setPlayTime(playTime) {
      this.sendData.playTime = Number.parseInt(playTime);

      if(this.sendData.playTime === 0 && this.sendData.mode === 'top') {
        this.sendData.playTime += 1;
      }
    }

    // create an ajax request
    // @param {object} [data] - an object containing following properties
    //        => {string} url - the url address sent to
    //        => {string} fontSize - three types: '1em'(little), '1.5em'(middle), '2em'(big)
    //        => {string} userId - distinguish different user
    //        => {string} mode - two types: 'top', 'move'
    //        => {string} color - a hex color value
    //        => {string} message - the message user inputed
    //        => {number} playTime - the player currentTime when user sent the message
    //        => {string} date - the date when user sent the message
    // @return {object} a object containing following properties
    //        => {boolean} sendSuccess - `true` if ajax function successed, otherwise `false`
    //        => {array} bulletScreenContent - contain all bulletScreen objects. Each object contains following properties from above
    //                => fontSize, userId, mode, color, message, playTime, date
    ajax(data) {
      let xhr = new XMLHttpRequest();
      let xhrUrl = data.url;

      if(!!data.fontSize && !!data.userId && !!data.mode && !!data.color && !!data.message && !!data.date) {
        let fd = new FormData();

        fd.append('fontSize', data.fontSize);
        fd.append('userId', data.userId);
        fd.append('mode', data.mode);
        fd.append('color', data.color);
        fd.append('message', data.message);
        fd.append('playTime', data.playTime);
        fd.append('date', data.date);

        xhr.open('post', xhrUrl, true);
        xhr.send(fd);
      }
      else {
        xhr.open('get', xhrUrl, true);
        xhr.send();
      }

      xhr.onreadystatechange = () => {
        if(xhr.readyState === 4 && xhr.status === 200) {
          let returnData = JSON.parse(xhr.responseText);

          if(returnData.sendSuccess) {
            this.renderBulletScreen(returnData.bulletScreenContent);
          }
          else {
            this.failSend();
          }
        }
      };
    }
  }

  // main class of YangPlayer video player
  class YangPlayer {
    constructor() {
      // some important properties about YangPlayer video player
      this.YangPlayer = $('#YangPlayer');
      this.controlPlay = null; // control video playing and pausing
      this.progressBar = null; // the progress bar and its time bar
      this.volumeButton = null; // the button controling volume in control bar
      this.settingButton = null; // the button controling setting
      this.screenMode = null; // the button controling fullscreen and minscreen
      this.bulletScreen = null; // control sending `bullet screen`
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

      this.offLight = new OffLight();
      this.offLight.init();

      // initialize screen mode button
      this.screenMode = new ScreenMode(this.YangPlayer);
      this.screenMode.init();

      // initialize bullet screen rect
      this.bulletScreen = new BulletScreen(this.YangPlayer);
      this.bulletScreen.init('http://localhost/~yangshao/bulletScreen.php');
    }
  }

  let player = new YangPlayer();
  player.init();
})();
