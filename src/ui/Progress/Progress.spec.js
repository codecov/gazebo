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

    it('renders the expected color', () => {
      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toHaveClass('bg-ds-primary-green')
    })
  })

  describe('display label', () => {
    beforeEach(() => {
      setup({
        amount: 80,
        label: true,
        variant: 'default',
      })
    })

    it('renders bar', () => {
      expect(screen.getByTestId('org-progress-bar')).toBeInTheDocument()
      expect(screen.getByText(/80/)).toBeInTheDocument()
    })
  })

  describe('using the progressNeutral variant', () => {
    beforeEach(() => {
      setup({
        amount: 80,
        label: false,
        variant: 'progressNeutral',
      })
    })

    it('renders bar', () => {
      expect(screen.getByTestId('org-progress-bar')).toBeInTheDocument()
      expect(screen.queryByText(/80/)).not.toBeInTheDocument()
    })

    it('renders the expected color', () => {
      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toHaveClass('bg-ds-gray-senary')
    })
  })

  describe('using the progressDanger variant', () => {
    beforeEach(() => {
      setup({
        amount: 250,
        label: false,
        variant: 'progressDanger',
      })
    })

    it('renders bar', () => {
      expect(screen.getByTestId('org-progress-bar')).toBeInTheDocument()
      expect(screen.queryByText(/80/)).not.toBeInTheDocument()
    })

    it('renders the expected color', () => {
      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toHaveClass('bg-ds-primary-red')
    })
  })
})
