import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { http, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import UserCount from './UserCount'

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/gh/codecov/upgrade']}>
      <Route path="/plan/:provider/:owner/upgrade">
        <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

type SetupArgs = {
  activatedUserCount?: number
  activatedStudentCount?: number
  inactiveUserCount?: number
}

describe('UserCount', () => {
  function setup(
    {
      activatedUserCount = undefined,
      activatedStudentCount = undefined,
      inactiveUserCount = undefined,
    }: SetupArgs = {
      activatedUserCount: undefined,
      activatedStudentCount: undefined,
      inactiveUserCount: undefined,
    }
  ) {
    server.use(
      http.get('/internal/gh/codecov/account-details', (info) => {
        return HttpResponse.json({
          activatedUserCount,
          activatedStudentCount,
          inactiveUserCount,
        })
      })
    )
  }

  describe('when rendered', () => {
    it('does not render user count when activatedUserCount is not defined', async () => {
      setup({ activatedUserCount: undefined })
      render(<UserCount />, { wrapper })

      await waitForElementToBeRemoved(screen.queryByText('Loading...'))

      const message = screen.queryByText(/Your organization has/)
      expect(message).not.toBeInTheDocument()
    })

    it('does not render user count when inactiveUserCount is not defined', async () => {
      setup({ inactiveUserCount: undefined })
      render(<UserCount />, { wrapper })

      await waitForElementToBeRemoved(screen.queryByText('Loading...'))

      const message = screen.queryByText(/Your organization has/)
      expect(message).not.toBeInTheDocument()
    })

    it('renders user information when there is activated and inactive users', async () => {
      setup({ activatedUserCount: 15, inactiveUserCount: 5 })
      render(<UserCount />, {
        wrapper,
      })

      const message = await screen.findByText(
        /Your organization has 20 members./
      )
      expect(message).toBeInTheDocument()
    })

    it('does not render student information when activatedStudentCount is not defined', () => {
      setup({
        activatedUserCount: 15,
        inactiveUserCount: 5,
        activatedStudentCount: undefined,
      })
      render(<UserCount />, {
        wrapper,
      })

      const studentText = screen.queryByText(/student/i)
      expect(studentText).not.toBeInTheDocument()
    })

    it('renders singular student text when there is 1 activatedStudentCount', async () => {
      setup({
        activatedUserCount: 15,
        inactiveUserCount: 5,
        activatedStudentCount: 1,
      })
      render(<UserCount />, {
        wrapper,
      })

      const message = await screen.findByText(/1 active student/i)
      expect(message).toBeInTheDocument()
    })

    describe('when there is more than one activatedStudentCount', () => {
      it('renders plural students text', async () => {
        setup({
          activatedUserCount: 15,
          inactiveUserCount: 5,
          activatedStudentCount: 2,
        })
        render(<UserCount />, {
          wrapper,
        })

        const message = await screen.findByText(/2 active students/i)
        expect(message).toBeInTheDocument()
      })
    })
  })
})
