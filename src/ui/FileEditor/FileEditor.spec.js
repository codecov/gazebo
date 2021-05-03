import { render, screen } from '@testing-library/react'

import File from './FileEditor'

describe('File', () => {
  let wrapper

  function setup(props) {
    wrapper = render(<File {...props} />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        label: 'label',
      })
    })

    it('renders the textbox with the name of the label', () => {
      screen.getByRole('textbox', {
        name: /label/i,
      })
    })
  })
})
