import Avatar from '.'

const Template = (args) => <Avatar {...args} />

const constantArgs = {
  user: {
    userName: 'andrewyaeger',
    avatarUrl: 'https://avatars0.githubusercontent.com/u/1060902?v=3&s=55',
  },
}

export const Default = Template.bind({})
Default.args = { ...constantArgs }

export const Bordered = Template.bind({})
Bordered.args = { bordered: true, ...constantArgs }

export const WithFaultyImage = Template.bind({})
WithFaultyImage.args = {
  user: {
    userName: 'andrewyaeger',
    avatarUrl: 'https://avatars0.githubusercontent.com/u/?v=3&s=55', // doesn't resolve
  },
}

export const WithFaultyImageAndNoUserName = Template.bind({})
WithFaultyImageAndNoUserName.args = {
  user: {
    userName: null,
    avatarUrl: 'https://avatars0.githubusercontent.com/u/?v=3&s=55', // doesn't resolve
  },
}

export default {
  title: 'Components/Avatar',
  component: Avatar,
}
