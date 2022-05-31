import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { CODE_RENDERER_INFO } from 'shared/utils/fileviewer'

import CodeRendererInfoRow from './CodeRendererInfoRow'

//TODO: Almost there, missing the usenavlinks part
describe('CodeRendererInfoRow', () => {
  function setup(props) {
    render(
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">
          <CodeRendererInfoRow {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with unexpected changes', () => {
    beforeEach(() => {
      setup({ type: CODE_RENDERER_INFO.UNEXPECTED_CHANGES, patch: '-1,10' })
    })

    it('renders message relevant to unexpected info', () => {
      expect(screen.getByText(/-1,10/)).toBeInTheDocument()
      expect(screen.getByText(/indirect coverage change/)).toBeInTheDocument()
      const link = screen.getByRole('link', {
        name: /learn more/i,
      })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/unexpected-coverage-changes'
      )
    })
  })
  describe('when rendered with empty status', () => {
    beforeEach(() => {
      setup({ type: CODE_RENDERER_INFO.EMPTY, patch: '-1,10' })
    })

    it('renders message relevant to no status', () => {
      expect(screen.getByText(/-1,10/)).toBeInTheDocument()
    })
  })
})
