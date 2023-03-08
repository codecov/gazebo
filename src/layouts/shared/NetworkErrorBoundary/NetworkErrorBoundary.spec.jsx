import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Component, useState } from 'react'
import { MemoryRouter, useHistory } from 'react-router-dom'

import config from 'config'

import NetworkErrorBoundary from './NetworkErrorBoundary'

// silence all verbose console.error
jest.spyOn(console, 'error').mockImplementation()
jest.mock('config')

const queryClient = new QueryClient()

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
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    )

describe('NetworkErrorBoundary', () => {
  function setup({ isSelfHosted = false } = { isSelfHosted: false }) {
    config.IS_SELF_HOSTED = isSelfHosted
  }

  describe('when rendered with children', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the children', () => {
      render(<App status={200} />, { wrapper: wrapper() })

      expect(screen.getByText(/things are good/)).toBeInTheDocument()
    })
  })

  describe('when the children component crashes', () => {
    beforeEach(() => {
      setup()
    })

    it('propagate the error as its not a network error', async () => {
      render(<App status={100} />, { wrapper: wrapper() })

      const textBox = screen.getByRole('textbox')
      userEvent.type(textBox, 'fail')

      const temp = screen.queryByText('things are good')
      expect(temp).not.toBeInTheDocument()

      const errorMessage = screen.getByText('Custom Error has been thrown')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('when the children component has a 401 error', () => {
    beforeEach(() => {
      setup()
    })

    it('renders a please login', async () => {
      render(<App status={401} detail="not authenticated" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const logInText = await screen.findByText(/Please log in/)
      expect(logInText).toBeInTheDocument()
    })

    it('renders the detail from data', async () => {
      render(<App status={401} detail="not authenticated" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const notAuthenticated = await screen.findByText(/not authenticated/)
      expect(notAuthenticated).toBeInTheDocument()
    })

    it('renders return to previous page button', async () => {
      render(<App status={401} detail="not authenticated" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const returnButton = await screen.findByText('Return to previous page')
      expect(returnButton).toBeInTheDocument()
    })
  })

  describe('when the children component has a 403 error', () => {
    beforeEach(() => {
      setup()
    })

    it('renders a Unauthorized', async () => {
      render(<App status={403} detail="you not admin" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const unauthorized = await screen.findByText(/Unauthorized/)
      expect(unauthorized).toBeInTheDocument()
    })

    it('renders the detail from data', async () => {
      render(<App status={403} detail="you not admin" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const detail = await screen.findByText(/you not admin/)
      expect(detail).toBeInTheDocument()
    })

    it('renders return to previous page button', async () => {
      render(<App status={403} detail="you not admin" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const button = await screen.findByText('Return to previous page')
      expect(button).toBeInTheDocument()
    })
  })

  describe('when the children component has a 404 error', () => {
    describe('when not running in self-hosted mode', () => {
      beforeEach(() => {
        setup({ status: 404 })
      })

      it('renders a Not found', async () => {
        render(<App status={404} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const notFound = await screen.findByText(/Not found/)
        expect(notFound).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        render(<App status={404} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })

    describe('when running in self hosted mode', () => {
      beforeEach(() => {
        setup({ isSelfHosted: true })
      })

      it('renders a Not found', async () => {
        render(<App status={404} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const pleaseSee = await screen.findByText(/Please see/)
        expect(pleaseSee).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        render(<App status={404} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('when the children component has a 500 error', () => {
    describe('when not running in self-hosted mode', () => {
      beforeEach(() => {
        setup()
      })

      it('renders a Server error', async () => {
        render(<App status={500} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const serverError = await screen.findByText(/Server error/)
        expect(serverError).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        render(<App status={500} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })

    describe('when running in self-hosted mode', () => {
      beforeEach(() => {
        setup({ isSelfHosted: true })
      })

      it('renders a Server error', async () => {
        render(<App status={500} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const pleaseSee = await screen.findByText(/Please see/)
        expect(pleaseSee).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        render(<App status={500} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('when the children component has an UnauthenticatedError GraphQL error', () => {
    beforeEach(() => {
      setup()
    })

    it('renders a Not found', async () => {
      render(<App typename="UnauthenticatedError" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const logIn = await screen.findByText(/Please log in/)
      expect(logIn).toBeInTheDocument()
    })

    it('renders return to previous page button', async () => {
      render(<App typename="UnauthenticatedError" />, {
        wrapper: wrapper(),
      })

      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const button = await screen.findByText('Return to previous page')
      expect(button).toBeInTheDocument()
    })
  })

  describe('user is able to recover from error', () => {
    beforeEach(() => {
      setup()
    })

    describe('user clicks on reset button', () => {
      it('renders a things are good', async () => {
        render(<App status={403} detail="you not admin" />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        userEvent.click(button)

        userEvent.type(textBox, 'pass')

        const thingsAreGood = await screen.findByText(/things are good/)
        expect(thingsAreGood).toBeInTheDocument()
      })
    })

    describe('user navigates back', () => {
      it('renders a things are good', async () => {
        render(<App status={403} detail="you not admin" />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const button = await screen.findByText('Go back')
        userEvent.click(button)

        userEvent.type(textBox, 'pass')

        const thingsAreGood = await screen.findByText(/things are good/)
        expect(thingsAreGood).toBeInTheDocument()
      })
    })
  })
})
