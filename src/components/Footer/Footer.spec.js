import { render, screen } from '@testing-library/react'

import { FooterItem } from './Footer'

describe('FooterItem', () => {
  function setup(props) {
    render(<FooterItem {...props} />)
  }

  describe('pass a "to" prop', () => {
    const label = 'Doggo 🐕'
    const to = '/outside'

    beforeEach(() => {
      setup({ label, to })
    })

    it('renders a link', () => {
      const layout = screen.getByText(label)
      expect(layout).toBeInTheDocument()
      const a = screen.getByRole('link')
      expect(a).toBeInTheDocument()
    })
  })

  describe('only pass a "lable" prop', () => {
    const label = 'Fear Noodle 🐍'

    beforeEach(() => {
      setup({ label })
    })

    it('does not render a link', () => {
      const layout = screen.getByText(label)
      expect(layout).toBeInTheDocument()
    })
  })
})

// There's no logic or props in <Footer /> so no test (for now)
