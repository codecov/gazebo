import cs from 'classnames'
import PropTypes from 'prop-types'
import { createContext, useContext, useState } from 'react'

import Button from 'ui/Button'
import Icon from 'ui/Icon'

const LOCAL_STORE_ROOT_KEY = 'dismissed-top-banners' as const

const variants = {
  default: {
    icon: 'exclamationCircle',
    iconColor: '',
    bgColor: 'bg-[#E9EEFC]',
  },
  warning: {
    icon: 'exclamationTriangle',
    iconColor: 'text-ds-primary-yellow',
    bgColor: 'bg-orange-100',
  },
} as const

type Variants = keyof typeof variants

interface TopBannerContextValue {
  variant: Variants
  localStorageKey: string
  setHideBanner: (x: boolean) => void
}

const TopBannerContext = createContext<TopBannerContextValue>({
  variant: 'default',
  localStorageKey: '',
  setHideBanner: () => {},
})

const DismissButton: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { localStorageKey, setHideBanner } = useContext(TopBannerContext)

  return (
    <>
      {/* @ts-ignore */}
      <Button
        variant="plain"
        hook={`dismiss-${localStorageKey}`}
        onClick={() => {
          const currentStore = localStorage.getItem(LOCAL_STORE_ROOT_KEY)

          if (currentStore === null) {
            localStorage.setItem(
              LOCAL_STORE_ROOT_KEY,
              JSON.stringify({ [localStorageKey]: 'true' })
            )
          } else {
            localStorage.setItem(
              LOCAL_STORE_ROOT_KEY,
              JSON.stringify({
                [localStorageKey]: 'true',
                ...JSON.parse(currentStore),
              })
            )
          }

          setHideBanner(true)
        }}
      >
        {children}
      </Button>
    </>
  )
}

const ButtonGroup: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div className="flex flex-1 justify-end gap-2">{children}</div>
}

const Content: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { variant } = useContext(TopBannerContext)
  return (
    <div className="flex grow-0 items-center gap-1 pb-2 md:pb-0">
      <span className={cs('pr- md:pr-0', variants[variant].iconColor)}>
        <Icon name={variants[variant].icon} size="md" variant="outline" />
      </span>
      <span>{children}</span>
    </div>
  )
}

interface TopBannerProps {
  variant?: Variants
  localStorageKey: string
}

const TopBannerRoot: React.FC<React.PropsWithChildren<TopBannerProps>> = ({
  variant = 'default',
  localStorageKey,
  children,
}) => {
  const [hideBanner, setHideBanner] = useState(() => {
    const rawStore = localStorage.getItem(LOCAL_STORE_ROOT_KEY)
    if (rawStore) {
      const store = JSON.parse(rawStore)
      if (store[localStorageKey] === 'true') {
        return true
      }
    }

    return false
  })

  if (hideBanner) {
    return null
  }

  return (
    <TopBannerContext.Provider
      value={{ variant, localStorageKey, setHideBanner }}
    >
      <div
        className={cs(
          'w-full px-2 py-1 lg:inline-flex min-h-[38px]',
          variants[variant].bgColor
        )}
      >
        {children}
      </div>
    </TopBannerContext.Provider>
  )
}

TopBannerRoot.propTypes = {
  variant: PropTypes.oneOf(['default', 'warning']),
  localStorageKey: PropTypes.string.isRequired,
}

export const TopBanner = Object.assign(TopBannerRoot, {
  DismissButton,
  ButtonGroup,
  Content,
})
