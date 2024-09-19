import { Theme, useThemeContext } from 'shared/ThemeContext'
import { metrics } from 'shared/utils/metrics'
import Icon from 'ui/Icon'

const ThemeToggle = () => {
  const { theme, setTheme } = useThemeContext()

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
    <button
      aria-label="theme toggle"
      onClick={toggleTheme}
      className="m-2"
      data-testid="theme-toggle"
    >
      {theme === Theme.LIGHT ? (
        <Icon variant="outline" name="moon" label="moon" />
      ) : (
        <Icon variant="outline" name="sun" label="sun" />
      )}
    </button>
  )
}

export default ThemeToggle
