import { render, screen } from '@testing-library/react'
import UploadsCard from './UploadsCard'

describe('HomePage', () => {
  function setup() {
    render(<UploadsCard />)
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the title', () => {
      expect(screen.getByText(/Uploads/)).toBeInTheDocument()
    })
  })
})
