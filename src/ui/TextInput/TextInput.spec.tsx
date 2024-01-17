import { render, screen } from '@testing-library/react'

import { OutlineIconCollection } from 'ui/Icon/Icon'

import TextInput from './TextInput'

interface TextInputSetupArgs {
  label?: string
  icon?: keyof OutlineIconCollection
  placeholder?: string
}

describe('TextInput', () => {
  function setup(props: TextInputSetupArgs) {
    render(<TextInput {...props} />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        label: 'label',
      })
    })

    it('renders the textbox with the name of the label', () => {
      expect(
        screen.getByRole('textbox', { name: /label/i })
      ).toBeInTheDocument()
    })
  })

  describe('when rendered without label', () => {
    beforeEach(() => {
      setup({
        placeholder: 'search orgs',
      })
    })

    it('renders the textbox with the placeholder as the label', () => {
      expect(
        screen.getByRole('textbox', { name: /search orgs/i })
      ).toBeInTheDocument()
    })
  })

  describe('when rendered with icon', () => {
    beforeEach(() => {
      setup({
        icon: 'search',
      })
    })

    it('renders an icon', () => {
      const icon = screen.getByText(/search.svg/)
      expect(icon).toBeInTheDocument()
    })
  })
})
