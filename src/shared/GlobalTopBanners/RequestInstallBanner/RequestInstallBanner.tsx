import { useState } from 'react'
import { useParams, useRouteMatch } from 'react-router-dom'

import config from 'config'

import { useLocationParams } from 'services/navigation'
import { providerToName } from 'shared/utils'
import { metrics } from 'shared/utils/metrics'
import Button from 'ui/Button'
import { CopyClipboard } from 'ui/CopyClipboard'
import Icon from 'ui/Icon'
import Modal from 'ui/Modal'
import TopBanner, { saveToLocalStorage } from 'ui/TopBanner'

const APP_INSTALL_BANNER_KEY = 'request-install-banner'
const COPY_APP_INSTALL_STRING =
  "Hello, could you help approve the installation of the Codecov app on GitHub for our organization? Here's the link: https://github.com/apps/codecov/installations/select_target"

interface URLParams {
  provider: string
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
              metrics.increment('request_install.user.shared.request')
            }}
          >
            Share Request
          </Button>
          <TopBanner.DismissButton>
            <Icon size="sm" variant="solid" name="x" />
          </TopBanner.DismissButton>
        </TopBanner.End>
      </TopBanner>
      <Modal
        isOpen={showAppInstallModal}
        onClose={() => setShowAppInstallModal(false)}
        title="Share GitHub app installation"
        body={
          <div className="flex flex-col">
            <span className="mb-4 text-sm">
              Copy the link below and share it with your organization&apos;s
              admin or owner to assist.
            </span>
            <div className="flex items-start gap-4 rounded-md border-2 border-gray-200 bg-gray-100 p-4">
              <div className="grow overflow-auto whitespace-pre-wrap break-words">
                {COPY_APP_INSTALL_STRING}
              </div>
              <CopyClipboard value={COPY_APP_INSTALL_STRING} />
            </div>
          </div>
        }
        footer={
          <div>
            <Button
              to={undefined}
              hook="close-modal"
              disabled={false}
              variant="primary"
              onClick={closeModalAndSaveToLocalStorage}
            >
              Done
            </Button>
          </div>
        }
      />
    </>
  )
}

export default RequestInstallBanner
