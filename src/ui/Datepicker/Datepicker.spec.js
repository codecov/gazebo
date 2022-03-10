import { fireEvent, render, screen } from '@testing-library/react'

import Datepicker from './Datepicker'

describe('Datepicker', () => {
  let props

  function setup({ params, updateParams }) {
    render(<Datepicker params={params} updateParams={updateParams} />)
  }

  describe('DateRangePicker component with start and end date', () => {
    beforeEach(() => {
      props = {
        params: {
          startDate: '10/02/2021',
          endDate: '12/05/2021',
        },
        updateParams: jest.fn(),
      }
      setup(props)
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

    it('renders an empty string for start and end date when value is changed to null', () => {
      const startDate = screen.getByRole('textbox', { name: 'Start Date' })
      const endDate = screen.getByRole('textbox', { name: 'End Date' })
      fireEvent.change(startDate, { target: { value: null } })
      fireEvent.change(endDate, { target: { value: null } })
      expect(startDate.value).toBe('')
      expect(endDate.value).toBe('')
      expect(props.updateParams).toBeCalled()
    })
  })
})
