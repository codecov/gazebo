import { render, screen } from 'custom-testing-library'

import Banner from './Banner'

describe('Banner', () => {
  function setup(props, content) {
    render(<Banner {...props}>{content}</Banner>)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({ variant: 'default' }, <span>This is some content</span>)
    })

    it('renders contents', () => {
      expect(screen.getByText(/This is some content/)).toBeInTheDocument()
    })
  })
})
