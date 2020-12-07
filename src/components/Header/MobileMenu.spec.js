import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useUser } from 'services/user'
import { useNav } from 'services/header'

import MobileMenu from './MobileMenu'

jest.mock('services/header')
jest.mock('services/user')

const mockNavContext = {
  main: [
    { label: 'Haunted Code', to: '/👻', iconName: 'ghost' },
    { label: 'Thriller Video', to: '/👻/👅/💃🏽', imageUrl: '💃🏽.jpeg' },
  ],
  user: [{ label: 'Chatty Ghosts', to: '/👻/👅', imageUrl: '🗣.png' }],
}
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
      useNav.mockReturnValue(mockNavContext)
      useUser.mockReturnValue(mockUseUser)

      setup()
    })

    it('renders user nav links', () => {
      mockNavContext.user.forEach((link) => {
        const navLink = screen.getByText(link.label).closest('a')
        expect(navLink).toHaveAttribute('href', link.to)
      })
    })

    it('renders main nav links', () => {
      mockNavContext.main.forEach((link) => {
        const navLink = screen.getByText(link.label).closest('a')
        expect(navLink).toHaveAttribute('href', link.to)
      })
    })
  })
})
