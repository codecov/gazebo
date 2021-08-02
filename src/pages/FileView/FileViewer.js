import { useState } from 'react'
import Breadcrumb from 'ui/Breadcrumb'
import Progress from 'ui/Progress'
import CodeRenderer from './CodeRenderer'
import CoverageSelect from './CoverageSelect'
import PropTypes from 'prop-types'
import AppLink from 'shared/AppLink'

function FileViewer({ treePaths, content, coverage }) {
  const [covered, setCovered] = useState(true)
  const [uncovered, setUncovered] = useState(true)
  const [partial, setPartial] = useState(true)

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-4 justify-between">
        <span className="text-ds-gray-senary font-semibold text-base">
          Config.js
        </span>
        <div className="flex">
          <span className="text-xs font-semibold mr-7">View coverage by:</span>
          <div className="mr-7">
            <CoverageSelect
              onChange={() => setUncovered(!uncovered)}
              checked={uncovered}
              coverage={1}
            />
          </div>
          <div className="mr-7">
            <CoverageSelect
              onChange={() => setPartial(!partial)}
              checked={partial}
              coverage={2}
            />
          </div>
          <CoverageSelect
            onChange={() => setCovered(!covered)}
            checked={covered}
            coverage={0}
          />
        </div>
      </div>
      <div className="flex justify-between border-t px-3 border-r border-l border-solid bg-ds-gray-primary border-ds-gray-tertiary items-center h-10">
        <Breadcrumb paths={[...treePaths]} />
        <div className="w-56">
          <Progress amount={80} label={true} />
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
  coverage: PropTypes.shape().isRequired,
  treePaths: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)).isRequired,
}

export default FileViewer
