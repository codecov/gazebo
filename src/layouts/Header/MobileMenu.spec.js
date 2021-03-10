import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useUser } from 'services/user'
import { useMainNav, useSubNav } from 'services/header'

import MobileMenu from './MobileMenu'

jest.mock('layouts/Header/ServerStatus.js', () => () => 'ServerStatus')
jest.mock('services/header')
jest.mock('services/user')

const mockMain = [
  { label: 'Haunted Code', to: '/👻', iconName: 'ghost' },
  { label: 'Thriller Video', to: '/👻/👅/💃🏽', imageUrl: '💃🏽.jpeg' },
]

const mockSubMenu = [
  { label: 'Chatty Ghosts', to: '/👻/👅', imageUrl: '🗣.png' },
]

const mockUseUser = { data: { username: 'Shaggy', avatarUrl: '🚶‍♂️.jpeg' } }

describe('MobileMenu', () => {
  function setup() {
    render(<MobileMenu />, { wrapper: MemoryRouter })
  }

  describe('logged in', () => {
    beforeEach(() => {
      useMainNav.mockReturnValue(mockMain)
      useSubNav.mockReturnValue(mockSubMenu)
      useUser.mockReturnValue(mockUseUser)

      setup()
    })

    it('renders sub menu nav links', () => {
      mockSubMenu.forEach((link) => {
        const navLink = screen.getByText(link.label).closest('a')
        expect(navLink).toHaveAttribute('href', link.to)
      })
    })

    it('renders main nav links', () => {
      mockMain.forEach((link) => {
        const navLink = screen.getByText(link.label).closest('a')
        expect(navLink).toHaveAttribute('href', link.href)
      })
    })
  })

  describe('logged out', () => {
    beforeEach(() => {
      useMainNav.mockReturnValue(mockMain)
      useUser.mockReturnValue({ data: undefined }) // Not authenticated

      setup()
    })

    it('renders main nav links', () => {
      mockMain.forEach((link) => {
        const navLink = screen.getByText(link.label).closest('a')
        expect(navLink).toHaveAttribute('href', link.href)
      })
    })

    it('renders a sign in button', () => {
      const signin = screen.getByRole('link', {
        name: /signIn.svg Log in/,
      })
      expect(signin).toBeInTheDocument()
    })
  })
})
