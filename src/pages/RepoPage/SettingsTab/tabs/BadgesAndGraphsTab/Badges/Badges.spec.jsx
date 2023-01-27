import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Badges from './Badges'

jest.mock('config')

const queryClient = new QueryClient()

describe('Badges', () => {
  function setup() {
    render(
      <MemoryRouter
        initialEntries={['/gh/codecov/codecov-client/settings/badge']}
      >
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/settings/badge">
            <Badges graphToken="WIO9JXFGE" defaultBranch="master" />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )

    config.BASE_URL = 'https://stage-codecov.io'
  }

  describe('renders Badges componenet', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', () => {
      const title = screen.getByText(/Codecov badge/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      const p = screen.getByText(
        /A live icon that you can embed in code, such as in a README.md, to provide quick insight into your project's code coverage percentage./
      )
      expect(p).toBeInTheDocument()
    })

    it('renders with expected base url', () => {
      const baseUrl = screen.getByText(
        '[![codecov](https://stage-codecov.io/gh/codecov/codecov-client/branch/master/graph/badge.svg?token=WIO9JXFGE)](https://stage-codecov.io/gh/codecov/codecov-client)'
      )
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders tokens', () => {
      expect(screen.getByText('Markdown')).toBeInTheDocument()
      expect(screen.getByText('HTML')).toBeInTheDocument()
      expect(screen.getByText('RST')).toBeInTheDocument()
    })
  })
})
