import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { UserNavLink, MainNavLink } from './NavLink'

describe('UserNavLink', () => {
  function setup(props) {
    render(<UserNavLink {...props} />, { wrapper: MemoryRouter })
  }

  describe('passed to and label', () => {
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

  describe('passed to, label and iconName', () => {
    const label = 'Grump Factory 🐱'
    const to = '/sunny-spot'
    const iconName = 'search'

    beforeEach(() => {
      setup({ label, to, iconName })
    })

    it('renders a link', () => {
      const layout = screen.getByText(label)
      expect(layout).toBeInTheDocument()
      const a = screen.getByRole('link')
      expect(a).toBeInTheDocument()
    })

    it('renders a svg', () => {
      const svg = screen.getByTestId('nav-link-icon')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('passed to, label and imageUrl', () => {
    const label = 'Fear Noodle 🐍'
    const to = '/den'
    const imageUrl = 'https://sna.ke/boops.jpeg'

    beforeEach(() => {
      setup({ label, to, imageUrl })
    })

    it('renders a link', () => {
      const layout = screen.getByText(label)
      expect(layout).toBeInTheDocument()
      const a = screen.getByRole('link')
      expect(a).toBeInTheDocument()
    })

    it('renders a image', () => {
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
    })
  })
})

describe('MainNavLink', () => {
  function setup(props) {
    render(<MainNavLink {...props} />, { wrapper: MemoryRouter })
  }

  describe('passed to and label', () => {
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

  describe('passed to, label and imageUrl', () => {
    const label = 'Fear Noodle 🐍'
    const to = '/den'
    const imageUrl = 'https://sna.ke/boops.jpeg'

    beforeEach(() => {
      setup({ label, to, imageUrl })
    })

    it('renders a link', () => {
      const layout = screen.getByText(label)
      expect(layout).toBeInTheDocument()
      const a = screen.getByRole('link')
      expect(a).toBeInTheDocument()
    })

    it('renders a image', () => {
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
    })
  })
})
