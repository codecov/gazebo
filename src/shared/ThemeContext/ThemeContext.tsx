import React, { createContext, FC, ReactNode, useEffect, useState } from 'react'

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

interface ThemeContextProps {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const defaultThemeContext: ThemeContextProps = {
  theme: Theme.LIGHT,
  setTheme: () => {},
}

export const ThemeContext =
  createContext<ThemeContextProps>(defaultThemeContext)

interface ThemeContextProviderProps {
  children: ReactNode
}

export const ThemeContextProvider: FC<ThemeContextProviderProps> = ({
  children,
}) => {
  const currentTheme = (localStorage.getItem('theme') as Theme) || Theme.LIGHT
  const [theme, setTheme] = useState<Theme>(currentTheme)

  useEffect(() => {
    document.body.classList.remove(Theme.LIGHT, Theme.DARK)
    document.body.classList.add(theme)

    localStorage.setItem('theme', theme)
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
