import Avatar from '.'

const Template = (args) => <Avatar {...args} />

const constantArgs = {
  avatarUrl: 'https://avatars0.githubusercontent.com/u/1060902?v=3&s=55',
  alt: 'avatar',
}

export const Default = Template.bind({})
Default.args = { ...constantArgs }

export const Bordered = Template.bind({})
Bordered.args = { bordered: true, ...constantArgs }

export default {
  title: 'Components/Avatar',
  component: Avatar,
}
