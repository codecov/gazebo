/**
 * Recursively calls requestAnimationFrame until a specified delay has been met or exceeded.
 * When the delay time has been reached the function you're timing out will be called.
 *
 * This was re-copied from https://github.com/getsentry/sentry/blob/master/static/app/utils/profiling/hooks/useVirtualizedTree/virtualizedTreeUtils.tsx#L115-L157
 *
 * This was copied from react-virtualized, with credits to the original author.
 *
 * Credit: Joe Lambert (https://gist.github.com/joelambert/1002116#file-requesttimeout-js)
 */
type AnimationTimeoutId = {
  id: number
}

export function requestAnimationTimeout(
  callback: () => void,
  delay: number
): AnimationTimeoutId {
  let start: number
  // wait for end of processing current event handler, because event handler may be long
  Promise.resolve().then(() => {
    start = Date.now()
  })

  const timeout = () => {
    if (start === undefined) {
      frame.id = window.requestAnimationFrame(timeout)
      return
    }
    if (Date.now() - start >= delay) {
      callback()
    } else {
      frame.id = window.requestAnimationFrame(timeout)
    }
  }

  const frame: AnimationTimeoutId = {
    id: window.requestAnimationFrame(timeout),
  }

  return frame
}

export function cancelAnimationTimeout(frame: AnimationTimeoutId) {
  window.cancelAnimationFrame(frame.id)
}
