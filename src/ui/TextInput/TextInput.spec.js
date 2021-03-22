import { render, screen } from '@testing-library/react'

import TextInput from './TextInput'

describe('TextInput', () => {
  function setup(props) {
    render(<TextInput {...props} />)
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

  describe('when rendered without label', () => {
    beforeEach(() => {
      setup({
        placeholder: 'search orgs',
      })
    })

    it('renders the textbox with the placeholder as the label', () => {
      screen.getByRole('textbox', {
        name: /search orgs/i,
      })
    })
  })
})
