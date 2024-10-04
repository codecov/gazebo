import { useLocationParams } from 'services/navigation'
import { Trend } from 'shared/utils/timeseriesCharts'
import Select from 'ui/Select'

const defaultQueryParams = {
  trend: null,
}

export function TrendDropdown() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const items = Object.values(Trend)

  return (
    <h3 className="flex min-w-40 items-center text-sm font-semibold text-ds-gray-octonary">
      <Select
        // @ts-expect-error Select needs to be typed
        ariaName="bundle-chart-trend-dropdown"
        dataMarketing="Bundle chart trend dropdown"
        variant="text"
        items={items}
        onChange={(selected: string) => updateParams({ trend: selected })}
        // @ts-expect-error useLocationParams needs to be typed
        value={params?.trend || Trend.THREE_MONTHS}
        renderItem={(item: string) => <p className="capitalize">{item}</p>}
      />
      <span className="text-ds-gray-senary">trend</span>
    </h3>
  )
}
