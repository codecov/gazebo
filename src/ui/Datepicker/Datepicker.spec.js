import { render, screen, fireEvent } from '@testing-library/react'

import Datepicker from './Datepicker'

describe('Datepicker', () => {
  function setup({ params, updateParams }) {
    render(<Datepicker params={params} updateParams={updateParams} />)
  }

  describe('DateRangePicker component with start and end date', () => {
    beforeEach(() => {
      setup({
        params: {
          startDate: '10/02/2021',
          endDate: '12/05/2021',
        },
        updateParams: () => {},
      })
    })

    it('has a changeable start date', () => {
      const startDate = screen.getByRole('textbox', { name: 'Start Date' })
      expect(startDate.value).toBe('10/02/2021')
      fireEvent.change(startDate, { target: { value: '01/01/2021' } })
      expect(startDate.value).toBe('01/01/2021')
    })

    it('has a changeable end date', () => {
      const endDate = screen.getByRole('textbox', { name: 'End Date' })
      expect(endDate.value).toBe('12/05/2021')
      fireEvent.change(endDate, { target: { value: '10/01/2021' } })
      expect(endDate.value).toBe('10/01/2021')
    })
  })

  describe('DateRangePicker component with null start and end dates', () => {
    beforeEach(() => {
      setup({
        params: {
          startDate: null,
          endDate: null,
        },
        updateParams: () => {},
      })
    })

    it('renders an empty string for start and end date', () => {
      const startDate = screen.getByRole('textbox', { name: 'Start Date' })
      const endDate = screen.getByRole('textbox', { name: 'End Date' })
      expect(startDate.value).toBe('')
      expect(endDate.value).toBe('')
    })
  })
})
