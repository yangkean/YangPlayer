# YangPlayer

A cute HTML5 video player that can send [bullet screens](https://zh-cn.facebook.com/notes/the-sound-of-china/why-danmu-is-so-popular-in-china/1095179960504770/) (**in Chinese，弹幕**).

You can see [demo](https://yangkean.github.io/YangPlayer/demo/) here.

## Screenshot

![YangPlayer screenshot](./player.png)

## Overview

YangPlayer.js was written in pure [ECMAScript 6](http://www.ecma-international.org/ecma-262/6.0/) without JQuery and was based on
[HTML5 video API](https://html.spec.whatwg.org/multipage/embedded-content.html#the-video-element). Source code was transpiled into
[ECMAScript 5](http://www.ecma-international.org/ecma-262/5.1/) by [Babel](https://babeljs.io/) and took advantage of [es6-shim](https://github.com/paulmillr/es6-shim) to polyfill API of ECMAScript 6.

## Features

* support sending bullet screens, containing colorful、different-sized、top and moving bullet screens
* support turn-off-light watching
* support change playback rate
* support Chinese and English

## Browser support

* Chrome 48+
* Firefox 44+
* Safari 10+
* Opera 43+

## Getting started

```html
<!-- ... -->
<head>
<!-- ... -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"> <!-- Required -->
<link rel="stylesheet" href="css/YangPlayer.min.css"> <!-- Required -->
</head>
<body>
  <div class="YangPlayer-container"></div> <!-- Required -->
  <script src="js/YangPlayer.min.js"></script> <!-- Required -->
  <script>
    // initial setting
    let yangPlayer = new YangPlayer({
      language: 'en', // optional, the language mode video player uses, `zh` or `en`, default: `zh`
      bulletScreen: {
        bulletSwitch: true, // optional, specify if open bullet screen functionality, `true` or `false`, default: `false`
        url: 'bulletScreen.php' // the ajax address sent to, default: ''. If `switch` is `true`, this option is required
      },
      autoplay: false, // optional, specify if autoplay video at the beginning, `true` or `false`, default: `false`
      video: {
        url: 'apple.mp4', // required, the video source url
        posterUrl: '' // optional, the beginning poster url, default: ''
      }
    });
  </script>
</body>
```

If you neeed to open bullet screen functionality, see [PHP support](https://github.com/yangkean/YangPlayer/blob/master/phpSupport.md).

## [License](https://github.com/yangkean/YangPlayer/blob/master/LICENSE)

[粤ICP备15088974号](www.beian.miit.gov.cn)
