import { useMemo } from 'react'

/**
 * Returns a custom downshift `environment` object that guards against
 * `document.body` being null. This can happen on iOS Safari during SPA
 * navigation: downshift's debounced a11y status update (200ms) may fire
 * after a component unmounts, at which point `document.body` is temporarily
 * null, causing a TypeError. Passing a safe environment makes the append
 * a no-op in that case.
 */
function useDownshiftEnvironment() {
  return useMemo(() => {
    if (typeof window === 'undefined') return undefined

    const noopBody = {
      appendChild: () => {},
      removeChild: () => {},
    }

    const safeDocument = new Proxy(window.document, {
      get(target, prop) {
        if (prop === 'body') {
          return target.body ?? noopBody
        }
        const value = target[prop]
        return typeof value === 'function' ? value.bind(target) : value
      },
    })

    return Object.assign(Object.create(window), { document: safeDocument })
  }, [])
}

export default useDownshiftEnvironment