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
      name: /JavaScript config.yml example/,
    })
    expect(docsLink).toBeInTheDocument()
    expect(docsLink).toHaveAttribute(
      'href',
      'https://github.com/codecov/example-javascript/blob/main/.circleci/config.yml'
    )
  })
  it('renders correct CLI link', async () => {
    render(<ExampleBlurb />, { wrapper })

    const docsLink = await screen.findByRole('link', {
      name: /the setup on CircleCI/,
    })
    expect(docsLink).toBeInTheDocument()
    expect(docsLink).toHaveAttribute(
      'href',
      'https://app.circleci.com/pipelines/github/codecov/example-javascript/148/workflows/180ae354-0d8c-4205-8815-f4c516a042a4/jobs/130/steps'
    )
  })
})
