/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

eval("(function () {\n  const ipc = __webpack_require__(1).ipcRenderer;\n  let lastHeight = 0;\n  let lastPaused = -1;\n\n  const MonocleRadio = function () {\n    this.$$ = sel => document.querySelector(sel);\n    this.show = el => el.style.display = '';\n    this.hide = el => el.style.display = 'none';\n    this.html = (el, html) => el.innerHTML = html;\n\n    this.monocle_24 = data => {\n      const cover = this.$$('#cover');\n      const artist = this.$$('#artist');\n      const space = this.$$('#space');\n      const title = this.$$('#title');\n      if (data.id) {\n        if (data['image'] !== 'Null') {\n          const filename = data['image'].replace('/uploads/image/radio/shows/', '');\n          cover.setAttribute('style', `background: transparent url(https://img.monocle.com/radio/shows/${filename}?w=400&h=400&q=60) no-repeat 50% 50%; background-size: cover`);\n          this.show(cover);\n        } else {\n          this.hide(cover);\n        }\n        if (data['current-track-artist'] !== 'Null') {\n          this.html(artist, data['current-track-artist']);\n          this.show(space);\n          this.html(title, data['current-track-title']);\n        } else {\n          this.html(artist, data['show']);\n          this.html(title, '');\n          this.hide(space);\n        }\n      }\n      this.updateSize();\n    };\n\n    this.showMenu = _ => {\n      ipc.send('show-config-menu');\n    };\n\n    this.reloadRadio = _ => {\n      if (this.shouldRefreshRadio()) {\n        console.log('refreshing radio');\n        this.refreshRadio(true);\n      } else {\n        console.log('no refresh needed');\n      }\n    };\n\n    this.shouldRefreshRadio = _ => {\n      if (lastPaused !== -1) {\n        let now = new Date().getTime();\n        let diff = parseInt((now - lastPaused) / 1000, 10);\n        if (diff > 60) {\n          // should be 60\n          return true;\n        }\n      }\n      return false;\n    };\n\n    this.refreshRadio = (reload = false) => {\n      const sourceUrl = 'https://radio.monocle.com/live';\n      const audio = this.$$('#player');\n      const mp3Src = this.$$('#mp3_src');\n      mp3Src.setAttribute('src', sourceUrl);\n      /****************/\n      audio.pause();\n      audio.load(); // suspends and restores all audio element\n\n      if (reload) {\n        audio.play();\n      }\n      audio.oncanplaythrough = audio.play();\n      audio.onpause = _ => {\n        lastPaused = new Date().getTime();\n      };\n      audio.onplay = _ => {\n        lastPaused = -1;\n        this.loadFeed();\n      };\n      /****************/\n    };\n\n    this.updateSize = () => {\n      const main = this.$$('.main');\n      const height = main.offsetHeight;\n      if (lastHeight !== height) {\n        ipc.send('resize-window', { height: height });\n        lastHeight = height;\n      }\n    };\n\n    this.loadFeed = _ => {\n      window.fetch('https://api.monocle.com/radio/?callback=monocle_24&_=' + Date.now()).then(response => {\n        return response.text();\n      }).then(text => {\n        const json = text.replace(/monocle_24\\(/g, '').replace(/\\);/g, '');\n        if (json) {\n          const data = JSON.parse(json);\n          if (data) {\n            this.monocle_24(data);\n          }\n        }\n      }).catch(error => {\n        console.error('ERROR', error);\n      });\n    };\n\n    this.init = _ => {\n      ipc.addListener('reset-player', _ => {\n        this.reloadRadio();\n      });\n\n      this.refreshRadio();\n      this.loadFeed();\n      this.updateSize();\n    };\n  };\n\n  const radio = new MonocleRadio();\n\n  window.MonocleRadio = radio;\n  window.monocle_24 = radio.monocle_24;\n  window.setInterval(radio.loadFeed, 20000);\n  // end\n\n  radio.init();\n})();\n\n//////////////////\n// WEBPACK FOOTER\n// ./app.js\n// module id = 0\n// module chunks = 0\n\n//# sourceURL=webpack:///./app.js?");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

eval("module.exports = require(\"electron\");\n\n//////////////////\n// WEBPACK FOOTER\n// external \"electron\"\n// module id = 1\n// module chunks = 0\n\n//# sourceURL=webpack:///external_%22electron%22?");

/***/ })
/******/ ]);