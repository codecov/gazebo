import { render, screen } from '@testing-library/react'

import CodeRendererInfoRow from './CodeRendererInfoRow'

//TODO: Almost there, missing the useNavLinks part
describe('CodeRendererInfoRow', () => {
  describe('when rendered with unexpected changes', () => {
    it('renders contents', () => {
      render(
        <CodeRendererInfoRow>
          {' '}
          <span>This is some content</span>
        </CodeRendererInfoRow>
      )

      expect(screen.getByText(/This is some content/)).toBeInTheDocument()
    })
  })
})
