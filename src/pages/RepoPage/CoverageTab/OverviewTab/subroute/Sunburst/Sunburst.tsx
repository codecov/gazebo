import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoConfig } from 'services/repo/useRepoConfig'
import Breadcrumb from 'ui/Breadcrumb'
import SunburstChart from 'ui/SunburstChart'

import useConvertD3ToBreadcrumbs from './hooks/useConvertD3ToBreadcrumbs'
import useSunburstChart from './hooks/useSunburstChart'

const Placeholder = () => (
  <div
    data-testid="placeholder"
    className="aspect-square animate-pulse rounded-full bg-ds-gray-tertiary"
  />
)

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function Sunburst() {
  const { provider, owner, repo } = useParams<URLParams>()
  const [currentPath, setCurrentPath] = useState({ path: '', type: 'folder' })
  const { data, isFetching, isError, isLoading } = useSunburstChart()
  const { data: config } = useRepoConfig({ provider, owner, repo })

  const breadcrumbPaths = useConvertD3ToBreadcrumbs(currentPath)

  if (isFetching || isLoading) {
    return <Placeholder />
  }

  if (isError) {
    return <p>The sunburst chart failed to load.</p>
  }

  console.log('BEFORE', breadcrumbPaths)

  interface Path {
    text: string
  }

  const getTruncatedBreadcrumbs = (paths: Path[] = []) => {
    if (paths.length === 0) {
      return []
    }
    const maxWidth = 250
    const approxCharacterWidth = 10

    let totalWidth = 0
    const visiblePaths = []

    for (let i = 0; i < paths.length; i++) {
      const pathWidth = paths[i].text.length * approxCharacterWidth
      totalWidth += pathWidth

      if (totalWidth <= maxWidth) {
        visiblePaths.push(paths[i])
      } else {
        // stop adding paths if exeed available space
        break
      }
    }

    // must have at least 1 visible path
    if (paths.length !== 0 && visiblePaths.length === 0) {
      visiblePaths.push(paths[paths.length - 1])
    }

    return visiblePaths
  }

  const isTruncated = true
  const truncatedBreadcrumbPaths = getTruncatedBreadcrumbs(breadcrumbPaths)

  console.log('AFTER', truncatedBreadcrumbPaths)

  return (
    <>
      <SunburstChart
        data={data}
        svgFontSize="24px"
        svgRenderSize={930}
        selector={(data) => data?.coverage}
        onHover={({ path, type }) => setCurrentPath({ path, type })}
        colorDomainMin={config?.indicationRange?.lowerRange}
        colorDomainMax={config?.indicationRange?.upperRange}
      />
      <span>
        {isTruncated ? <div className="text-ds-gray-octonary">...</div> : null}
        <span dir="rtl" className="truncate text-left">
          <Breadcrumb paths={truncatedBreadcrumbPaths} />
        </span>
      </span>
    </>
  )
}

export default Sunburst
