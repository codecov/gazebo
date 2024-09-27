import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ExampleBlurb from './ExampleBlurb'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/cool-repo/new']}>
    <Route path={['/:provider/:owner/:repo/new']}>{children}</Route>
  </MemoryRouter>
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
