import Avatar from '.'

const constantArgs = {
  user: {
    username: 'andrewyaeger',
    avatarUrl: 'https://avatars0.githubusercontent.com/u/1060902?v=3&s=55',
  },
}

export const Default = {
  args: { ...constantArgs },
}

export const Bordered = {
  args: { bordered: true, ...constantArgs },
}

export const WithFaultyImage = {
  args: {
    user: {
      username: 'andrewyaeger',
      avatarUrl: 'https://avatars0.githubusercontent.com/u/?v=3&s=55', // doesn't resolve
    },
  },
}

export const WithFaultyImageAndNoUserName = {
  args: {
    user: {
      username: null,
      avatarUrl: 'https://avatars0.githubusercontent.com/u/?v=3&s=55', // doesn't resolve
    },
  },
}

export default {
  title: 'Components/Avatar',
  component: Avatar,
}
