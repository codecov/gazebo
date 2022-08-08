import { useState } from 'react'

import { LINE_STATE } from 'shared/utils/fileviewer'

import Title, { TitleCoverage, TitleFlags } from './Title'

const Template = (args) => {
  const [selectedFlags, setSelectedFlags] = useState([])

  return (
    <Title
      {...args}
      Flags={() => {
        ;<TitleFlags
          list={['flag1', 'flag2']}
          current={selectedFlags}
          onChange={setSelectedFlags}
          flagsIsLoading={false}
        />
      }}
    >
      <TitleCoverage coverage={LINE_STATE.COVERED} />
      <TitleCoverage coverage={LINE_STATE.PARTIAL} />
      <TitleCoverage coverage={LINE_STATE.UNCOVERED} />
    </Title>
  )
}

export const DefaultTitle = Template.bind({})
DefaultTitle.args = {
  title: 'File Viewer',
}

export default {
  title: 'Components/Title',
  component: Title,
}
