import { render, screen } from '@testing-library/react'

import { CODE_RENDERER_INFO } from 'shared/utils/fileviewer'

import CodeRendererInfoRow from './CodeRendererInfoRow'

//TODO: Almost there, missing the usenavlinks part
xdescribe('CodeRendererInfoRow', () => {
  function setup(props) {
    render(<CodeRendererInfoRow {...props} />)
  }

  describe('when rendered with unexpected changes', () => {
    beforeEach(() => {
      setup({ type: CODE_RENDERER_INFO.UNEXPECTED_CHANGES })
    })

    it('renders message relevant to unexpected info', () => {
      expect(screen.getByText(/indirect coverage change/)).toBeInTheDocument()
      //TODO: Missing to check if the anchor leads to the static page
    })
  })
})
