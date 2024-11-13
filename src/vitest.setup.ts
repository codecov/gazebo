import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// not sure why this lint is being fired here so I'm disabling it
// eslint-disable-next-line testing-library/await-async-events
expect.extend(matchers)

// Prevent timezone differences between local and CI/CD
process.env.TZ = 'UTC'

process.env.REACT_APP_ZOD_IGNORE_TESTS = 'true'

vi.mock('@sentry/react', async () => {
  const originalModule = await vi.importActual('@sentry/react')

  return {
    ...originalModule,
    setUser: vi.fn(),
    withScope: vi.fn(),
    metrics: {
      ...originalModule.metrics!,
      distribution: vi.fn(),
      gauge: vi.fn(),
      increment: vi.fn(),
      set: vi.fn(),
    },
  }
})

window.matchMedia = vi.fn().mockResolvedValue({ matches: false })

beforeAll(() => {
  globalThis.jest = {
    ...globalThis.jest,
    // This is a bit of a hack to get Vitest fake timers setup to work with waitFor and findBy's
    // GH Issue: https://github.com/testing-library/react-testing-library/issues/1197#issuecomment-1693824628
    // @ts-ignore-error
    advanceTimersByTime: vi.advanceTimersByTime.bind(vi),

    /*
     * Since doing this hack means we now have a jest global defined, we must also redefine jest.fn to be vi.fn,
     * otherwise the following lines of code in react-intersection-observer/src/test-utils.ts break:
     *
     * // Use the exposed mock function. Currently, only supports Jest (`jest.fn`) and Vitest with globals (`vi.fn`).
     * if (typeof jest !== "undefined") setupIntersectionMocking(jest.fn);
     * else if (typeof vi !== "undefined") {
     * setupIntersectionMocking(vi.fn);
     * }
     */

    fn: vi.fn.bind(vi),
  }
})

afterEach(() => {
  cleanup()
})
