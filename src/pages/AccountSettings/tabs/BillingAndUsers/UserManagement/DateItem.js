import PropTypes from 'prop-types'
import formatDistance from 'date-fns/formatDistance'
import parseISO from 'date-fns/parseISO'

export function DateItem({ date, label, testId }) {
  const compare = parseISO(date)
  const today = new Date()
  return (
    <div className="flex flex-col text-sm">
      <span className="font-bold">{label}</span>
      <span data-testid={testId}>
        {date ? formatDistance(compare, today, 'MM/dd/yyyy') : 'never'}
      </span>
    </div>
  )
}

DateItem.propTypes = {
  date: PropTypes.string,
  label: PropTypes.string.isRequired,
  testId: PropTypes.string.isRequired,
}
