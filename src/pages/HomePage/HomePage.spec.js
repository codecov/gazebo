import { render, screen } from '@testing-library/react'
import HomePage from './HomePage'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('HomePage', () => {
  function setup() {
    render(<HomePage />)
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the children', () => {
      expect(screen.getByText(/SHOW ALL THE REPOS/)).toBeInTheDocument()
    })
  })
})
