import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useUser } from 'services/user'
import { useMainNav, useSubNav } from 'services/header'

import MobileMenu from './MobileMenu'

jest.mock('services/header')
jest.mock('services/user')

const mockMain = [
  [
    { label: 'Haunted Code', to: '/👻', iconName: 'ghost' },
    { label: 'Thriller Video', to: '/👻/👅/💃🏽', imageUrl: '💃🏽.jpeg' },
  ],
]
const mockSubMenu = [
  [{ label: 'Chatty Ghosts', to: '/👻/👅', imageUrl: '🗣.png' }],
]

const mockUseUser = [{ username: 'Shaggy', avatarUrl: '🚶‍♂️.jpeg' }]

describe('MobileMenu', () => {
  function setup() {
    render(
      <MemoryRouter>
        <MobileMenu />
      </MemoryRouter>
    )
  }

  describe('renders from service data', () => {
    beforeEach(() => {
      useMainNav.mockReturnValue(mockMain)
      useSubNav.mockReturnValue(mockSubMenu)
      useUser.mockReturnValue(mockUseUser)

      setup()
    })

    it('renders sub menu nav links', () => {
      mockSubMenu[0].forEach((link) => {
        const navLink = screen.getByText(link.label).closest('a')
        expect(navLink).toHaveAttribute('href', link.to)
      })
    })

    it('renders main nav links', () => {
      mockMain[0].forEach((link) => {
        const navLink = screen.getByText(link.label).closest('a')
        expect(navLink).toHaveAttribute('href', link.to)
      })
    })
  })
})
