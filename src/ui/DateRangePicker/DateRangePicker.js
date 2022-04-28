import PropTypes from 'prop-types'
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import './DateRangePicker.css'

function DateRangePicker({ startDate, endDate, onChange }) {
  const [dateRange, setDateRange] = useState([
    typeof startDate === 'string' ? new Date(startDate) : undefined,
    typeof endDate === 'string' ? new Date(endDate) : undefined,
  ])
  const [_startDate, _endDate] = dateRange

  function handleDateChange([startDate, endDate]) {
    setDateRange([startDate, endDate])
    onChange([startDate, endDate])
  }

  return (
    <div className="flex flex-row items-center border rounded gap-2">
      <DatePicker
        name="DateRangePicker"
        selectsRange={true}
        startDate={_startDate}
        endDate={_endDate}
        onChange={handleDateChange}
        selectsStart
        placeholderText="Start Date"
        className="font-sans text-ds-gray-octonary text-sm px-2 py-1 w-full focus:outline-none focus:border-b-2 border-0 border-ds-gray-octonary"
      />
    </div>
  )
}

DateRangePicker.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  onChange: PropTypes.func.isRequired,
}

export default DateRangePicker
