import PropTypes from 'prop-types'

import Sparkline from 'ui/Sparkline'
import TotalsNumber from 'ui/TotalsNumber'

const isDataEmpty = ({ measurements }) =>
  !measurements ||
  measurements.length === 0 ||
  (measurements.length > 0 && measurements.every(({ avg }) => avg === null))

function TableSparkline({ measurements, change, name }) {
  const noData = isDataEmpty({ measurements })

  return (
    <div className="flex grow justify-end gap-3">
      <Sparkline
        description={`Flag ${name} trend sparkline`}
        dataTemplate={(d) => (d ? `${d}%` : 'No Data Available')}
        datum={noData ? [null] : measurements}
        select={(d) => d?.avg}
      />
      <div className="w-1/5">
        {noData ? (
          <span> No Data</span>
        ) : (
          <TotalsNumber value={change} showChange />
        )}
      </div>
    </div>
  )
}

export default TableSparkline

TableSparkline.propTypes = {
  measurements: PropTypes.array.isRequired,
  change: PropTypes.number,
  name: PropTypes.string.isRequired,
}
