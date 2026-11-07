import * as Sentry from '@sentry/react'
import { createBrowserHistory } from 'history'

import { setupSentry } from './sentry'

vi.mock('./config', () => ({
  default: {
    SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
    SENTRY_ENVIRONMENT: 'test',
    API_URL: 'https://api.codecov.io',
    NODE_ENV: 'test',
  },
}))

vi.mock('@sentry/react', async () => {
  const actual =
    await vi.importActual<typeof import('@sentry/react')>('@sentry/react')
  return { ...actual, init: vi.fn() }
})

const matchesIgnored = (patterns: Array<string | RegExp>, message: string) =>
  patterns.some((pattern) =>
    typeof pattern === 'string'
      ? message.includes(pattern)
      : pattern.test(message)
  )

describe('setupSentry', () => {
  it('ignores the adoptedStyleSheets error thrown by browser extensions', () => {
    setupSentry({ history: createBrowserHistory() })

    const options = vi.mocked(Sentry.init).mock.calls[0]?.[0]
    const ignoreErrors = (options?.ignoreErrors ?? []) as Array<string | RegExp>

    expect(
      matchesIgnored(
        ignoreErrors,
        `TypeError: can't redefine non-configurable property "adoptedStyleSheets"`
      )
    ).toBe(true)
    expect(
      matchesIgnored(
        ignoreErrors,
        'TypeError: Cannot redefine property: adoptedStyleSheets'
      )
    ).toBe(true)
    expect(
      matchesIgnored(ignoreErrors, 'TypeError: Cannot read properties of null')
    ).toBe(false)
  })
})
