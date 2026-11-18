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

const safeLocalStorage = (() => {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null
      ? localStorage
      : null
  } catch {
    return null
  }
})()

export const ThemeContextProvider: FC<ThemeContextProviderProps> = ({
  children,
}) => {
  const prefersDark =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false)

  let systemTheme = Theme.LIGHT
  if (prefersDark) {
    systemTheme = Theme.DARK
  }

  const currentTheme = (safeLocalStorage?.getItem('theme') ?? null) as Theme | null
  const [theme, setTheme] = useState<Theme>(currentTheme ?? systemTheme)
  const initialRender = useRef(true)

  if (initialRender.current) {
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove(Theme.LIGHT, Theme.DARK)
      document.body.classList.add(theme)
      safeLocalStorage?.setItem('theme', theme)
    }
    initialRender.current = false
  }

  const handleTheme = useCallback((theme: Theme) => {
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove(Theme.LIGHT, Theme.DARK)
      document.body.classList.add(theme)
      safeLocalStorage?.setItem('theme', theme)
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
