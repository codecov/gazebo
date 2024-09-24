import cs from 'classnames'
import isNull from 'lodash/isNull'
import { createContext, useContext, useState } from 'react'
import { z } from 'zod'

import Button from 'ui/Button'
import Icon from 'ui/Icon'

const LOCAL_STORE_ROOT_KEY = 'dismissed-top-banners' as const

const variants = {
  default: {
    icon: 'exclamationCircle',
    iconColor: '',
    bgColor: 'bg-ds-gray-primary',
  },
  warning: {
    icon: 'exclamationTriangle',
    iconColor: 'text-ds-primary-yellow',
    bgColor: 'bg-orange-100',
  },
  error: {
    icon: 'exclamationCircle',
    iconColor: '',
    bgColor: 'bg-ds-primary-red',
  },
} as const

type Variants = keyof typeof variants

const topBannerContext = z.object({
  variant: z.union([
    z.literal('default'),
    z.literal('warning'),
    z.literal('error'),
  ]),
  localStorageKey: z.string().optional(),
  setHideBanner: z.function().args(z.boolean()).returns(z.void()),
})

type TopBannerContextValue = z.infer<typeof topBannerContext>

const TopBannerContext = createContext<TopBannerContextValue | null>(null)

export const saveToLocalStorage = (localStorageKey: string) => {
  const currentStore = localStorage.getItem(LOCAL_STORE_ROOT_KEY)

  if (isNull(currentStore)) {
    localStorage.setItem(
      LOCAL_STORE_ROOT_KEY,
      JSON.stringify({ [localStorageKey]: 'true' })
    )
  } else {
    localStorage.setItem(
      LOCAL_STORE_ROOT_KEY,
      JSON.stringify({
        ...JSON.parse(currentStore),
        [localStorageKey]: 'true',
      })
    )
  }
}

/*
 * WARNING: not for use outside of this hook, only exported for testing purposes
 */
export const useTopBannerContext = () => {
  const rawContext = useContext(TopBannerContext)

  const context = topBannerContext.safeParse(rawContext)

  if (!context.success) {
    throw new Error(
      'useTopBannerContext has to be used within `<TopBannerContext.Provider>`'
    )
  }

  return context.data
}

const DismissButton: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { localStorageKey, setHideBanner } = useTopBannerContext()

  const handleClick = () => {
    if (localStorageKey) {
      saveToLocalStorage(localStorageKey)
    }
    setHideBanner(true)
  }

  return (
    <>
      {/* @ts-ignore */}
      <Button
        variant="plain"
        hook={`dismiss-${localStorageKey}`}
        onClick={handleClick}
      >
        {children}
      </Button>
    </>
  )
}

const End: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-1 items-center justify-end gap-2">{children}</div>
  )
}

const Start: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex grow-0 items-center gap-1 pb-2 md:pb-0">
      <span>{children}</span>
    </div>
  )
}

const IconSymbol: React.FC = () => {
  const { variant } = useTopBannerContext()
  return (
    <span className={cs('pr-2 md:pr-0', variants[variant].iconColor)}>
      <Icon
        size="md"
        variant="outline"
        name={variants[variant].icon}
        label={variants[variant].icon}
      />
    </span>
  )
}

interface TopBannerProps {
  variant?: Variants
  localStorageKey?: string
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
      if (localStorageKey && store[localStorageKey] === 'true') {
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
      <div>
        <div
          data-testid="top-banner-root"
          className={cs(
            'h-fit w-full px-4 py-2 lg:inline-flex lg:min-h-[38px]',
            variants[variant].bgColor
          )}
        >
          {children}
        </div>
      </div>
    </TopBannerContext.Provider>
  )
}

export const TopBanner = Object.assign(TopBannerRoot, {
  DismissButton,
  Start,
  IconSymbol,
  End,
})
