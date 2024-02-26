import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import IntroBlurb from './IntroBlurb'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/new']}>
      <Route path={['/:provider/:owner/:repo/new']}>
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('IntroBlurb', () => {
  describe('prologue', () => {
    it('renders quick start box', async () => {
      render(<IntroBlurb />, { wrapper })

      const docsLink = await screen.findByRole('link', {
        name: /Read our documentation/,
      })
      expect(docsLink).toBeInTheDocument()
      expect(docsLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/quick-start'
      )
    })
  })
})
