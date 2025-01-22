import { createContext, useContext, useState } from 'react'

import { LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER } from 'pages/OwnerPage/OnboardingOrg/constants'
import { ONBOARDING_SOURCE } from 'pages/TermsOfService/constants'
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
    // this should only show for newly onboarded users
    params['source'] === ONBOARDING_SOURCE &&
    localStorage.getItem(LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER) === null
  ) {
    localStorage.setItem(LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER, 'true')
  }
  const localStorageValue = localStorage.getItem(
    LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER
  )

  const [showOnboardingContainer, setShowFunction] = useState<boolean>(
    localStorageValue === 'true' ? true : false
  )

  const setShowOnboardingContainer = (showOnboardingContainer: boolean) => {
    setShowFunction(showOnboardingContainer)
    localStorage.setItem(
      LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER,
      showOnboardingContainer ? 'true' : 'false'
    )
  }

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
