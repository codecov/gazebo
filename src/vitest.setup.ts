import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// not sure why this lint is being fired here so I'm disabling it
// eslint-disable-next-line testing-library/await-fire-event
expect.extend(matchers)

// Prevent timezone differences between local and CI/CD
process.env.TZ = 'UTC'

process.env.REACT_APP_ZOD_IGNORE_TESTS = 'true'

vi.mock('@sentry/react', async () => {
  const originalModule = await vi.importActual('@sentry/react')

  return {
    ...originalModule,
    setUser: vi.fn(),
    metrics: {
      ...originalModule.metrics!,
      distribution: vi.fn(),
      gauge: vi.fn(),
      increment: vi.fn(),
      set: vi.fn(),
    },
  }
})

beforeAll(() => {
  // This is a bit of a hack to get Vitest fake timers setup to work with waitFor and findBy's
  // GH Issue: https://github.com/testing-library/react-testing-library/issues/1197#issuecomment-1693824628
  // @ts-expect-error - we need to add this to the global object for some internal deps to work
  globalThis.jest = {
    // @ts-expect-error - we need to add this to the global object for some internal deps to work
    ...globalThis.jest,
    /**
     * From react-intersection-observer/test-utils
     * // Use the exposed mock function. Currently, only supports Jest (`jest.fn`) and Vitest with globals (`vi.fn`).
     * if (typeof jest !== 'undefined')
     *   setupIntersectionMocking(jest.fn);
     * else if (typeof vi !== 'undefined')
     *   setupIntersectionMocking(vi.fn);
     */

    fn: vi.fn.bind(vi),
    advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
  }
})

afterEach(() => {
  cleanup()
})
