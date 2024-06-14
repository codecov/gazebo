import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import ExampleBlurb from './ExampleBlurb'

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

describe('ExampleBlurb', () => {
  it('renders correct example repo link', async () => {
    render(<ExampleBlurb />, { wrapper })

    const docsLink = await screen.findByRole('link', {
      name: /repo here/,
    })
    expect(docsLink).toBeInTheDocument()
    expect(docsLink).toHaveAttribute(
      'href',
      'https://github.com/codecov/example-python/blob/main/.github/workflows/ci.yml'
    )
  })
  it('renders correct CLI link', async () => {
    render(<ExampleBlurb />, { wrapper })

    const docsLink = await screen.findByRole('link', {
      name: /our CLI/,
    })
    expect(docsLink).toBeInTheDocument()
    expect(docsLink).toHaveAttribute(
      'href',
      'https://github.com/codecov/codecov-action'
    )
  })
})
