import { useLocationParams } from 'services/navigation'
import { Trend } from 'shared/utils/legacyCharts'
import Select from 'ui/Select'

const defaultQueryParams = {
  trend: null,
}

function TrendDropdown() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)

  const items = Object.values(Trend)
  return (
    <h3 className="text-ds-gray-octonary text-sm font-semibold min-w-[16rem] flex items-center">
      <Select
        ariaName="select coverage over time range"
        variant="text"
        items={items}
        onChange={(selected) => updateParams({ trend: selected })}
        value={params?.trend || items[5]}
        renderItem={(item) => <p className="capitalize">{item}</p>}
      />
      trend
    </h3>
  )
}

export default TrendDropdown
