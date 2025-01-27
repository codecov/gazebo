import { type Meta, type StoryObj } from '@storybook/react'

import orgSecretDark from 'assets/onboarding/org_secret_dark.png'
import orgSecretLight from 'assets/onboarding/org_secret_light.png'
import {
  Theme,
  ThemeContextProvider,
  useThemeContext,
} from 'shared/ThemeContext'

import LightDarkImg, { type LightDarkImgSrcProps } from './LightDarkImg'

const meta: Meta<typeof LightDarkImg> = {
  title: 'Components/LightDarkImg',
  component: LightDarkImg,
}

export default meta

type Story = StoryObj<typeof LightDarkImg>

const LightDarkImgElements = (args: LightDarkImgSrcProps) => {
  const { theme, setTheme } = useThemeContext()
  return (
    <div>
      <button
        onClick={() =>
          setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)
        }
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: theme === 'light' ? '#000' : '#fff',
          color: theme === 'light' ? '#fff' : '#000',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Toggle Theme
      </button>
      <div>Current Theme: {theme}</div>
      <LightDarkImg {...args} />
    </div>
  )
}

export const SimpleLightDarkImg: Story = {
  args: {
    alt: 'test text',
    src: orgSecretLight,
    darkSrc: orgSecretDark,
  },
  render: (args) => (
    <ThemeContextProvider>
      <LightDarkImgElements {...args} />
    </ThemeContextProvider>
  ),
}
