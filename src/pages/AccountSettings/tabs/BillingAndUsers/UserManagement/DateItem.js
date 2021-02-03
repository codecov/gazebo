import PropTypes from 'prop-types'

import formatDistance from 'date-fns/formatDistance'
import parseISO from 'date-fns/parseISO'

const DateItemClasses = {
  root: 'flex flex-col text-sm',
  label: 'font-bold',
}

export function DateItem({ date, label, testId }) {
  const compare = parseISO(date)
  const today = new Date()
  return date ? (
    <div className={DateItemClasses.root}>
      <span className={DateItemClasses.label}>{label}</span>
      <span data-testid={testId}>
        {formatDistance(compare, today, 'MM/dd/yyyy')}
      </span>
    </div>
  ) : null
}

DateItem.propTypes = {
  date: PropTypes.string,
  label: PropTypes.string.isRequired,
  testId: PropTypes.string.isRequired,
}
