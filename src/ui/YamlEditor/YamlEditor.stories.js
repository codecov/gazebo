import YamlEditor from './YamlEditor'

const Template = (args) => <YamlEditor {...args} />

export const DefaultYamlEditor = Template.bind({})
DefaultYamlEditor.args = {
  value: '# test test\ncoverage:\n\tprecision: 5\n\tround: down\n',
}

export default {
  title: 'Components/YamlEditor',
  component: YamlEditor,
}
