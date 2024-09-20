import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// not sure why this lint is being fired here so I'm disabling it
// eslint-disable-next-line testing-library/await-fire-event
expect.extend(matchers)

// Prevent timezone differences between local and CI/CD
const setupTestGlobal = async () => {
  process.env.TZ = 'UTC'
}

export default setupTestGlobal

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

afterEach(() => {
  cleanup()
})
