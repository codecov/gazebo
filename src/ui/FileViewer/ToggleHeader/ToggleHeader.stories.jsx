import { useState } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import ToggleHeader from './ToggleHeader'

const Template = (args) => {
  const [selectedFlags, setSelectedFlags] = useState([])

  const flagNames = ['flag1', 'flag2', 'flag3']

  const flagData = {
    flagNames,
    selectedFlags,
    setSelectedFlags,
  }

  return (
    <MemoryRouter
      initialEntries={['/gh/codecov/gazebo/commit/123sha/flag1/mafs.js']}
    >
      <Route path="/:provider/:owner/:repo/commit/:commit/:path">
        <ToggleHeader flagData={flagData} {...args} />
      </Route>
    </MemoryRouter>
  )
}

export const SimpleFileViewerToggleHeader = {
  render: Template,

  args: {
    coverageIsLoading: false,
  },
}

export const LoadingFileViewerToggleHeader = {
  render: Template,

  args: {
    coverageIsLoading: true,
  },
}

export const SimpleFileViewerToggleHeaderWithHitCount = Template.bind({})
SimpleFileViewerToggleHeaderWithHitCount.args = {
  coverageIsLoading: false,
  showHitCount: true,
}

export default {
  title: 'Components/ToggleHeader',
  component: ToggleHeader,
}
