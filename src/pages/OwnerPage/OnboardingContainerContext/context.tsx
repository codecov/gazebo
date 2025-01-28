import { createContext, useContext, useState } from 'react'
import { useParams } from 'react-router-dom'

import { LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER } from 'pages/OwnerPage/OnboardingOrg/constants'
import { ONBOARDING_SOURCE } from 'pages/TermsOfService/constants'
import { useLocationParams } from 'services/navigation'
import { Provider } from 'shared/api/helpers'
import { providerToName } from 'shared/utils/provider'

type OnboardingContainerContextValue = {
  showOnboardingContainer: boolean
  setShowOnboardingContainer: (showOnboardingContainer: boolean) => void
}

export const OnboardingContainerContext =
  createContext<OnboardingContainerContextValue | null>(null)

interface URLParams {
  provider: Provider
}

export const OnboardingContainerProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const {
    params,
  }: {
    params: { source?: string }
  } = useLocationParams()
  const { provider } = useParams<URLParams>()
  const isGh = providerToName(provider) === 'GitHub'
  if (
    // this should only show for newly onboarded GH users
    isGh &&
    params['source'] === ONBOARDING_SOURCE &&
    localStorage.getItem(LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER) === null
  ) {
    localStorage.setItem(LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER, 'true')
  }
  const localStorageValue = localStorage.getItem(
    LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER
  )

  const [showOnboardingContainer, setShowFunction] = useState<boolean>(
    // we are checking isGh here too because the localStorage value could be already set to true
    // if the user previously onboarded on GH previously (edge-case)
    localStorageValue === 'true' && isGh ? true : false
  )

  const setShowOnboardingContainer = (showOnboardingContainer: boolean) => {
    if (isGh) {
      setShowFunction(showOnboardingContainer)
      localStorage.setItem(
        LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER,
        showOnboardingContainer ? 'true' : 'false'
      )
    }
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
