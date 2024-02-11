import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ErrorBanner from './ErrorBanner'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo/bundles']}>
    <Route path="/:provider/:owner/:repo/bundles">{children}</Route>
  </MemoryRouter>
)

describe('ErrorBanner', () => {
  describe('when errorType is MissingHeadReport', () => {
    it('should render the Missing Head Report error', () => {
      render(<ErrorBanner errorType="MissingHeadReport" />, { wrapper })

      const header = screen.getByText('Missing Head Report')
      expect(header).toBeInTheDocument()

      const message = screen.getByText(
        'Unable to compare commits because the head of the pull request did not upload a bundle stats file.'
      )
      expect(message).toBeInTheDocument()
    })
  })

  describe('when errorType is not known', () => {
    it('should render the Unknown Error', () => {
      render(<ErrorBanner />, { wrapper })

      const header = screen.getByText('Unknown Error')
      expect(header).toBeInTheDocument()

      const message = screen.getByText(
        'An unknown error occurred while trying to load the bundle analysis reports.'
      )
      expect(message).toBeInTheDocument()
    })
  })
})
