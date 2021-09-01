import PropTypes from 'prop-types'

function Chart({ data }) {
  console.log(data)
  return <p>Loaded!</p>
}

Chart.propTypes = {
  data: PropTypes.object,
}

export default Chart
