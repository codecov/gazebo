import PropTypes from 'prop-types'

import TotalsNumber from 'ui/TotalsNumber'

export const CoverageValue = ({ value, title }) => (
  <>
    <span className="font-semibold text-ds-gray-quinary">{title}</span>{' '}
    <TotalsNumber value={value} plain light />
  </>
)

CoverageValue.propTypes = {
  value: PropTypes.number,
  title: PropTypes.string,
}

export default CoverageValue
