import { useState } from 'react'
import { useParams, useRouteMatch } from 'react-router-dom'

import config from 'config'

import { useLocationParams } from 'services/navigation'
import { Provider } from 'shared/api/helpers'
import AppInstallModal from 'shared/AppInstallModal'
import { providerToName } from 'shared/utils'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import TopBanner, { saveToLocalStorage } from 'ui/TopBanner'

const APP_INSTALL_BANNER_KEY = 'request-install-banner'

interface URLParams {
  provider: Provider
}

const defaultQueryParams = {
  setupAction: '',
}

const RequestInstallBanner = () => {
  const [showAppInstallModal, setShowAppInstallModal] = useState(false)
  const [isModalDoneClicked, setIsModalDoneClicked] = useState(false)

  const { provider } = useParams<URLParams>()
  const { params } = useLocationParams(defaultQueryParams)
  const ownerMatch = useRouteMatch('/:provider/:owner')

  // @ts-expect-errors useLocationParams needs to be updated to support generic types
  const setupAction = params?.setup_action

  const isGitHubProvider = provider && providerToName(provider) === 'Github'

  const closeModalAndSaveToLocalStorage = () => {
    saveToLocalStorage(APP_INSTALL_BANNER_KEY)
    setShowAppInstallModal(false)
    setIsModalDoneClicked(true)
  }

  // Close the modal before refresh if the user clicks "Done"
  if (isModalDoneClicked) {
    return null
  }

  if (
    !isGitHubProvider ||
    !ownerMatch?.isExact ||
    setupAction !== 'request' ||
    config.IS_SELF_HOSTED
  ) {
    return null
  }

  return (
    <>
      <TopBanner localStorageKey={APP_INSTALL_BANNER_KEY}>
        <TopBanner.Start>
          <p className="items-center gap-1 md:flex">
            <span className="flex items-center gap-1 font-semibold">
              <Icon name="informationCircle" />
              Installation request sent.
            </span>
            Since you&apos;re a member of the requested organization, you need
            the owner to approve and install the app.
          </p>
        </TopBanner.Start>
        <TopBanner.End>
          <Button
            to={undefined}
            hook=""
            disabled={false}
            variant="primary"
            onClick={() => {
              // this has the side effect of hiding the banner
              setShowAppInstallModal(true)
            }}
          >
            Share Request
          </Button>
          <TopBanner.DismissButton>
            <Icon size="sm" variant="solid" name="x" />
          </TopBanner.DismissButton>
        </TopBanner.End>
      </TopBanner>
      <AppInstallModal
        isOpen={showAppInstallModal}
        onClose={() => setShowAppInstallModal(false)}
        onComplete={closeModalAndSaveToLocalStorage}
      />
    </>
  )
}

export default RequestInstallBanner
