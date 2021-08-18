import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

import Header from './Header'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}))

describe('Header', () => {
  function setup({ provider }) {
    useLocation.mockReturnValue({ pathname: 'gh/codecov/test-repo/commit/123' })
    render(<Header provider={provider} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when provider is gh, bb or gl', () => {
    it('Ask for feedback banner is rendered', () => {
      setup({ provider: 'gh' })
      expect(
        screen.getByText(
          /Also, we would love to hear your feedback! Let us know what you think in/
        )
      ).toBeInTheDocument()
    })

    it('Anchors show based on provider', () => {
      setup({ provider: 'gh' })
      const issueLink = screen.getByRole('link', { name: /this issue/i })
      expect(issueLink).toBeInTheDocument()
      expect(issueLink.href).toBe(
        'https://github.com/codecov/Codecov-user-feedback/issues/1'
      )

      const previousUILink = screen.getByRole('link', {
        name: /switch back to the previous user interface/i,
      })
      expect(previousUILink).toBeInTheDocument()
      expect(previousUILink.href).toBe(
        'https://stage-web.codecov.devgh/codecov/test-repo/commit/123'
      )
    })
  })
})
