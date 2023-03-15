import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Footer from './Footer'

jest.mock('config')

const loggedInUser = {
  user: {
    username: 'p',
    avatarUrl: '',
  },
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()

  // this console mock here is to block out un-auth user
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('Footer', () => {
  function setup(
    { userData = undefined, selfHosted = false, versionNumber } = {
      userData: undefined,
      selfHosted: false,
      versionNumber: undefined,
    }
  ) {
    config.IS_SELF_HOSTED = selfHosted
    config.CODECOV_VERSION = versionNumber

    server.use(
      graphql.query('CurrentUser', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ me: userData }))
      )
    )
  }

  describe('rendering the feedback link', () => {
    describe('user is signed in', () => {
      beforeEach(() => {
        setup({ userData: loggedInUser })
      })
      afterEach(() => jest.resetAllMocks())

      it('renders the link', async () => {
        render(<Footer />, { wrapper })

        const feedback = await screen.findByText('Feedback')
        expect(feedback).toBeInTheDocument()
      })
    })

    describe('user is not signed in', () => {
      beforeEach(() => {
        setup()
      })

      afterEach(() => jest.resetAllMocks())

      it('does not render link with no signed in user', async () => {
        render(<Footer />, { wrapper })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const feedBack = screen.queryByText('Feedback')
        expect(feedBack).toBeNull()
      })
    })
  })

  describe('renders the current years copyright', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('3301-01-01'))
      setup()
    })

    afterEach(() => jest.resetAllMocks())

    afterAll(() => {
      jest.useRealTimers()
    })

    it('renders a link', async () => {
      render(<Footer />, { wrapper })

      const copyright = await screen.findByText(`© 3301 Sentry`)
      expect(copyright).toBeInTheDocument()
    })
  })

  describe('build mode specific links', () => {
    describe('on cloud', () => {
      beforeEach(() => {
        setup()
      })

      afterEach(() => jest.resetAllMocks())

      it('renders the link', async () => {
        render(<Footer />, { wrapper })

        const pricing = await screen.findByText('Pricing')
        expect(pricing).toBeInTheDocument()
      })

      it('renders licensing link', async () => {
        render(<Footer />, { wrapper })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const licensing = screen.queryByText('Licensing')
        expect(licensing).not.toBeInTheDocument()
      })
    })
    describe('self hosted build', () => {
      beforeEach(() => {
        setup({ selfHosted: true })
      })

      afterEach(() => jest.resetAllMocks())

      it('does not render pricing link', async () => {
        render(<Footer />, { wrapper })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const pricing = screen.queryByText('Pricing')
        expect(pricing).not.toBeInTheDocument()
      })
      it('renders licensing link', async () => {
        render(<Footer />, { wrapper })

        const licensing = await screen.findByText('Licensing')
        expect(licensing).toBeInTheDocument()
      })
    })
  })

  describe('renders the version number', () => {
    describe('app is running in self hosted', () => {
      beforeEach(() => {
        setup({ selfHosted: true, versionNumber: 'v5.0.0' })
      })

      it('displays the version number', async () => {
        render(<Footer />, { wrapper })

        const versionNumber = await screen.findByText('v5.0.0')
        expect(versionNumber).toBeInTheDocument()
      })
    })

    describe('app is not running in self hosted', () => {
      beforeEach(() => {
        setup({ selfHosted: false })
      })
      it('does not display the version number', async () => {
        render(<Footer />, { wrapper })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const versionNumber = screen.queryByText('v5.0.0')
        expect(versionNumber).not.toBeInTheDocument()
      })
    })
  })
})
