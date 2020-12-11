import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useUser } from 'services/user'
import { useSubNav } from 'services/header'

import Dropdown from './Dropdown'

jest.mock('services/header')
jest.mock('services/user')

const mockSubMenu = [
  { label: 'Chatty Ghosts', href: '/👻/👅', imageUrl: '🗣.png' },
]
const mockUseUser = { username: 'Shaggy', avatarUrl: '🚶‍♂️.jpeg' }

describe('Dropdown', () => {
  function setup(currentUser) {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    )
  }

  describe('check rendered links', () => {
    beforeEach(() => {
      useSubNav.mockReturnValue(mockSubMenu)
      useUser.mockReturnValue({ data: mockUseUser })

      setup()
    })

    it('renders sub menu links', () => {
      mockSubMenu.forEach((link) => {
        const navLink = screen.getByText(link.label).closest('a')
        expect(navLink).toHaveAttribute('href', link.href)
      })
    })
  })

  describe('opens Dropdown', () => {
    beforeEach(() => {
      useSubNav.mockReturnValue(mockSubMenu)
      useUser.mockReturnValue({ data: mockUseUser })

      setup()
    })
    it('clicking on user opens the Dropdown', () => {
      const toggle = screen.getByRole('button')

      expect(screen.getByRole('menu')).toHaveClass('hidden')
      toggle.click()
      expect(screen.getByRole('menu')).not.toHaveClass('hidden')
    })
  })

  describe('when clicking on a link', () => {
    beforeEach(() => {
      useSubNav.mockReturnValue(mockSubMenu)
      useUser.mockReturnValue({ data: mockUseUser })

      setup()

      const toggle = screen.getByRole('button')
      toggle.click()

      screen.getByRole('link', { name: /Chatty Ghosts/ }).click()
    })

    it('closes the dropdown', () => {
      expect(screen.getByRole('menu')).toHaveClass('hidden')
    })
  })

  describe('when the user isnt authenticated', () => {
    beforeEach(() => {
      useSubNav.mockReturnValue(mockSubMenu)
      useUser.mockReturnValue({ data: null })

      setup()
    })

    it('doesnt render the menu', () => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('renders a login long', () => {
      expect(screen.getByRole('link', { name: /Log in/ })).toBeInTheDocument()
    })
  })
})
