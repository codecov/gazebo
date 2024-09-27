import { render, screen } from 'custom-testing-library'

import Progress from './Progress'

describe('Progress', () => {
  describe('display default', () => {
    it('renders bar', () => {
      render(
        <Progress amount={80} label={false} variant="default" color="default" />
      )

      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toBeInTheDocument()
    })

    it('renders the expected color', () => {
      render(
        <Progress amount={80} label={false} variant="default" color="default" />
      )

      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toHaveClass('h-full bg-ds-primary-green')
    })
  })

  describe('display label', () => {
    it('renders bar', () => {
      render(
        <Progress amount={80} label={true} variant="default" color="default" />
      )

      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toBeInTheDocument()

      const label = screen.getByText(/80/)
      expect(label).toBeInTheDocument()
    })
  })

  describe('using the neutral color', () => {
    it('renders bar', () => {
      render(
        <Progress amount={80} label={false} variant="default" color="neutral" />
      )

      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toBeInTheDocument()

      const label = screen.queryByText(/80/)
      expect(label).not.toBeInTheDocument()
    })

    it('renders the expected color', () => {
      render(
        <Progress amount={80} label={false} variant="default" color="neutral" />
      )

      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toHaveClass('h-full bg-ds-gray-senary')
    })
  })

  describe('using the danger color', () => {
    it('renders bar', () => {
      render(
        <Progress amount={250} label={false} variant="default" color="danger" />
      )

      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toBeInTheDocument()

      const label = screen.queryByText(/80/)
      expect(label).not.toBeInTheDocument()
    })

    it('renders the expected color', () => {
      render(
        <Progress amount={250} label={false} variant="default" color="danger" />
      )

      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toHaveClass('h-full bg-ds-primary-red')
    })
  })

  describe('using the warning color', () => {
    it('renders bar', () => {
      render(
        <Progress
          amount={250}
          label={false}
          variant="default"
          color="warning"
        />
      )

      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toBeInTheDocument()

      const label = screen.queryByText(/80/)
      expect(label).not.toBeInTheDocument()
    })

    it('renders the expected color', () => {
      render(
        <Progress
          amount={250}
          label={false}
          variant="default"
          color="warning"
        />
      )

      const bar = screen.getByTestId('org-progress-bar')
      expect(bar).toHaveClass('h-full bg-ds-primary-yellow')
    })
  })
})
