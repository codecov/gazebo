import PropTypes from 'prop-types'
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import './DateRangePicker.css'

function DatepRangePicker({ params, updateParams }) {
  const [dateRange, setDateRange] = useState([
    params?.startDate ? new Date(params.startDate) : null,
    params?.endDate ? new Date(params.endDate) : null,
  ])
  const [startDate, endDate] = dateRange

  function handleDateChange([startDate, endDate]) {
    setDateRange([startDate, endDate])
    updateParams((oldParams) => ({
      ...oldParams,
      startDate,
      endDate,
    }))
  }

  return (
    <div className="flex flex-row items-center border rounded gap-2">
      <DatePicker
        name="DateRangePicker"
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
        selectsStart
        placeholderText="Start Date"
        className="font-sans text-ds-gray-octonary text-sm px-2 py-1 w-full focus:outline-none focus:border-b-2 border-0 border-ds-gray-octonary"
      />
    </div>
  )
}

DatepRangePicker.propTypes = {
  params: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
  updateParams: PropTypes.func.isRequired,
}

export default DatepRangePicker
