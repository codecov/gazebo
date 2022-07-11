export class Canny {
  canny

  constructor(canny) {
    this.canny = canny
  }

  async render(options) {
    if (this.canny) {
      this.canny('render', options)
    }
  }
}

export class CannyLoader {
  get Canny() {
    return window.Canny
  }

  async load() {
    if (this.Canny) {
      return this.Canny
    }

    const script = document.createElement('script')

    script.type = 'text/javascript'
    script.async = true
    script.src = 'https://canny.io/sdk.js'

    return new Promise((resolve, reject) => {
      script.onload = () => {
        resolve(window.Canny)
      }

      script.onerror = (err) => {
        reject(err)
      }

      document.head.append(script)
    })
  }
}
