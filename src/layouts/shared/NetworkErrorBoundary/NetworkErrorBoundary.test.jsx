import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { Component, Suspense, useState } from 'react'
import { MemoryRouter, Route, useHistory } from 'react-router-dom'
import { vi } from 'vitest'

import config from 'config'

import NetworkErrorBoundary from './NetworkErrorBoundary'

// silence all verbose console.error
vi.spyOn(console, 'error').mockImplementation(() => undefined)
vi.mock('config')

const mockUser = {
  me: {
    owner: {
      defaultOrgUsername: 'codecov',
    },
    email: 'jane.doe@codecov.io',
    privateAccess: true,
    onboardingCompleted: true,
    businessEmail: 'jane.doe@codecov.io',
    termsAgreement: true,
    user: {
      name: 'Jane Doe',
      username: 'janedoe',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      avatar: 'http://127.0.0.1/avatar-url',
      student: false,
      studentCreatedAt: null,
      studentUpdatedAt: null,
    },
    trackingMetadata: {
      service: 'github',
      ownerid: 123,
      serviceId: '123',
      plan: 'users-basic',
      staff: false,
      hasYaml: false,
      bot: null,
      delinquent: null,
      didTrial: null,
      planProvider: null,
      planUserCount: 1,
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      profile: {
        createdAt: 'timestamp',
        otherGoal: null,
        typeProjects: [],
        goals: [],
      },
    },
  },
}

const nullUser = {
  me: null,
}

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
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
function ErrorComponent({ status, detail, typename, dev, error }) {
  // eslint-disable-next-line no-throw-literal
  throw {
    status,
    data: { detail },
    dev,
    error,
    __typename: typename,
  }
  // eslint-disable-next-line no-unreachable
  return null
}

// eslint-disable-next-line react/prop-types
function App({ status, detail, typename, dev, error }) {
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
                dev={dev}
                error={error}
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
  ({ children }) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, suspense: true } },
    })

    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider">
            <Suspense fallback={<div>Loading</div>}>{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

describe('NetworkErrorBoundary', () => {
  function setup(
    { isSelfHosted = false, user = nullUser } = {
      isSelfHosted: false,
      user: nullUser,
    }
  ) {
    config.IS_SELF_HOSTED = isSelfHosted

    server.use(
      graphql.query('CurrentUser', () => {
        return HttpResponse.json({ data: user })
      })
    )

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
  })

  describe('when the children component has a 400 error', () => {
    describe('when not running in self-hosted mode', () => {
      it('renders a Bad Request', async () => {
        const { user } = setup()
        render(<App status={400} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const badRequest = await screen.findByText(/Bad Request/)
        expect(badRequest).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        const { user } = setup()
        render(<App status={400} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
    })

    describe('when running in self hosted mode', () => {
      it('renders a Bad Request', async () => {
        const { user } = setup({ isSelfHosted: true })
        render(<App status={400} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const badRequest = await screen.findByText(/Bad Request/)
        expect(badRequest).toBeInTheDocument()
      })

      it('renders return to previous page button', async () => {
        const { user } = setup({ isSelfHosted: true })
        render(<App status={400} />, {
          wrapper: wrapper(),
        })

        const textBox = await screen.findByRole('textbox')
        await user.type(textBox, 'fail')

        const button = await screen.findByText('Return to previous page')
        expect(button).toBeInTheDocument()
      })
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

      describe('user is not logged in', () => {
        it('renders a login button', async () => {
          const { user } = setup({ user: nullUser })
          render(<App status={404} />, {
            wrapper: wrapper(),
          })

          const textBox = await screen.findByRole('textbox')
          await user.type(textBox, 'fail')

          const queryString = qs.stringify({ to: '/gh/codecov' })
          const loginButton = await screen.findByText(/Log in/)
          expect(loginButton).toBeInTheDocument()
          expect(loginButton).toHaveAttribute('href', `/login?${queryString}`)
        })
      })

      describe('user is logged in', () => {
        it('does not render a login button', async () => {
          const { user } = setup({ user: mockUser })
          render(<App status={404} />, {
            wrapper: wrapper(),
          })

          const textBox = await screen.findByRole('textbox')
          await user.type(textBox, 'fail')

          const notFound = await screen.findByText(/Not found/)
          expect(notFound).toBeInTheDocument()

          const loginButton = screen.queryByText(/Log in/)
          expect(loginButton).not.toBeInTheDocument()
        })
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

        const pleaseSee = await screen.findByText(/please see/)
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

      describe('user is not logged in', () => {
        it('renders a login button', async () => {
          const { user } = setup({ user: nullUser, isSelfHosted: true })
          render(<App status={404} />, {
            wrapper: wrapper(),
          })

          const textBox = await screen.findByRole('textbox')
          await user.type(textBox, 'fail')

          const queryString = qs.stringify({ to: '/gh/codecov' })
          const loginButton = await screen.findByText(/Log in/)
          expect(loginButton).toBeInTheDocument()
          expect(loginButton).toHaveAttribute('href', `/?${queryString}`)
        })
      })

      describe('user is logged in', () => {
        it('does not render a login button', async () => {
          const { user } = setup({ user: mockUser, isSelfHosted: true })
          render(<App status={404} />, {
            wrapper: wrapper(),
          })

          const textBox = await screen.findByRole('textbox')
          await user.type(textBox, 'fail')

          const notFound = await screen.findByText(/Not found/)
          expect(notFound).toBeInTheDocument()

          const loginButton = screen.queryByText(/Log in/)
          expect(loginButton).not.toBeInTheDocument()
        })
      })
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
          json: () => Promise.resolve({ data: nullUser }),
        })
      )

      const textBox = await screen.findByRole('textbox')
      await user.type(textBox, 'fail')

      const button = await screen.findByText('Return to log in')
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
