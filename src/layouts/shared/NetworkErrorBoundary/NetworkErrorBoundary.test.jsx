import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Component, useState } from 'react'
import { MemoryRouter, useHistory } from 'react-router-dom'
import { vi } from 'vitest'

import config from 'config'

import NetworkErrorBoundary from './NetworkErrorBoundary'

// silence all verbose console.error
vi.spyOn(console, 'error').mockImplementation(() => undefined)
vi.mock('config')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

afterEach(() => {
  queryClient.clear()
})

class TestErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return <p>Custom Error has been thrown</p>
    }

    return <>{this.props.children}</>
  }
}

// eslint-disable-next-line react/prop-types
function ErrorComponent({ status, detail, typename }) {
  // eslint-disable-next-line no-throw-literal
  throw {
    status,
    data: {
      detail,
    },
    __typename: typename,
  }
  // eslint-disable-next-line no-unreachable
  return null
}

// eslint-disable-next-line react/prop-types
function App({ status, detail, typename }) {
  const [text, setText] = useState('')
  const history = useHistory()

  function handleChange(e) {
    setText(e.target.value)
  }

  return (
    <div>
      <div>
        <label htmlFor="text">Text</label>
        <input type="text" id="text" onChange={handleChange} />
      </div>
      <div>{text === 'fail' ? 'Oh no' : 'things are good'}</div>
      <button
        onClick={() => {
          history.goBack()
        }}
      >
        Go back
      </button>
      <div>
        <TestErrorBoundary>
          <NetworkErrorBoundary>
            {text === 'fail' ? (
              <ErrorComponent
                status={status}
                detail={detail}
                typename={typename}
              />
            ) : (
              'type "fail"'
            )}
          </NetworkErrorBoundary>
        </TestErrorBoundary>
      </div>
    </div>
  )
}

const wrapper =
  (initialEntries = ['/gh/codecov', '/gh']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  )

