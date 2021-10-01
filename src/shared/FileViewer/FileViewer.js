import cs from 'classnames'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'

import Breadcrumb from 'ui/Breadcrumb'
import Progress from 'ui/Progress'
import Spinner from 'ui/Spinner'
import AppLink from 'shared/AppLink'
import MultiSelect from 'ui/MultiSelect'
import { useCoverageWithFlags } from 'services/file/hooks'

import CodeRenderer from './CodeRenderer'
import CoverageSelect from './CoverageSelect'

function useCoverageData({ coverage, totals, selectedFlags }) {
  const coverageForAllFlags = selectedFlags.length === 0
  const { owner, repo, provider, ref, ...path } = useParams()
  const queryPerFlag = useCoverageWithFlags(
    {
      provider,
      owner,
      repo,
      ref,
      path: path[0],
      flags: selectedFlags,
    },
    {
      // only run the query if we are filtering per flag
      enabled: !coverageForAllFlags,
      suspense: false,
    }
  )

  if (coverageForAllFlags) {
    // no flag selected, we can return the default coverage
    return { coverage, totals, isLoading: false }
  }

  return {
    coverage: queryPerFlag.data?.coverage ?? {},
    totals: queryPerFlag.data?.totals ?? 0,
    isLoading: queryPerFlag.isLoading,
  }
}

function FileViewer({
  treePaths,
  content,
  coverage,
  totals,
  title,
  change,
  flagNames = [],
}) {
  const [selectedFlags, setSelectedFlags] = useState([])
  const [covered, setCovered] = useState(true)
  const [uncovered, setUncovered] = useState(true)
  const [partial, setPartial] = useState(true)

  const coverageData = useCoverageData({ coverage, totals, selectedFlags })

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap px-3 md:p-0 mb-4">
        <span className="text-ds-gray-senary font-semibold text-base">
          {title}
        </span>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-7">
          <span className="mb-2 sm:mb-0 text-xs font-semibold">
            View coverage by:
          </span>
          <CoverageSelect
            onChange={() => setCovered((c) => !c)}
            checked={covered}
            coverage={1}
          />
          <CoverageSelect
            onChange={() => setPartial((p) => !p)}
            checked={partial}
            coverage={2}
          />
          <CoverageSelect
            onChange={() => setUncovered((u) => !u)}
            checked={uncovered}
            coverage={0}
          />
          {flagNames.length > 1 && (
            <div>
              {coverageData.isLoading && <Spinner />}
              <MultiSelect
                ariaName="Filter by flags"
                selectedItems={selectedFlags}
                items={flagNames}
                onChange={setSelectedFlags}
                resourceName="flag"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <div
          className={`
            flex flex-row flex-wrap items-start justify-between gap-2 sm:items-center
            bg-ds-gray-primary
            border-t p-3 border-r border-l border-solid border-ds-gray-tertiary 
          `}
        >
          <div className="flex-1">
            <Breadcrumb paths={[...treePaths]} />
          </div>
          <div className="sm:flex-1 flex gap-2 justify-end items-center">
            <Progress amount={coverageData.totals} label />
            {change && (
              <span
                className={cs('font-semibold text-sm', {
                  'bg-ds-coverage-uncovered': change < 0,
                  'bg-ds-coverage-covered': change >= 0,
                })}
              >
                {change.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        <CodeRenderer
          showCovered={covered}
          showUncovered={uncovered}
          coverage={coverageData.coverage}
          showPartial={partial}
          code={content}
          language="python"
        />
      </div>
    </>
  )
}

FileViewer.propTypes = {
  content: PropTypes.string.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape()]),
  coverage: PropTypes.shape().isRequired,
  totals: PropTypes.number,
  treePaths: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)).isRequired,
  change: PropTypes.number,
  flagNames: PropTypes.arrayOf(PropTypes.string),
}

export default FileViewer
