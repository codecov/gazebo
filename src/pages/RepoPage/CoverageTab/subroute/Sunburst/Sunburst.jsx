import { useState } from 'react'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import { useRepoConfig } from 'services/repo/useRepoConfig'
import SunburstChart from 'ui/SunburstChart'

import useSunburstChart from './hooks/useSunburstChart'

const Placeholder = () => (
  <div
    data-testid="placeholder"
    className="animate-pulse bg-ds-gray-tertiary rounded-full aspect-square"
  />
)

function Sunburst() {
  const { provider, owner, repo } = useParams()
  const [currentPath, setCurrentPath] = useState('')
  const { data, isFetching, isError, isLoading } = useSunburstChart()
  const { data: config } = useRepoConfig({ provider, owner, repo })

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
        colorDomainMin={config?.indicationRange?.lowerRange}
        colorDomainMax={config?.indicationRange?.upperRange}
      />
      <span dir="rtl" className="truncate text-left">
        {currentPath}
      </span>
    </>
  )
}

export default Sunburst
