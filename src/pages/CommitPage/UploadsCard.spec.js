import { render, screen } from 'custom-testing-library'
import UploadsCard from './UploadsCard'

describe('HomePage', () => {
  function setup() {
    render(<UploadsCard setShowYAMLModal={() => {}} />)
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