describe('NetworkErrorBoundary', () => {
  function setup({ isSelfHosted = false } = { isSelfHosted: false }) {
    config.IS_SELF_HOSTED = isSelfHosted

    return { user: userEvent.setup() }
  }

  describe('when rendered with children', () => {
    it('renders the children', () => {
      setup()
      render(<App status={200} />, { wrapper: wrapper() })

      expect(screen.getByText(/things are good/)).toBeInTheDocument()
    })
  })

  describe('when the children component crashes', () => {
    it('propagate the error as its not a network error', async () => {
      const { user } = setup()
      render(<App status={100} />, { wrapper: wrapper() })

      const textBox = screen.getByRole('textbox')
      await user.type(textBox, 'fail')

      const temp = screen.queryByText('things are good')
      expect(temp).not.toBeInTheDocument()

      const errorMessage = screen.getByText('Custom Error has been thrown')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('when the children component has a 401 error', () => {
    it('renders a please login', async () => {
      const { user } = setup()
      render(<App status={401} detail="not authenticated" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      const logInText = await screen.findByText(/Please log in/)
      expect(logInText).toBeInTheDocument()
    })

    it('renders the detail from data', async () => {
      const { user } = setup()
      render(<App status={401} detail="not authenticated" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      const notAuthenticated = await screen.findByText(/not authenticated/)
      expect(notAuthenticated).toBeInTheDocument()
    })

    it('renders return to previous page button', async () => {
      const { user } = setup()
      render(<App status={401} detail="not authenticated" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      const returnButton = await screen.findByText('Return to previous page')
      expect(returnButton).toBeInTheDocument()
    })

    it('sends metric to sentry', async () => {
      const { user } = setup()
      render(<App status={401} detail="not authenticated" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      await waitFor(() =>
        expect(Sentry.metrics.increment).toHaveBeenCalledWith(
          'network_errors.network_status.401',
          1,
          undefined
        )
      )
    })
  })

  describe('when the children component has a 403 error', () => {
    it('renders a Unauthorized', async () => {
      const { user } = setup()
      render(<App status={403} detail="you not admin" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      const unauthorized = await screen.findByText(/Unauthorized/)
      expect(unauthorized).toBeInTheDocument()
    })

    it('renders the detail from data', async () => {
      const { user } = setup()
      render(<App status={403} detail="you not admin" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      const detail = await screen.findByText(/you not admin/)
      expect(detail).toBeInTheDocument()
    })

    it('renders return to previous page button', async () => {
      const { user } = setup()
      render(<App status={403} detail="you not admin" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      const button = await screen.findByText('Return to previous page')
      expect(button).toBeInTheDocument()
    })

    it('sends metric to sentry', async () => {
      const { user } = setup()
      render(<App status={403} detail="you not admin" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      await waitFor(() =>
        expect(Sentry.metrics.increment).toHaveBeenCalledWith(
          'network_errors.network_status.403',
          1,
          undefined
        )
      )
    })
  })

  describe('when the children component has a 404 error', () => {
    describe('when not running in self-hosted mode', () => {
      it('renders a Not found', async () => {
        const { user } = setup()
        render(<App status={404} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const notFound = await screen.findByText(/Not found/)
        expect(notFound).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        const { user } = setup()
        render(<App status={404} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })

    describe('when running in self hosted mode', () => {
      it('renders a Not found', async () => {
        const { user } = setup({ isSelfHosted: true })
        render(<App status={404} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const pleaseSee = await screen.findByText(/Please see/)
        expect(pleaseSee).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        const { user } = setup({ isSelfHosted: true })
        render(<App status={404} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })

    it('sends metric to sentry', async () => {
      const { user } = setup()
      render(<App status={404} detail="not found" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      await waitFor(() =>
        expect(Sentry.metrics.increment).toHaveBeenCalledWith(
          'network_errors.network_status.404',
          1,
          undefined
        )
      )
    })
  })

  describe('when the children component has a 429 error', () => {
    it('renders a Rate limit exceeded error', async () => {
      const { user } = setup()
      render(<App status={429} />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      const tooManyRequestsError =
        await screen.findByText(/Rate limit exceeded/)
      expect(tooManyRequestsError).toBeInTheDocument()
    })

    it('renders return to login button', async () => {
      const { user } = setup()
      render(<App status={429} />, {
        wrapper: wrapper(),
      })

      // Mock the global fetch function
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      )

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      const button = await screen.findByText('Return to login')
      expect(button).toBeInTheDocument()

      await user.click(button)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`${config.API_URL}/logout`, {
          method: 'POST',
          credentials: 'include',
        })
      })

      // Clean up the mock
      global.fetch.mockRestore()
    })

    it('sends metric to sentry', async () => {
      const { user } = setup()
      render(<App status={429} detail="rate throttled" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      await waitFor(() =>
        expect(Sentry.metrics.increment).toHaveBeenCalledWith(
          'network_errors.network_status.429',
          1,
          undefined
        )
      )
    })
  })

  describe('when the children component has a 500 error', () => {
    describe('when not running in self-hosted mode', () => {
      it('renders a Server error', async () => {
        const { user } = setup()
        render(<App status={500} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const serverError = await screen.findByText(/Server error/)
        expect(serverError).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        const { user } = setup()
        render(<App status={500} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })

    describe('when running in self-hosted mode', () => {
      it('renders a Server error', async () => {
        const { user } = setup({ isSelfHosted: true })
        render(<App status={500} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const pleaseSee = await screen.findByText(/Please see/)
        expect(pleaseSee).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        const { user } = setup({ isSelfHosted: true })
        render(<App status={500} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })

    it('sends metric to sentry', async () => {
      const { user } = setup()
      render(<App status={500} detail="internal server error" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      await waitFor(() =>
        expect(Sentry.metrics.increment).toHaveBeenCalledWith(
          'network_errors.network_status.500',
          1,
          undefined
        )
      )
    })
  })

  describe('when the children component has an UnauthenticatedError GraphQL error', () => {
    it('renders a Not found', async () => {
      const { user } = setup()
      render(<App typename="UnauthenticatedError" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      const logIn = await screen.findByText(/Please log in/)
      expect(logIn).toBeInTheDocument()
    })

    it('renders return to previous page button', async () => {
      const { user } = setup()
      render(<App typename="UnauthenticatedError" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      const button = await screen.findByText('Return to previous page')
      expect(button).toBeInTheDocument()
    })

    it('sends metric to sentry', async () => {
      const { user } = setup()
      render(<App typename="UnauthenticatedError" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      await waitFor(() =>
        expect(Sentry.metrics.increment).toHaveBeenCalledWith(
          'network_errors.graphql.unauthenticated_error',
          1,
          undefined
        )
      )
    })
  })

  describe('user is able to recover from error', () => {
    describe('user clicks on reset button', () => {
      it('renders a things are good', async () => {
        const { user } = setup()
        render(<App status={403} detail="you not admin" />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        await user.click(button)

        await user.type(textBox, 'pass')

        const thingsAreGood = await screen.findByText(/things are good/)
        expect(thingsAreGood).toBeInTheDocument()
      })
    })

    describe('user navigates back', () => {
      it('renders a things are good', async () => {
        const { user } = setup()
        render(<App status={403} detail="you not admin" />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const button = await screen.findByText('Go back')
        await user.click(button)

        await user.type(textBox, 'pass')

        const thingsAreGood = await screen.findByText(/things are good/)
        expect(thingsAreGood).toBeInTheDocument()
      })
    })
  })
})
