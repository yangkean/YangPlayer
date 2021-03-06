(function() {
  'use strict';

  // because `Shadow Dom` has not stabilized and its API will change often, here won't use
  // `Shadow Dom` to capsulate HTML code and CSS code of video components
  // find more info here: https://www.w3.org/TR/shadow-dom/
  class Capsulation {
    constructor() {
      Capsulation.addHtmlComponents();
    }

    static addHtmlComponents() {
      let container = document.querySelector('.YangPlayer-container');

      // detect if current browser supports html5 `<video>` tag
      if(!document.createElement('video').canPlayType) {
        container.innerHTML = `      
          <p>
            你的浏览器太过陈旧！不支持 <code>HTML5</code> 播放器。请下载<a href="//www.firefox.com">现代浏览器</a>以支持 <code>HTML5</code> 播放器。<br>
            Your browser is too out-dated to support <code>HTML5</code> video player. Please download <a href="//www.firefox.com">modern browser</a> to support <code>HTML5</code> video player.
          </p>`;

        container.backgroundColor = 'inherit';

        return;
      }

      container.innerHTML = `
        <video id="YangPlayer" src="" poster="" preload></video>

        <div class="YangPlayer-bulletScreen-pool"></div>

        <div class="YangPlayer-video-layer"></div>

        <div class="YangPlayer-error-prompt"></div>

        <div class="YangPlayer-play-circle fa fa-youtube-play fa-5x"></div>

        <div class="YangPlayer-loading fa fa-circle-o-notch fa-spin fa-5x"></div>

        <div class="YangPlayer-replay fa fa-repeat fa-5x"></div>
      
        <div class="YangPlayer-bullet-screen">
          <div class="YangPlayer-bulletScreen-color fa fa-square fa-lg">
            <div class="YangPlayer-color-box">
              <span class="YangPlayer-color-pane"></span>
              <input type="text" class="YangPlayer-color-value" maxlength="6" value="fff">
              <div id="picker"></div>
              <div id="slider"></div>
            </div>
          </div>

          <div class="YangPlayer-bulletScreen-mode fa fa-desktop fa-lg">
            <div class="YangPlayer-mode-pane">
              <div class="YangPlayer-font-size">
                <p class="YangPlayer-font-title"></p>

                <div class="YangPlayer-font-btn">
                  <div class="YangPlayer-font-small"></div>
                  <div class="YangPlayer-font-middle"></div>
                  <div class="YangPlayer-font-big"></div>
                </div>
              </div>

              <div class="YangPlayer-bulletScreen-style">
                <p class="YangPlayer-style-title"></p>

                <div class="YangPlayer-style-btn">
                  <div class="YangPlayer-style-top"></div>
                  <div class="YangPlayer-style-move"></div>
                </div>
              </div>
            </div>
          </div>

          <input class="YangPlayer-bulletScreen-text" type="text" name="bullet-screen-text" placeholder="">

          <div class="YangPlayer-bulletScreen-send fa fa-paper-plane fa-lg"></div> 

          <div class="YangPlayer-bulletScreen-switch">
            <div class="YangPlayer-bulletScreen-on fa fa-eye fa-lg"></div>
            <div class="YangPlayer-bulletScreen-off fa fa-eye-slash fa-lg"></div>
          </div>
        </div>

        <div class="YangPlayer-control">
          <div class="YangPlayer-controlPlay-button">
            <div class="YangPlayer-play-button fa fa-play fa-lg"></div>
            <div class="YangPlayer-pause-button fa fa-pause fa-lg"></div>
          </div>

          <div class="YangPlayer-progress">
            <span class="YangPlayer-playedbar"></span>
            <span class="YangPlayer-bufferedbar"></span>
            <div class="YangPlayer-progress-dragButton"></div>
          </div>

          <div class="YangPlayer-time">
            <span class="YangPlayer-played-time">00:00:00</span>
            <span class="YangPlayer-time-divider">/</span>
            <span class="YangPlayer-total-time">00:00:00</span>
          </div>
          
          <div class="YangPlayer-volume-button">
            <div class="YangPlayer-volume-up fa fa-volume-up fa-lg"></div>
            <div class="YangPlayer-volume-down fa fa-volume-down fa-lg"></div>
            <div class="YangPlayer-volume-off fa fa-volume-off fa-lg"></div>

            <div class="YangPlayer-volume-change">
              <div class="YangPlayer-volume-number">50</div>
              <div class="YangPlayer-volume-bar">
                <div class="YangPlayer-volume-dragButton"></div>
                <span class="YangPlayer-currentVolume-reverseBar"></span>
              </div>
            </div>
          </div>

          <div class="YangPlayer-setting-button fa fa-cog fa-lg">
            <div class="YangPlayer-setting-pane">
              <div class="YangPlayer-play-loop">
                <p class="YangPlayer-loop-title"></p>

                <div class="YangPlayer-loop-switch">
                  <div class="YangPlayer-loop-off fa fa-toggle-off fa-lg"></div>
                  <div class="YangPlayer-loop-on fa fa-toggle-on fa-lg"></div>
                </div>
              </div>

              <div class="YangPlayer-play-auto">
                <p class="YangPlayer-auto-title"></p>

                <div class="YangPlayer-auto-switch">
                  <div class="YangPlayer-auto-off fa fa-toggle-off fa-lg"></div>
                  <div class="YangPlayer-auto-on fa fa-toggle-on fa-lg"></div>
                </div>
              </div>

              <div class="YangPlayer-playback-rate">
                <p class="YangPlayer-rate-title"></p>
      
                <div class="YangPlayer-rate-btn">
                  <div class="YangPlayer-rate-05">0.5x</div>
                  <div class="YangPlayer-rate-10">1.0x</div>
                  <div class="YangPlayer-rate-15">1.5x</div>
                  <div class="YangPlayer-rate-20">2.0x</div>
                  <div class="YangPlayer-rate-40">4.0x</div>
                </div>
              </div>
            </div>
          </div>

          <div class="YangPlayer-turnOff-light fa fa-adjust fa-lg"></div>
          
          <div class="YangPlayer-screen-mode">
            <div class="YangPlayer-fullscreen fa fa-expand fa-lg"></div>
            <div class="YangPlayer-minscreen fa fa-compress fa-lg"></div>
          </div>
      </div>`;
    }
  }

  new Capsulation();
})();
