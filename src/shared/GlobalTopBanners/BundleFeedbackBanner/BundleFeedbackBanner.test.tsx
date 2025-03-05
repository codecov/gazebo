import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import BundleFeedbackBanner from './BundleFeedbackBanner'

const mockOverview = (bundleAnalysisEnabled = true) => ({
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled,
      languages: ['typescript'],
      testAnalyticsEnabled: true,
    },
  },
})

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
        <Route path="/:provider/:owner/:repo">{children}</Route>
        <Route path="*">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('BundleFeedbackBanner', () => {
  function setup(bundleAnalysisEnabled = true) {
    const user = userEvent.setup()
    const mockSetItem = vi.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = vi.spyOn(window.localStorage.__proto__, 'getItem')

    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: mockOverview(bundleAnalysisEnabled) })
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
      render(<BundleFeedbackBanner />, {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const leftText = await screen.findByText(/Looks like your org tried/)
      expect(leftText).toBeInTheDocument()
    })

    it('renders bundle tab link', async () => {
      setup()
      render(<BundleFeedbackBanner />, {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const link = await screen.findByRole('link', { name: 'bundle analysis' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/gh/codecov/cool-repo/bundles')
    })

    it('renders the link to the survey', async () => {
      setup()
      render(<BundleFeedbackBanner />, {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const link = await screen.findByRole('link', { name: '1 minute survey.' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://forms.gle/8fzZrwWEaBRz4ufD9'
      )
    })
  })

  describe('user dismisses banner', () => {
    it('calls local storage', async () => {
      const { user, mockGetItem, mockSetItem } = setup()
      render(<BundleFeedbackBanner />, {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = await screen.findByText(/Dismiss/)
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() =>
        expect(mockSetItem).toHaveBeenCalledWith(
          'dismissed-top-banners',
          JSON.stringify({ 'bundle-feedback-banner': 'true' })
        )
      )
    })

    it('hides the banner', async () => {
      const { user, mockGetItem } = setup()
      const { container } = render(<BundleFeedbackBanner />, {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = await screen.findByText(/Dismiss/)
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('user is not on the repo page', () => {
    it('does not render banner', async () => {
      setup()
      const { container } = render(<BundleFeedbackBanner />, {
        wrapper: wrapper('/gh/codecov'),
      })
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('user does not have BA enabled', () => {
    it('does not render banner', async () => {
      setup(false)
      const { container } = render(<BundleFeedbackBanner />, {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })
      expect(container).toBeEmptyDOMElement()
    })
  })
})
