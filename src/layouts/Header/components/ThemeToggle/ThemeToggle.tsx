import React, { useEffect, useState } from 'react'

import { metrics } from 'shared/utils/metrics'
import Icon from 'ui/Icon'

enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

const ThemeToggle: React.FC<{ hidden?: boolean }> = ({ hidden = false }) => {
  const [theme, setTheme] = useState<Theme | null>(() => {
    const storedTheme = localStorage.getItem('theme') as Theme
    if (storedTheme) {
      return storedTheme
    }

    return null
  })

  useEffect(() => {
    document.body.classList.remove(Theme.LIGHT, Theme.DARK)

    if (theme) {
      document.body.classList.add(theme)
    }
  }, [theme])

  const toggleTheme = () => {
    // const systemPrefersDark = window.matchMedia(
    //   '(prefers-color-scheme: dark)'
    // ).matches

    setTheme((prevTheme) => {
      const newTheme = prevTheme
        ? prevTheme === Theme.LIGHT
          ? Theme.DARK
          : Theme.LIGHT
        : Theme.DARK
      // systemPrefersDark
      //   ? Theme.LIGHT
      //   : Theme.DARK
      localStorage.setItem('theme', newTheme)

      if (newTheme === Theme.DARK) {
        metrics.increment('theme.chose_dark', 1)
      } else if (newTheme === Theme.LIGHT) {
        metrics.increment('theme.chose_light', 1)
      }

      return newTheme
    })
  }

  // const systemPrefersDark = window.matchMedia(
  //   '(prefers-color-scheme: dark)'
  // ).matches

  return hidden ? null : (
    <button onClick={toggleTheme} style={{ margin: '8px' }}>
      {/* {theme === Theme.LIGHT || (!theme && !systemPrefersDark) ? ( */}
      {theme === Theme.LIGHT || !theme ? (
        <Icon variant="outline" name="moon" />
      ) : (
        <Icon variant="outline" name="sun" />
      )}
    </button>
  )
}

export default ThemeToggle
