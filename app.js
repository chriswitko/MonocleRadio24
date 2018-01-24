(function () {
  const ipc = require('electron').ipcRenderer
  let lastHeight = 0
  let lastPaused = -1
  let headlines = null

  const MonocleRadio = function () {
    this.$$ = sel => document.querySelector(sel)
    this.show = el => (el.style.display = '')
    this.hide = el => (el.style.display = 'none')
    this.html = (el, html) => (el.innerHTML = html)

    this.monocle_24 = data => {
      const cover = this.$$('#cover')
      const artist = this.$$('#artist')
      const space = this.$$('#space')
      const title = this.$$('#title')
      if (data.id) {
        if (data['image'] !== 'Null') {
          const filename = data['image'].replace(
            '/uploads/image/radio/shows/',
            ''
          )
          cover.setAttribute(
            'style',
            `background: transparent url(https://img.monocle.com/radio/shows/${filename}?w=400&h=400&q=60) no-repeat 50% 50%; background-size: cover`
          )
          this.show(cover)
        } else {
          this.hide(cover)
        }
        if (data['current-track-artist'] !== 'Null') {
          this.html(artist, data['current-track-artist'])
          this.show(space)
          this.html(title, data['current-track-title'])
        } else {
          this.html(artist, data['show'])
          this.html(title, '')
          this.hide(space)
        }
      }
      this.updateSize()
    }

    this.showMenu = _ => {
      ipc.send('show-config-menu')
    }

    this.reloadRadio = _ => {
      if (this.shouldRefreshRadio()) {
        console.log('refreshing radio')
        this.refreshRadio(true)
      } else {
        console.log('no refresh needed')
      }
    }

    this.shouldRefreshRadio = _ => {
      if (lastPaused !== -1) {
        let now = new Date().getTime()
        let diff = parseInt((now - lastPaused) / 1000, 10)
        if (diff > 60) { // should be 60
          return true
        }
      }
      return false
    }

    this.refreshRadio = (reload = false) => {
      const sourceUrl = 'https://radio.monocle.com/live'
      const audio = this.$$('#player')
      const mp3Src = this.$$('#mp3_src')
      mp3Src.setAttribute('src', sourceUrl)
      /****************/
      audio.pause()
      audio.load() // suspends and restores all audio element

      if (reload) {
        audio.play()
      }
      audio.oncanplaythrough = audio.play()
      audio.onpause = _ => {
        lastPaused = new Date().getTime()
      }
      audio.onplay = _ => {
        lastPaused = -1
      }
      /****************/
    }

    this.updateSize = () => {
      const main = this.$$('.main')
      const height = main.offsetHeight
      if (lastHeight !== height) {
        ipc.send('resize-window', { height: height })
        lastHeight = height
      }
    }

    this.loadFeed = _ => {
      window.fetch('https://api.monocle.com/radio/?callback=monocle_24&_=' + Date.now())
        .then(response => {
          return response.text()
        })
        .then(text => {
          const json = text.replace(/monocle_24\(/g, '').replace(/\);/g, '')
          if (json) {
            const data = JSON.parse(json)
            if (data) {
              this.monocle_24(data)
            }
          }
        })
        .catch(error => {
          console.error('ERROR', error)
        })
    }

    this.init = _ => {
      ipc.addListener('reset-player', _ => {
        this.reloadRadio()
        this.loadFeed()
        headlines = window.setInterval(this.loadFeed, 20000)
      })

      ipc.addListener('stop-headlines', _ => {
        if (headlines) {
          window.clearInterval(headlines)
        }
      })

      this.refreshRadio()
      this.loadFeed()
      this.updateSize()

      headlines = window.setInterval(this.loadFeed, 20000)
    }
  }

  const radio = new MonocleRadio()

  window.MonocleRadio = radio
  window.monocle_24 = radio.monocle_24
  // end

  radio.init()
})()
