import { render, screen } from '@testing-library/react'

import Toggle from './Toggle'

describe('Toggle', () => {
  const requiredProps = {
    label: '🐕',
  }
  function setup(props) {
    render(<Toggle {...requiredProps} {...props} />)
  }

  describe('Toggle is active', () => {
    beforeEach(() => {
      setup({ value: true })
    })

    it('renders the blue', () => {
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-blue-400')
    })

    it('Slides circle to the right', () => {
      const button = screen.getByTestId('switch')
      expect(button).toHaveClass('translate-x-5')
    })
  })

  describe('Toggle is not active', () => {
    beforeEach(() => {
      setup({ value: false })
    })

    it('renders the blue', () => {
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-200')
    })

    it('Slides circle to the right', () => {
      const button = screen.getByTestId('switch')
      expect(button).toHaveClass('translate-x-0')
    })
  })

  describe('Default Label', () => {
    beforeEach(() => {
      setup({ value: false })
    })

    it('is screen reader only', () => {
      const label = screen.getByText(/🐕/)
      expect(label).toHaveClass('sr-only')
    })
  })

  describe('Shown Label', () => {
    beforeEach(() => {
      setup({ value: false, showLabel: true })
    })

    it('is screen reader only', () => {
      const label = screen.getByText(/🐕/)
      expect(label).not.toHaveClass('sr-only')
      expect(label).toHaveClass('cursor-pointer')
    })
  })

  describe('Shown Label with custom styling', () => {
    beforeEach(() => {
      setup({ value: false, labelClass: 'some-class', showLabel: true })
    })

    it('is screen reader only', () => {
      const label = screen.getByText(/🐕/)
      expect(label).toHaveClass('some-class')
      expect(label).toHaveClass('cursor-pointer')
    })
  })
})
