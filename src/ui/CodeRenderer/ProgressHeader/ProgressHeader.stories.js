import ProgressHeader from './ProgressHeader'

const Template = (args) => <ProgressHeader {...args} />

export const SimpleProgressHeader = Template.bind({})
SimpleProgressHeader.args = {
  treePaths: [],
  fileCoverage: 39.28,
  change: 34.21,
}

export const ProgressHeaderWithTreepaths = Template.bind({})
ProgressHeaderWithTreepaths.args = {
  treePaths: [{ pageName: 'owner', text: 'owner' }],
  fileCoverage: 14.28,
  change: 34.21,
}

export const ProgressHeaderWithoutChange = Template.bind({})
ProgressHeaderWithoutChange.args = {
  treePaths: [],
  fileCoverage: 39.28,
}

export default {
  title: 'Components/ProgressHeader',
  component: ProgressHeader,
}
