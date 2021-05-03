import FileEditor from './FileEditor'

const Template = (args) => <FileEditor {...args} />

export const DefaultFileEditor = Template.bind({})
DefaultFileEditor.args = {
  label: 'Name',
  placeholder: 'Write your name',
}

export default {
  title: 'Components/FileEditor',
  component: FileEditor,
}
