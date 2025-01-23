import clickHereToInstall from 'assets/onboarding/org_list_install_app.png'
import { eventTracker } from 'services/events/events'
import Button from 'ui/Button'
import { CodeSnippet } from 'ui/CodeSnippet'
import Modal from 'ui/Modal'

const COPY_APP_INSTALL_STRING =
  "Hello, could you help approve the installation of the Codecov app on GitHub for our organization? Here's the Codecov App Installation link: https://github.com/apps/codecov/installations/select_target"

interface AppInstallModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

function AppInstallModal({
  isOpen,
  onClose,
  onComplete,
}: AppInstallModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Install Codecov app"
      customHeaderClassname="text-2xl"
      body={
        <div className="flex flex-col">
          <span className="mb-5">
            You need to install Codecov app on your GitHub organization as an
            admin.
          </span>
          <div className="mb-5 bg-ds-gray-primary px-6">
            <img
              src={clickHereToInstall}
              alt="click here to install screenshot"
              className="mx-auto h-72 w-[508px] object-contain"
            />
          </div>
          <span className="mb-2 text-sm">
            If you&apos;re
            <span className="font-bold">
              {' '}
              not an admin, share the link below with your organization&apos;s
              owner{' '}
            </span>
            to install the Codecov app:
          </span>
          <CodeSnippet clipboard={COPY_APP_INSTALL_STRING}>
            <div className="w-[90%] text-wrap">{COPY_APP_INSTALL_STRING}</div>
          </CodeSnippet>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="default" onClick={onClose} hook="close-modal">
            Cancel
          </Button>
          <Button
            to={{ pageName: 'codecovAppInstallation' }}
            onClick={() => {
              onComplete()
              eventTracker().track({
                type: 'Button Clicked',
                properties: {
                  buttonName: 'Install GitHub App',
                  buttonLocation: 'Install modal',
                },
              })
            }}
            hook="modal-gh-install-link"
            disabled={false}
            variant="primary"
          >
            Install Codecov app via GitHub
          </Button>
        </div>
      }
    />
  )
}

export default AppInstallModal
