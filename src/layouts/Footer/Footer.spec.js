import { render, screen } from '@testing-library/react'

import { FooterItem } from './FooterItem'

describe('FooterItem', () => {
  function setup(props) {
    render(<FooterItem {...props} />)
  }

  describe('pass a "path" prop', () => {
    const text = 'Doggo 🐕'
    const path = () => '/outside'

    beforeEach(() => {
      setup({ text, path })
    })

    it('renders a link', () => {
      const layout = screen.getByText(text)
      expect(layout).toBeInTheDocument()
      const a = screen.getByRole('link')
      expect(a).toBeInTheDocument()
    })
  })

  describe('only pass a "lable" prop', () => {
    const text = 'Fear Noodle 🐍'

    beforeEach(() => {
      setup({ text })
    })

    it('does not render a link', () => {
      const layout = screen.getByText(text)
      expect(layout).toBeInTheDocument()
    })
  })
})
