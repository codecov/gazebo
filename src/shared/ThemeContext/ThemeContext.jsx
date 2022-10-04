import { createContext, useState } from 'react'

export const ThemeContext = createContext()

export function ThemeContextProvider({ children }) {
  const currentTheme = localStorage.getItem('current-theme') || ''
  const [theme, setTheme] = useState(currentTheme)

  const defaultContext = {
    theme,
    setTheme: (theme) => {
      setTheme(theme)
      localStorage.setItem('current-theme', theme)
    },
  }

  return (
    <ThemeContext.Provider value={defaultContext}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  )
}
