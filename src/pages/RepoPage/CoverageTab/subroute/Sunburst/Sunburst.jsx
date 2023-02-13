import { useState } from 'react'

import SunburstChart from 'ui/SunburstChart'

import useSunburstChart from './hooks/useSunburstChart'

const Placeholder = () => (
  <div
    data-testid="placeholder"
    className="animate-pulse bg-ds-gray-tertiary rounded-full aspect-square"
  />
)

function Sunburst() {
  const [currentPath, setCurrentPath] = useState('')
  const { data, isFetching, isError, isLoading } = useSunburstChart()

  if (isFetching || isLoading) {
    return <Placeholder />
  }

  if (isError) {
    return <p>The sunburst chart failed to load.</p>
  }

  return (
    <>
      <SunburstChart
        data={data}
        svgFontSize="24px"
        svgRenderSize={930}
        selector={(data) => data?.coverage}
        onHover={(path) => setCurrentPath(`${path}`)}
      />
      <span dir="rtl" className="truncate text-left">
        {currentPath}
      </span>
    </>
  )
}

export default Sunburst
