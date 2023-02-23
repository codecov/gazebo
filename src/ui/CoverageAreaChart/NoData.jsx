import PropTypes from 'prop-types'
import { VictoryGroup } from 'victory'

const NoData = ({ dataPointCount, ...props }) => {
  return (
    dataPointCount === 1 && (
      <VictoryGroup {...props}>
        <text x="40%" y="45%" fontSize="4">
          Not enough data to render
        </text>
      </VictoryGroup>
    )
  )
}
NoData.propTypes = {
  dataPointCount: PropTypes.number.isRequired,
}

export default NoData
