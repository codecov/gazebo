import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

interface ThemeContextProps {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined
)

interface ThemeContextProviderProps {
  children: ReactNode
}

export const ThemeContextProvider: FC<ThemeContextProviderProps> = ({
  children,
}) => {
  const currentTheme = (localStorage.getItem('theme') as Theme) || Theme.LIGHT
  const [theme, setTheme] = useState<Theme>(currentTheme)
  const initialRender = useRef(true)

  if (initialRender.current) {
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove(Theme.LIGHT, Theme.DARK)
      document.body.classList.add(theme)
      localStorage.setItem('theme', theme)
    }
    initialRender.current = false
  }

  const handleTheme = useCallback((theme: Theme) => {
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove(Theme.LIGHT, Theme.DARK)
      document.body.classList.add(theme)
      localStorage.setItem('theme', theme)
      setTheme(theme)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContext = (): ThemeContextProps => {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error(
      'useThemeContext must be used within a ThemeContextProvider'
    )
  }

  return context
}
