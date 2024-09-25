import { render, screen } from '@testing-library/react'

import TextInput from './TextInput'

describe('TextInput', () => {
  describe('when rendered', () => {
    it('renders the textbox with the name of the label', () => {
      render(<TextInput label="label" />)

      const textbox = screen.getByRole('textbox', { name: /label/i })
      expect(textbox).toBeInTheDocument()
    })
  })

  describe('when rendered without label', () => {
    it('renders the textbox with the placeholder as the label', () => {
      render(<TextInput placeholder="search orgs" />)

      const textbox = screen.getByRole('textbox', { name: /search orgs/i })
      expect(textbox).toBeInTheDocument()
    })
  })

  describe('when rendered with icon', () => {
    it('renders an icon', () => {
      render(<TextInput icon="search" />)

      const icon = screen.getByTestId('search')
      expect(icon).toBeInTheDocument()
    })
  })
})
