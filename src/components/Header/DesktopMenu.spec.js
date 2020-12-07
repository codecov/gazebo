import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useNav } from 'services/header'

import DesktopMenu from './DesktopMenu'

jest.mock('services/header')

const mockNavContext = {
  main: [
    { label: 'Haunted Code', to: '/👻', iconName: 'ghost' },
    { label: 'Thriller Video', to: '/👻/👅/💃🏽', imageUrl: '💃🏽.jpeg' },
  ],
  user: [{ label: 'Chatty Ghosts', to: '/👻/👅', imageUrl: '🗣.png' }],
}

describe('DesktopMenu', () => {
  function setup() {
    render(
      <MemoryRouter>
        <DesktopMenu />
      </MemoryRouter>
    )
  }

  describe('renders from service data', () => {
    beforeEach(() => {
      useNav.mockReturnValue(mockNavContext)

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
