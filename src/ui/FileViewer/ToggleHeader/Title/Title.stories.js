import { useState } from 'react'

import { LINE_STATE } from 'shared/utils/fileviewerLines'

import Title, { TitleCoverage, TitleFlags } from './Title'

const Template = (args) => {
  const [covered, setCovered] = useState(true)
  const [selectedFlags, setSelectedFlags] = useState([])
  const [uncovered, setUncovered] = useState(true)
  const [partial, setPartial] = useState(true)

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
      <TitleCoverage
        onChange={() => setCovered((covered) => !covered)}
        checked={covered}
        coverage={LINE_STATE.COVERED}
      />
      <TitleCoverage
        onChange={() => setPartial((partial) => !partial)}
        checked={partial}
        coverage={LINE_STATE.PARTIAL}
      />
      <TitleCoverage
        onChange={() => setUncovered((uncovered) => !uncovered)}
        checked={uncovered}
        coverage={LINE_STATE.UNCOVERED}
      />
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
