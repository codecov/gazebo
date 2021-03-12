import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useMainNav } from 'services/header'

import DesktopMenu from './DesktopMenu'

jest.mock('layouts/Header/ServerStatus.js', () => () => 'ServerStatus')
jest.mock('services/header')
jest.mock('./Dropdown', () => () => 'Dropdown')

const mockMainNav = [
  { label: 'Haunted Code', to: '/👻', iconName: 'ghost' },
  { label: 'Thriller Video', to: '/👻/👅/💃🏽', imageUrl: '💃🏽.jpeg' },
]

describe('DesktopMenu', () => {
  function setup() {
    render(<DesktopMenu />, { wrapper: MemoryRouter })
  }

  describe('renders from service data', () => {
    beforeEach(() => {
      useMainNav.mockReturnValue(mockMainNav)

      setup()
    })

    it('renders main nav links', () => {
      mockMainNav.forEach((link) => {
        const navLink = screen.getByText(link.label).closest('a')
        expect(navLink).toHaveAttribute('href', link.to)
      })
    })
  })
})
