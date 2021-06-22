import { render, screen } from '@testing-library/react'

import TextInput from './TextInput'

describe('TextInput', () => {
  function setup(props) {
    render(
      <>
        <label htmlFor="text-input">label</label>
        <TextInput id="text-input" {...props} />
      </>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the textbox with the name of the label', () => {
      screen.getByRole('textbox', {
        name: /label/i,
      })
    })
  })

  describe('renders embbeded content', () => {
    beforeEach(() => {
      setup({ embedded: () => 'hello' })
    })

    it('renders the textbox with the name of the label', () => {
      screen.getByRole('textbox', {
        name: /label/i,
      })
    })
    it('renders embedded content', () => {
      expect(screen.getByText(/hello/)).toBeInTheDocument()
    })
  })
})
