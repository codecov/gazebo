import React from 'react'
import 'react-dates/initialize'
import { DateRangePicker } from 'react-dates'
import 'react-dates/lib/css/_datepicker.css'

import './Datepicker.css'

function Datepicker() {
  const [startDate, setStartDate] = React.useState()
  const [endDate, setEndDate] = React.useState()
  const [focusedInput, setFocusedInput] = React.useState()

  const handleOnDatesChange = ({ startDate, endDate }) => {
    setStartDate(startDate)
    setEndDate(endDate)
  }

  return (
    <div className="flex flex-row border rounded">
      {/* TODO: Make these url params. Ran into issues cause it's expect a Moment object */}
      <DateRangePicker
        startDate={startDate}
        startDateId="start-date"
        startDateAriaLabel="Start Date"
        endDate={endDate}
        endDateId="end-date"
        endDateAriaLabel="End Date"
        onDatesChange={({ startDate, endDate }) =>
          handleOnDatesChange({ startDate, endDate })
        }
        focusedInput={focusedInput}
        onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
        small={true}
        noBorder={true}
      />
    </div>
  )
}

export default Datepicker
