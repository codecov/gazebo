import React from 'react'

import { Theme, useThemeContext } from 'shared/ThemeContext'

interface LightDarkSrcProps {
  alt: string
  src: string
  darkSrc?: string
}

type LightDarkImgProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'src'
> &
  LightDarkSrcProps

function LightDarkImg({ src, darkSrc, alt, ...props }: LightDarkImgProps) {
  const { theme } = useThemeContext()
  const isDarkMode = theme === Theme.DARK

  return (
    <img {...props} alt={alt} src={isDarkMode && darkSrc ? darkSrc : src} />
  )
}

export default LightDarkImg
