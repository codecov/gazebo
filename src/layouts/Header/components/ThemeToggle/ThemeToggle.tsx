import React, { useEffect, useState } from 'react'

import Icon from 'ui/Icon'

enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme') as Theme
    if (storedTheme) {
      return storedTheme
    }

    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches

    return systemPrefersDark ? Theme.DARK : Theme.LIGHT
  })

  useEffect(() => {
    // document.body.className = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
    )
  }

  return (
    <button onClick={toggleTheme} style={{ margin: '8px' }}>
      {theme === Theme.LIGHT ? (
        <Icon variant="outline" name="sun" />
      ) : (
        <Icon variant="outline" name="moon" />
      )}
    </button>
  )
}

export default ThemeToggle
