import PropTypes from 'prop-types'

function Invoices({ provider, owner }) {
  return 'Invoices'
}

Invoices.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default Invoices
