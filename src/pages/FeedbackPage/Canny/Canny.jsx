export default class Canny {
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
