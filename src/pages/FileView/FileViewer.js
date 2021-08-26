import cs from 'classnames'
import { useState } from 'react'
import Breadcrumb from 'ui/Breadcrumb'
import Progress from 'ui/Progress'
import CodeRenderer from './CodeRenderer'
import CoverageSelect from './CoverageSelect'
import PropTypes from 'prop-types'
import AppLink from 'shared/AppLink'

function FileViewer({ treePaths, content, coverage, totals, title, change }) {
  const [covered, setCovered] = useState(true)
  const [uncovered, setUncovered] = useState(true)
  const [partial, setPartial] = useState(true)
  return (
    <div className="flex flex-col">
      <div className="flex items-start md:items-center flex-col md:flex-row mb-4 justify-between">
        <span className="text-ds-gray-senary font-semibold text-base">
          {title}
        </span>
        <div className="flex mt-4 md:mt-0">
          <span className="text-xs font-semibold mr-7">View coverage by:</span>
          <div className="mr-7">
            <CoverageSelect
              onChange={() => setCovered((c) => !c)}
              checked={covered}
              coverage={1}
            />
          </div>
          <div className="mr-7">
            <CoverageSelect
              onChange={() => setPartial((p) => !p)}
              checked={partial}
              coverage={2}
            />
          </div>
          <CoverageSelect
            onChange={() => setUncovered((u) => !u)}
            checked={uncovered}
            coverage={0}
          />
        </div>
      </div>
      <div className="flex justify-between border-t px-3 border-r border-l border-solid bg-ds-gray-primary border-ds-gray-tertiary items-center h-10">
        <Breadcrumb paths={[...treePaths]} />
        <div className="flex">
          <div className="w-56 mr-3">
            <Progress amount={totals} label={true} />
          </div>
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
      <div>
        <CodeRenderer
          showCovered={covered}
          showUncovered={uncovered}
          coverage={coverage}
          showPartial={partial}
          code={content}
        />{' '}
      </div>
    </div>
  )
}

FileViewer.propTypes = {
  content: PropTypes.string.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape()]),
  coverage: PropTypes.shape().isRequired,
  totals: PropTypes.number.isRequired,
  treePaths: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)).isRequired,
  change: PropTypes.number,
}

export default FileViewer
