import { render, screen } from '@testing-library/react'

import TextInput from './TextInput'

describe('TextInput', () => {
  function setup() {
    render(
      <>
        <label htmlFor="text-input">label</label>
        <TextInput id="text-input" />
      </>
    )
  }

  describe('when renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the textbox with the name of the label', () => {
      screen.getByRole('textbox', {
        name: /label/i,
      })
    })
  })
})
