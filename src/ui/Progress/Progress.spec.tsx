import { render, screen } from 'custom-testing-library'

import Progress, { progressColors, progressVariants } from './Progress'

describe('Progress', () => {
  function setup({
    amount,
    label = false,
    variant = 'default',
    color = 'default',
  }: {
    amount: number
    label?: boolean
    variant?: keyof typeof progressVariants
    color?: keyof typeof progressColors
  }) {
    render(
      <Progress amount={amount} label={label} variant={variant} color={color} />
    )
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
      expect(bar).toHaveClass('h-full bg-ds-primary-green')
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

  describe('using the neutral color', () => {
    beforeEach(() => {
      setup({
        amount: 80,
        label: false,
        color: 'neutral',
      })
    })

    it('renders bar', () => {
      expect(screen.getByTestId('org-progress-bar')).toBeInTheDocument()
      expect(screen.queryByText(/80/)).not.toBeInTheDocument()
    })

    it('renders the expected color', () => {
      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toHaveClass('h-full bg-ds-gray-senary')
    })
  })

  describe('using the danger color', () => {
    beforeEach(() => {
      setup({
        amount: 250,
        label: false,
        color: 'danger',
      })
    })

    it('renders bar', () => {
      expect(screen.getByTestId('org-progress-bar')).toBeInTheDocument()
      expect(screen.queryByText(/80/)).not.toBeInTheDocument()
    })

    it('renders the expected color', () => {
      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toHaveClass('h-full bg-ds-primary-red')
    })
  })

  describe('using the warning color', () => {
    beforeEach(() => {
      setup({
        amount: 250,
        label: false,
        color: 'warning',
      })
    })

    it('renders bar', () => {
      expect(screen.getByTestId('org-progress-bar')).toBeInTheDocument()
      expect(screen.queryByText(/80/)).not.toBeInTheDocument()
    })

    it('renders the expected color', () => {
      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toHaveClass('h-full bg-ds-primary-yellow')
    })
  })
})
