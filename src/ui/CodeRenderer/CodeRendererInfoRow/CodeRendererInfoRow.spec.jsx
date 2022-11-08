import { render, screen } from '@testing-library/react'

import CodeRendererInfoRow from './CodeRendererInfoRow'

//TODO: Almost there, missing the usenavlinks part
describe('CodeRendererInfoRow', () => {
  function setup(props, content) {
    render(<CodeRendererInfoRow {...props}>{content}</CodeRendererInfoRow>)
  }

  describe('when rendered with unexpected changes', () => {
    beforeEach(() => {
      setup({}, <span>This is some content</span>)
    })

    it('renders contents', () => {
      expect(screen.getByText(/This is some content/)).toBeInTheDocument()
    })
  })
})
