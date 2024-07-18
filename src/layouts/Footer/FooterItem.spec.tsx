import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { FooterItem, FooterItemProps } from './FooterItem'

describe('FooterItem', () => {
  function setup(props: FooterItemProps) {
    render(
      <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
        <Route path="/:provider/:owner/:repo">
          <FooterItem {...props} />{' '}
        </Route>
      </MemoryRouter>
    )
  }

  describe('pass a "path" prop', () => {
    const text = 'Doggo 🐕'
    const to = { pageName: 'terms' }

    beforeEach(() => {
      setup({ text, to })
    })

    it('renders a link', () => {
      const layout = screen.getByText(text)
      expect(layout).toBeInTheDocument()
      const a = screen.getByRole('link')
      expect(a).toBeInTheDocument()
    })

    it('is the right color', () => {
      const layout = screen.getByText(text)
      expect(layout).toHaveClass('text-ds-gray-quinary')
    })
  })

  describe('only pass a "label" prop', () => {
    const text = 'Fear Noodle 🐍'

    beforeEach(() => {
      setup({ text })
    })

    it('does not render a link', () => {
      const layout = screen.getByText(text)
      expect(layout).toBeInTheDocument()
    })

    it('is the right color', () => {
      const layout = screen.getByText(text)
      expect(layout).toHaveClass('text-ds-gray-quinary')
    })
  })
})
