import { render, screen } from 'custom-testing-library'

import Banner from './Banner'

describe('Banner', () => {
  function setup(variant, content) {
    render(
      <Banner heading={'Default banner'} variant={variant}>
        {content}
      </Banner>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup('default', <span>This is some content</span>)
    })

    it('renders contents', () => {
      expect(screen.getByText(/This is some content/)).toBeInTheDocument()
    })
  })
})
