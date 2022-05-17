import CodeRendererInfoRow from './CodeRendererInfoRow'

const Template = (args) => <CodeRendererInfoRow {...args} />

export const SimpleCoverageHeader = Template.bind({})
SimpleCoverageHeader.args = {
  header: '-6,16, +6,16',
  headName: 'folder/file.js',
  headCoverage: 23.34,
  patchCoverage: 85.34,
  changeCoverage: 75.23,
}

export const CoverageHeaderWithoutValues = Template.bind({})
CoverageHeaderWithoutValues.args = {
  header: null,
  headName: null,
  headCoverage: null,
  patchCoverage: null,
  changeCoverage: null,
}

export default {
  title: 'Components/CodeRendererInfoRow',
  component: CodeRendererInfoRow,
}
