import { render, screen } from 'custom-testing-library'
import Progress from './Progress'

describe('Progress', () => {
  let props

  function setup(over = {}) {
    props = {
      ...over,
    }
    render(<Progress {...props} />)
  }

  describe('display default', () => {
    beforeEach(() => {
      setup({
        amount: 80,
      })
    })

    it('renders bar', () => {
      expect(screen.getByTestId('org-progress-bar')).toBeInTheDocument()
    })
  })

  describe('display label', () => {
    beforeEach(() => {
      setup({
        amount: 80,
        label: true,
      })
    })

    it('renders bar', () => {
      expect(screen.getByTestId('org-progress-bar')).toBeInTheDocument()
      expect(screen.getByText(/80/)).toBeInTheDocument()
    })
  })
})
