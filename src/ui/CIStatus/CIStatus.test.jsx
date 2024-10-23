import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'
import ResizeObserver from 'resize-observer-polyfill'

import CIStatus from '.'

global.ResizeObserver = ResizeObserver

const wrapper = ({ children }) => (
  <MemoryRouter
    initialEntries={[
      '/gh/codecov/test-repo/commit/803897e6ceeb6828778070208c06c5a978a48a68',
    ]}
  >
    <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
  </MemoryRouter>
)

describe('CIStatus', () => {
  describe('when rendered', () => {
    it('shows ci passed', () => {
      render(<CIStatus ciPassed={true} />, { wrapper })

      const passed = screen.getByText(/Passed/)
      expect(passed).toBeInTheDocument()
    })

    it('shows ci failed', () => {
      render(<CIStatus ciPassed={false} />, { wrapper })

      const failed = screen.getByText(/Failed/)
      expect(failed).toBeInTheDocument()
    })

    it('shows no status if no status is given', () => {
      render(<CIStatus ciPassed={undefined} />, { wrapper })

      const noStatus = screen.getByText(/No Status/)
      expect(noStatus).toBeInTheDocument()
    })

    it('shows tooltip on hover', async () => {
      render(<CIStatus ciPassed={true} />, { wrapper })

      const tooltipTrigger = screen.getByTestId('ci-tooltip-trigger')
      await userEvent.hover(tooltipTrigger)

      const link = await screen.findAllByTestId('yml-require-ci-pass-link')
      expect(link).toHaveLength(2)
      expect(link[0]).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/codecovyml-reference#codecovrequire_ci_to_pass'
      )
    })

    it('does not show tooltip when not hovered', async () => {
      render(<CIStatus ciPassed={true} />, { wrapper })

      expect(
        screen.queryByTestId('yml-require-ci-pass-link')
      ).not.toBeInTheDocument()
    })
  })
})
