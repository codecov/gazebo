import Sparkline from 'ui/Sparkline'
import TotalsNumber from 'ui/TotalsNumber'

const isDataEmpty = ({ measurements }: { measurements: any[] }) =>
  !measurements ||
  measurements.length === 0 ||
  (measurements.length > 0 && measurements.every(({ avg }) => avg === null))

export type TableSparklineProps = {
  measurements: any[]
  name: string
  change?: number | null
}

function TableSparkline({ measurements, name, change }: TableSparklineProps) {
  const noData = isDataEmpty({ measurements })

  return (
    <div className="flex grow justify-end gap-3">
      <Sparkline
        description={`Component ${name} trend sparkline`}
        dataTemplate={(d) => (d ? `${d}%` : 'No Data Available')}
        datum={noData ? [null] : measurements}
        select={(d) => d?.avg}
      />
      <div className="w-1/5 text-end">
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
