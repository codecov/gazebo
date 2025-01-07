import clickHereToInstall from 'assets/onboarding/click_here_to_install.png'
import Button from 'ui/Button'
import { CodeSnippet } from 'ui/CodeSnippet'
import Modal from 'ui/Modal'

const COPY_APP_INSTALL_STRING =
  "Hello, could you help approve the installation of the Codecov app on GitHub for our organization? Here's the link: https://github.com/apps/codecov/installations/select_target"

interface AppInstallModalProps {
  isOpen: boolean
  isShareRequestVersion?: boolean
  onClose: () => void
  onComplete: () => void
}

function AppInstallModal({
  isOpen,
  isShareRequestVersion = true,
  onClose,
  onComplete,
}: AppInstallModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isShareRequestVersion
          ? 'Share GitHub app installation'
          : 'Install Codecov app'
      }
      customHeaderClassname={isShareRequestVersion ? 'text-2xl' : 'text-lg'}
      body={
        isShareRequestVersion ? (
          <div className="flex flex-col">
            <span className="mb-4 text-sm">
              Copy the link below and share it with your organization&apos;s
              admin or owner to assist.
            </span>
            <CodeSnippet clipboard={COPY_APP_INSTALL_STRING}>
              <div className="w-[90%] text-wrap">{COPY_APP_INSTALL_STRING}</div>
            </CodeSnippet>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="mb-5">
              You need to install Codecov app on your GitHub organization as an
              admin.
            </span>
            <div className="mb-5 bg-ds-gray-primary px-6 ">
              <img
                src={clickHereToInstall}
                alt="click here to install screenshot"
                className="mx-auto h-72 w-[508px] object-cover"
              />
            </div>
            <span className="mb-2 text-sm">
              If you&apos;re
              <b>
                {' '}
                not an admin, share the link below with your organization&apos;s
                owner{' '}
              </b>
              to install the Codecov app:
            </span>
            <CodeSnippet clipboard={COPY_APP_INSTALL_STRING}>
              <div className="w-[90%] text-wrap">{COPY_APP_INSTALL_STRING}</div>
            </CodeSnippet>
          </div>
        )
      }
      footer={
        <div className={isShareRequestVersion ? '' : 'flex justify-end gap-2'}>
          {!isShareRequestVersion && (
            <Button variant="default" onClick={onClose} hook="close-modal">
              Cancel
            </Button>
          )}
          <Button
            to={undefined}
            hook="close-modal"
            disabled={false}
            variant="primary"
            onClick={onComplete}
          >
            {isShareRequestVersion ? 'Done' : 'Install Codecov app via GitHub'}
          </Button>
        </div>
      }
    />
  )
}

export default AppInstallModal
