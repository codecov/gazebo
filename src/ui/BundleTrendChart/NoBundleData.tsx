import { VictoryGroup } from 'victory'

interface NoBundleDataProps {
  dataPointCount: number
}

const NoBundleData: React.FC<NoBundleDataProps> = ({
  dataPointCount,
  ...props
}) => {
  return dataPointCount < 2 ? (
    <VictoryGroup {...props}>
      <text x="40%" y="45%" fontSize="4">
        Not enough data to render
      </text>
    </VictoryGroup>
  ) : null
}

export default NoBundleData
