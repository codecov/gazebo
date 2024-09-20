import { cleanup, render, screen } from '@testing-library/react'

import TotalsNumber from './TotalsNumber'

afterEach(() => {
  cleanup()
})

describe('TotalsNumber', () => {
  describe('when rendered', () => {
    it('renders commit change when there is a valid value', () => {
      render(
        <TotalsNumber
          value={23}
          variant="default"
          showChange
          data-testid="change-value"
          plain
        />
      )

      const changeValue = screen.getByTestId('number-value')
      expect(changeValue).toHaveTextContent('23.00%')
      expect(changeValue).toHaveClass("before:content-['+']")
    })

    it('renders negative number when change is negative', () => {
      render(
        <TotalsNumber
          value={-17}
          variant="default"
          showChange
          data-testid="change-value"
          plain
        />
      )

      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent('-17.00%')
    })

    it('renders - when there is an invalid value', () => {
      render(
        <TotalsNumber
          value={undefined}
          variant="default"
          showChange
          data-testid="change-value"
          plain
        />
      )

      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent('-')
    })

    it('renders 0 when you get 0 change', () => {
      render(
        <TotalsNumber
          value={0}
          variant="default"
          showChange
          data-testid="change-value"
          plain
        />
      )

      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent('0')
    })
  })
})
