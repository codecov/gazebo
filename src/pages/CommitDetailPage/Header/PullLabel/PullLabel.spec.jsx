import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import PullLabel from './PullLabel'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo/commit/id-1']}>
    <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
  </MemoryRouter>
)

const mockValidProps = {
  pullId: 123,
  provider: 'gh',
  providerPullUrl: 'https://github.com/codecov/test-repo/pull/123',
}

const mockInvalidProps = {
  pullId: null,
  provider: null,
  providerPullUrl: null,
}

describe('PullLabel', () => {
  describe('when rendered with a pull id, provider and provider pull url', () => {
    it('renders pull id', async () => {
      render(<PullLabel {...mockValidProps} />, { wrapper })

      const pullIdLink = await screen.findByRole('link', { name: /#123/ })
      expect(pullIdLink).toBeInTheDocument()
      expect(pullIdLink).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/pull/123'
      )
    })

    it('renders provider pull url', async () => {
      render(<PullLabel {...mockValidProps} />, { wrapper })

      const pullUrlLink = await screen.findByRole('link', { name: /Github/ })
      expect(pullUrlLink).toBeInTheDocument()
      expect(pullUrlLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/test-repo/pull/123'
      )
    })
  })

  describe('when rendered with no pullid, provider or provider pull url', () => {
    it('does not render label', () => {
      render(<PullLabel {...mockInvalidProps} />, { wrapper })

      const message = screen.queryByText(/#123/)
      expect(message).not.toBeInTheDocument()
    })
  })
})
