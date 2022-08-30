import { LINE_STATE } from 'shared/utils/fileviewer'

import Title, { TitleCoverage, TitleFlags } from './Title'

const Template = (args) => {
  return (
    <Title {...args}>
      <TitleCoverage coverage={LINE_STATE.COVERED} />
      <TitleCoverage coverage={LINE_STATE.PARTIAL} />
      <TitleCoverage coverage={LINE_STATE.UNCOVERED} />
      <TitleFlags
        flags={['flag1', 'flag2']}
        onChange={(flags) => console.log(flags)}
        flagsIsLoading={false}
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
