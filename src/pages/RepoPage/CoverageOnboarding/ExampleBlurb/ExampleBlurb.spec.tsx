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
  it('renders correct extension link', async () => {
    render(<ExampleBlurb />, { wrapper })

    const docsLink = await screen.findByRole('link', {
      name: /YAML validator/,
    })
    expect(docsLink).toBeInTheDocument()
    expect(docsLink).toHaveAttribute(
      'href',
      `https://marketplace.visualstudio.com/items?itemName=Codecov.codecov#:~:text=Codecov's%20official%20validator%20extension%20for,and%20configuration%20of%20new%20repositories.&text=Launch%20VS%20Code%20Quick%20Open,following%20command%2C%20and%20press%20enter.&text=Create%2C%20manage%2C%20and%20validate%20the,Code%20with%20our%20latest%20extension.`
    )
  })
})
