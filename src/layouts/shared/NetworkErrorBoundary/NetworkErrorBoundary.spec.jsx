import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'

import config from 'config'

import NetworkErrorBoundary from './NetworkErrorBoundary'

// silence all verbose console.error
jest.spyOn(console, 'error').mockImplementation()
jest.mock('config')

const queryClient = new QueryClient()

afterEach(() => {
  queryClient.clear()
})

describe('NetworkErrorBoundary', () => {
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
        <div>
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
        </div>
      </div>
    )
  }

  function setup({
    isSelfHosted = false,
    status = 200,
    detail,
    typename,
    randomError,
  }) {
    config.IS_SELF_HOSTED = isSelfHosted

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/gh/codecov', '/gh']}>
          <App
            status={status}
            detail={detail}
            typename={typename}
            randomError={randomError}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('when rendered with children', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders the children', () => {
      expect(screen.getByText(/things are good/)).toBeInTheDocument()
    })
  })

  describe('when the children component crashes', () => {
    beforeEach(() => {
      setup({ status: 100 })
    })

    it('propagate the error as its not a network error', async () => {
      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const temp = screen.queryByText('things are good')
      expect(temp).not.toBeInTheDocument()
    })
  })

  describe('when the children component has a 401 error', () => {
    beforeEach(() => {
      setup({ status: 401, detail: 'not authenticated' })
    })

    it('renders a please login', async () => {
      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const logInText = await screen.findByText(/Please log in/)
      expect(logInText).toBeInTheDocument()
    })

    it('renders the detail from data', async () => {
      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const notAuthenticated = await screen.findByText(/not authenticated/)
      expect(notAuthenticated).toBeInTheDocument()
    })

    it('renders return to previous page button', async () => {
      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const returnButton = await screen.findByText('Return to previous page')
      expect(returnButton).toBeInTheDocument()
    })
  })

  describe('when the children component has a 403 error', () => {
    beforeEach(() => {
      setup({ status: 403, detail: 'you not admin' })
    })

    it('renders a Unauthorized', async () => {
      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const unauthorized = await screen.findByText(/Unauthorized/)
      expect(unauthorized).toBeInTheDocument()
    })

    it('renders the detail from data', async () => {
      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const detail = await screen.findByText(/you not admin/)
      expect(detail).toBeInTheDocument()
    })

    it('renders return to previous page button', async () => {
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
        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const notFound = await screen.findByText(/Not found/)
        expect(notFound).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })

    describe('when running in self hosted mode', () => {
      beforeEach(() => {
        setup({ status: 404, isSelfHosted: true })
      })

      it('renders a Not found', async () => {
        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const pleaseSee = await screen.findByText(/Please see/)
        expect(pleaseSee).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
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
        setup({ status: 500 })
      })

      it('renders a Server error', async () => {
        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const serverError = await screen.findByText(/Server error/)
        expect(serverError).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })

    describe('when running in self-hosted mode', () => {
      beforeEach(() => {
        setup({ status: 500, isSelfHosted: true })
      })

      it('renders a Server error', async () => {
        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const pleaseSee = await screen.findByText(/Please see/)
        expect(pleaseSee).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        const textBox = await screen.findByRole('textbox')
        userEvent.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('when the children component has an UnauthenticatedError GraphQL error', () => {
    beforeEach(() => {
      setup({ typename: 'UnauthenticatedError' })
    })

    it('renders a Not found', async () => {
      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const logIn = await screen.findByText(/Please log in/)
      expect(logIn).toBeInTheDocument()
    })

    it('renders return to previous page button', async () => {
      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const button = await screen.findByText('Return to previous page')
      expect(button).toBeInTheDocument()
    })
  })

  describe('user is able to recover from error', () => {
    beforeEach(() => {
      setup({ status: 403, detail: 'you not admin' })
    })

    it('renders a things are good', async () => {
      const textBox = await screen.findByRole('textbox')
      userEvent.type(textBox, 'fail')

      const button = await screen.findByText('Return to previous page')
      userEvent.click(button)

      userEvent.type(textBox, 'pass')

      const thingsAreGood = await screen.findByText(/things are good/)
      expect(thingsAreGood).toBeInTheDocument()
    })
  })
})
