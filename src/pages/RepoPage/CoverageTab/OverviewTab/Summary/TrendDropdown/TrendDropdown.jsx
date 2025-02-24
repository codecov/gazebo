import { useLocationParams } from 'services/navigation/useLocationParams'
import { Trend } from 'shared/utils/timeseriesCharts'
import Select from 'ui/Select'

const defaultQueryParams = {
  trend: null,
}

function TrendDropdown() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)

  const items = Object.values(Trend)
  return (
    <h3 className="flex min-w-40 items-center text-sm font-semibold text-ds-gray-octonary">
      <Select
        dataMarketing="coverage-trend-selector"
        ariaName="select coverage over time range"
        variant="text"
        items={items}
        onChange={(selected) => updateParams({ trend: selected })}
        value={params?.trend || Trend.THREE_MONTHS}
        renderItem={(item) => <p className="capitalize">{item}</p>}
      />
      trend
    </h3>
  )
}

export default TrendDropdown
