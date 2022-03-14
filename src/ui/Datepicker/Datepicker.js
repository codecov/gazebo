import moment from 'moment'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import 'react-dates/initialize'
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates'
import 'react-dates/lib/css/_datepicker.css'

import './Datepicker.css'

function Datepicker({ params, updateParams }) {
  const [startDate, setStartDate] = React.useState(
    params?.startDate ? moment(params?.startDate) : null
  )
  const [endDate, setEndDate] = React.useState(
    params?.endDate ? moment(params?.endDate) : null
  )
  const [focusedInput, setFocusedInput] = React.useState()

  const handleOnDatesChange = ({ startDate, endDate }) => {
    setStartDate(startDate)
    setEndDate(endDate)

    if (startDate && endDate) {
      updateParams({
        startDate: moment(startDate).format(),
        endDate: moment(endDate).format(),
      })
    }

    if (startDate === null && endDate === null) {
      updateParams({
        startDate: '',
        endDate: '',
      })
    }
  }

  useEffect(() => {
    setStartDate(params?.startDate ? moment(params?.startDate) : null)
    setEndDate(params?.endDate ? moment(params?.endDate) : null)
  }, [params])

  return (
    <div className="flex flex-row border rounded">
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
        isOutsideRange={(day) => !isInclusivelyBeforeDay(day, moment())}
        focusedInput={focusedInput}
        onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
        small={true}
        noBorder={true}
        initialVisibleMonth={() => moment().subtract(1, 'month')}
      />
    </div>
  )
}

Datepicker.propTypes = {
  params: PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
  }).isRequired,
  updateParams: PropTypes.func.isRequired,
}

export default Datepicker
