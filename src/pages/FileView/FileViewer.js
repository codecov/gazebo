import { useState } from 'react'
import Breadcrumb from 'ui/Breadcrumb'
import Progress from 'ui/Progress'
import CodeRenderer from './CodeRenderer'
import CoverageSelect from './CoverageSelect'

function FileViewer() {
  const [covered, setCovered] = useState(false)
  const [uncovered, setUncovered] = useState(false)

  const lineCoverage = [
    {
      coverage: {
        base: null,
        head: null,
      },
    },
    {
      coverage: {
        base: 1,
        head: 1,
      },
    },
    {
      coverage: {
        base: 1,
        head: 1,
      },
    },
    {
      coverage: {
        base: 0,
        head: 0,
      },
    },
    {
      coverage: {
        base: 0,
        head: 0,
      },
    },
    {
      coverage: {
        base: 1,
        head: 1,
      },
    },
    {
      coverage: {
        base: 1,
        head: 1,
      },
    },
  ]

  const code = `
  <Breadcrumb
      paths={[
      { pageName: 'owner', text: owner },
      { pageName: 'repo', text: repo },
      ...treePaths,
      {..props}
      ]}
  />
          
  `

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
              covered={false}
            />
          </div>
          <CoverageSelect
            onChange={() => setCovered(!covered)}
            checked={covered}
            covered={true}
          />
        </div>
      </div>
      <div className="flex justify-between border-t px-3 border-r border-l border-solid bg-ds-gray-primary border-ds-gray-tertiary items-center h-10">
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: 'src' },
            { pageName: 'repo', text: 'specs' },
            { pageName: 'repo', text: 'config.js' },
          ]}
        />
        <div className="w-56">
          <Progress amount={80} label={true} />
        </div>
      </div>
      <div>
        <CodeRenderer
          showCovered={covered}
          showUncovered={uncovered}
          coverage={lineCoverage}
          code={code}
        />{' '}
      </div>
    </div>
  )
}

export default FileViewer
