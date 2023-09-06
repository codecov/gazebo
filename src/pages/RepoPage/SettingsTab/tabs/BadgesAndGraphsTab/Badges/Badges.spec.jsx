import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Badges from './Badges'

jest.mock('config')

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings/badge']}>
    <Route path="/:provider/:owner/:repo/settings/badge">{children}</Route>
  </MemoryRouter>
)

describe('Badges', () => {
  describe('renders', () => {
    it('renders title', () => {
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const title = screen.getByText(/Codecov badge/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const p = screen.getByText(
        /A live icon that you can embed in code, such as in a README.md, to provide quick insight into your project's code coverage percentage./
      )
      expect(p).toBeInTheDocument()
    })

    it('renders with expected base url', () => {
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })
      config.BASE_URL = 'https://stage-codecov.io'

      const baseUrl = screen.getByText(
        '[![codecov](https://stage-web.codecov.dev/gh/codecov/codecov-client/graph/badge.svg?token=WIO9JXFGE)](https://stage-web.codecov.dev/gh/codecov/codecov-client)'
      )
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders tokens', () => {
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      expect(screen.getByText('Markdown')).toBeInTheDocument()
      expect(screen.getByText('HTML')).toBeInTheDocument()
      expect(screen.getByText('RST')).toBeInTheDocument()
    })
  })
})
