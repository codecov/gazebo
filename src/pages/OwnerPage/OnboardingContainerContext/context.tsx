import { createContext, useContext, useState } from 'react'

import { ONBOARDING_SOURCE } from 'pages/DefaultOrgSelector/constants'
import { LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER } from 'pages/OwnerPage/OnboardingOrg/constants'
import { useLocationParams } from 'services/navigation'

type OnboardingContainerContextValue = {
  showOnboardingContainer: boolean
  setShowOnboardingContainer: (showOnboardingContainer: boolean) => void
}

export const OnboardingContainerContext =
  createContext<OnboardingContainerContextValue | null>(null)

export const OnboardingContainerProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const {
    params,
  }: {
    params: { source?: string }
  } = useLocationParams()
  if (
    params['source'] === ONBOARDING_SOURCE &&
    localStorage.getItem(LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER) === null
  ) {
    localStorage.setItem(LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER, 'true')
  }
  const localStorageValue = localStorage.getItem(
    LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER
  )

  const [showOnboardingContainer, setShowOnboardingContainer] =
    useState<boolean>(localStorageValue === 'true' ? true : false)

  return (
    <OnboardingContainerContext.Provider
      value={{
        showOnboardingContainer,
        setShowOnboardingContainer,
      }}
    >
      {children}
    </OnboardingContainerContext.Provider>
  )
}

OnboardingContainerContext.displayName = 'OnboardingContainerContext'

export function useOnboardingContainer() {
  const rawContext = useContext(OnboardingContainerContext)

  if (rawContext === null) {
    throw new Error(
      'useOnboardingContainer has to be used within `<OnboardingContainerProvider>`'
    )
  }

  return rawContext
}
