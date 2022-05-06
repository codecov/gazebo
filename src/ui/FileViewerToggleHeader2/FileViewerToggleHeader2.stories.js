import { useState } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import FileViewerToggleHeader from './FileViewerToggleHeader2'

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
        <FileViewerToggleHeader
          flagData={flagData}
          lineCoverageStatesAndSetters={lineCoverageStatesAndSetters}
          {...args}
        />
      </Route>
    </MemoryRouter>
  )
}

export const SimpleFileViewerToggleHeader = Template.bind({})
SimpleFileViewerToggleHeader.args = {
  coverageIsLoading: false,
}

export const LoadingFileViewerToggleHeader = Template.bind({})
LoadingFileViewerToggleHeader.args = {
  coverageIsLoading: true,
}

export default {
  title: 'Components/FileViewerToggleHeader',
  component: FileViewerToggleHeader,
}
