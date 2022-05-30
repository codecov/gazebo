import isFinite from 'lodash/isFinite'
import PropTypes from 'prop-types'

import CoverageValue from '../CoverageValue'

const Coverage = ({ coverageData = [] }) => (
  <div className="max-w-xs sm:flex-1 flex gap-2 justify-end items-center">
    {coverageData.map(
      ({ value, label }) =>
        isFinite(value) && (
          <CoverageValue
            key={`${value}-${label}`}
            value={value}
            title={label}
          />
        )
    )}
  </div>
)

Coverage.propTypes = {
  coverageData: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.number, label: PropTypes.string })
  ),
}

export default Coverage
