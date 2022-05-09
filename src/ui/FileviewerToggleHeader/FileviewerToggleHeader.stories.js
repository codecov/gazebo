import { useState } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import FileviewerToggleHeader from './FileviewerToggleHeader'

const Template = (args) => {
  const [covered, setCovered] = useState(true)
  const [uncovered, setUncovered] = useState(true)
  const [partial, setPartial] = useState(true)
  const [selectedFlags, setSelectedFlags] = useState([])

  const flagNames = ['flag1', 'flag2', 'flag3']

  const flagData = {
    flagNames,
    selectedFlags,
    setSelectedFlags,
  }

  const lineCoverageStatesAndSetters = {
    covered,
    setCovered,
    uncovered,
    setUncovered,
    partial,
    setPartial,
  }

  return (
    <MemoryRouter
      initialEntries={['/gh/codecov/gazebo/commit/123sha/flag1/mafs.js']}
    >
      <Route path="/:provider/:owner/:repo/commit/:commit/:path">
        <FileviewerToggleHeader
          flagData={flagData}
          lineCoverageStatesAndSetters={lineCoverageStatesAndSetters}
          {...args}
        />
      </Route>
    </MemoryRouter>
  )
}

export const SimpleFileviewerToggleHeader = Template.bind({})
SimpleFileviewerToggleHeader.args = {
  coverageIsLoading: false,
}

export const LoadingFileviewerToggleHeader = Template.bind({})
LoadingFileviewerToggleHeader.args = {
  coverageIsLoading: true,
}

export default {
  title: 'Components/FileviewerToggleHeader',
  component: FileviewerToggleHeader,
}
