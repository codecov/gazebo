import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import TeamPlanFeedbackBanner from './TeamPlanFeedbackBanner'

const mockTeamTier = {
  owner: {
    plan: {
      tierName: TierNames.TEAM,
    },
  },
}

const mockProTier = {
  owner: {
    plan: {
      tierName: TierNames.PRO,
    },
  },
}

console.error = () => {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.resetAllMocks()
})

afterAll(() => {
  server.close()
})

const wrapper =
  (initialEntries = ''): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('TeamPlanFeedbackBanner', () => {
  function setup(isPro = false) {
    const user = userEvent.setup()
    const mockSetItem = vi.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = vi.spyOn(window.localStorage.__proto__, 'getItem')

    server.use(
      graphql.query('OwnerTier', (info) => {
        if (isPro) {
          return HttpResponse.json({ data: mockProTier })
        }
        return HttpResponse.json({ data: mockTeamTier })
      })
    )

    return {
      user,
      mockSetItem,
      mockGetItem,
    }
  }

  describe('rendering banner', () => {
    it('renders left side text', async () => {
      setup()
      render(<TeamPlanFeedbackBanner />, { wrapper: wrapper('/gh/codecov') })

      const leftText = await screen.findByText(/about Codecov in this/)
      expect(leftText).toBeInTheDocument()
    })

    it('renders the link to the survey', async () => {
      setup()
      render(<TeamPlanFeedbackBanner />, { wrapper: wrapper('/gh/codecov') })

      const link = await screen.findByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://docs.google.com/forms/d/e/1FAIpQLSeoMHPyECewV7X3UaT-uUxZCmYy1T6hEX_aecCD2ppPHGSvUw/viewform'
      )
    })
  })

  describe('user dismisses banner', () => {
    it('calls local storage', async () => {
      const { user, mockGetItem, mockSetItem } = setup()
      render(<TeamPlanFeedbackBanner />, { wrapper: wrapper('/gh/codecov') })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = await screen.findByText(/Dismiss/)
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() =>
        expect(mockSetItem).toHaveBeenCalledWith(
          'dismissed-top-banners',
          JSON.stringify({ 'team-feedback-banner': 'true' })
        )
      )
    })

    it('hides the banner', async () => {
      const { user, mockGetItem } = setup()
      const { container } = render(<TeamPlanFeedbackBanner />, {
        wrapper: wrapper('/gh/codecov'),
      })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = await screen.findByText(/Dismiss/)
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('user is not on team plan', () => {
    it('does not render banner', async () => {
      setup(true)
      const { container } = render(<TeamPlanFeedbackBanner />, {
        wrapper: wrapper('/gh/codecov'),
      })
      expect(container).toBeEmptyDOMElement()
    })
  })
})
