/**
 * Polyfill for the deprecated MediaQueryList.addListener/removeListener APIs.
 *
 * Some third-party libraries (e.g. react-hot-toast v2.4.1) still use the
 * deprecated addListener/removeListener methods on MediaQueryList. Modern
 * browsers are removing these in favour of addEventListener/removeEventListener.
 * This polyfill restores them so those libraries continue to work.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/addListener
 */
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const mql = window.matchMedia('')
  if (mql && typeof mql.addListener === 'undefined') {
    MediaQueryList.prototype.addListener = function (
      handler: Parameters<MediaQueryList['addEventListener']>[1]
    ) {
      this.addEventListener('change', handler)
    }
    MediaQueryList.prototype.removeListener = function (
      handler: Parameters<MediaQueryList['removeEventListener']>[1]
    ) {
      this.removeEventListener('change', handler)
    }
  }
}