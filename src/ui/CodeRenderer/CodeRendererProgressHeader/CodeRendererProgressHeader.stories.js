import CodeRendererProgressHeader from './CodeRendererProgressHeader'

const Template = (args) => <CodeRendererProgressHeader {...args} />

export const SimpleCodeRendererProgressHeader = Template.bind({})
SimpleCodeRendererProgressHeader.args = {
  treePaths: [],
  fileCoverage: 39.28,
  change: 34.21,
}

export const CodeRendererProgressHeaderWithTreepaths = Template.bind({})
CodeRendererProgressHeaderWithTreepaths.args = {
  treePaths: [{ pageName: 'owner', text: 'owner' }],
  fileCoverage: 14.28,
  change: 34.21,
}

export const CodeRendererProgressHeaderWithoutChange = Template.bind({})
CodeRendererProgressHeaderWithoutChange.args = {
  treePaths: [],
  fileCoverage: 39.28,
}

export default {
  title: 'Components/CodeRendererProgressHeader',
  component: CodeRendererProgressHeader,
}
