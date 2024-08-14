import Button from 'ui/Button'
import { CodeSnippet } from 'ui/CodeSnippet'
import Modal from 'ui/Modal'

const COPY_APP_INSTALL_STRING =
  "Hello, could you help approve the installation of the Codecov app on GitHub for our organization? Here's the link: https://github.com/apps/codecov/installations/select_target"

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
      title="Share GitHub app installation"
      customHeaderClassname="text-lg"
      body={
        <div className="flex flex-col">
          <span className="mb-4 text-sm">
            Copy the link below and share it with your organization&apos;s admin
            or owner to assist.
          </span>
          <CodeSnippet clipboard={COPY_APP_INSTALL_STRING}>
            <div className="w-[90%] text-wrap">{COPY_APP_INSTALL_STRING}</div>
          </CodeSnippet>
        </div>
      }
      footer={
        <div>
          <Button
            to={undefined}
            hook="close-modal"
            disabled={false}
            variant="primary"
            onClick={onComplete}
          >
            Done
          </Button>
        </div>
      }
    />
  )
}

export default AppInstallModal
