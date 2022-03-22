import { render, screen } from '@testing-library/react'

import TotalsNumber from '.'

describe('TotalsNumber', () => {
  function setup({ value, variant }) {
    render(
      <TotalsNumber
        value={value}
        variant={variant}
        showChange
        data-testid="change-value"
      />
    )
  }

  describe('when rendered', () => {
    it('renders commit change when there is a valid value', () => {
      setup({ value: 23, variant: 'default' })
      const changeValue = screen.getByTestId('number-value')
      expect(changeValue).toHaveTextContent('23.00%')
      expect(changeValue).toHaveClass("before:content-['+']")
    })

    it('renders negative number when change is negative', () => {
      setup({ value: -17, variant: 'default' })
      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent('-17.00%')
    })

    it('renders - when there is an invalid value', () => {
      setup({ value: undefined, variant: 'default' })
      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent('-')
    })

    it('renders 0 when you get 0 change', () => {
      setup({ value: 0, variant: 'default' })
      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent('0')
    })
  })
})
