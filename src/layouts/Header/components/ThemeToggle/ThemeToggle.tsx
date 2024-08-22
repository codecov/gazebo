import { useContext } from 'react'

import { Theme, ThemeContext } from 'shared/ThemeContext'
import { metrics } from 'shared/utils/metrics'
import Icon from 'ui/Icon'

const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext)

  const toggleTheme = () => {
    const newTheme = theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT

    setTheme(newTheme)

    if (newTheme === Theme.DARK) {
      metrics.increment('button_clicked.theme.dark', 1)
    } else if (newTheme === Theme.LIGHT) {
      metrics.increment('button_clicked.theme.light', 1)
    }
  }

  return (
    <button onClick={toggleTheme} style={{ margin: '8px' }}>
      {theme === Theme.LIGHT ? (
        <Icon variant="outline" name="moon" />
      ) : (
        <Icon variant="outline" name="sun" />
      )}
    </button>
  )
}

export default ThemeToggle
