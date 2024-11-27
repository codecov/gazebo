import { render, screen } from '@testing-library/react'

import TotalsNumber from './TotalsNumber'

describe('TotalsNumber', () => {
  describe('when rendered with plain', () => {
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

      const numberValue = screen.getByTestId('number-value')
      expect(numberValue).not.toHaveClass('bg-ds-coverage-covered')
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

      const numberValue = screen.getByTestId('number-value')
      expect(numberValue).not.toHaveClass('bg-ds-coverage-uncovered')
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

      const numberValue = screen.getByTestId('number-value')
      expect(numberValue).not.toHaveClass('bg-ds-coverage-covered')
    })
  })

  describe('when rendered without plain', () => {
    it('renders commit change when there is a valid value', () => {
      render(
        <TotalsNumber
          value={23}
          variant="default"
          showChange
          data-testid="change-value"
        />
      )

      const changeValue = screen.getByTestId('number-value')
      expect(changeValue).toHaveTextContent('23.00%')
      expect(changeValue).toHaveClass("before:content-['+']")

      const numberValue = screen.getByTestId('number-value')
      expect(numberValue).toHaveClass('bg-ds-coverage-covered')
    })

    it('renders negative number when change is negative', () => {
      render(
        <TotalsNumber
          value={-17}
          variant="default"
          showChange
          data-testid="change-value"
        />
      )

      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent('-17.00%')

      const numberValue = screen.getByTestId('number-value')
      expect(numberValue).toHaveClass('bg-ds-coverage-uncovered')
    })

    it('renders - when there is an invalid value', () => {
      render(
        <TotalsNumber
          value={undefined}
          variant="default"
          showChange
          data-testid="change-value"
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
        />
      )

      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent('0')

      const numberValue = screen.getByTestId('number-value')
      expect(numberValue).toHaveClass('bg-ds-coverage-covered')
    })
  })
})
