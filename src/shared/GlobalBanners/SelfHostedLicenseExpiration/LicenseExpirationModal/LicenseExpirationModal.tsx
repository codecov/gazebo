import A from 'ui/A'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

interface LicenseExpirationModalArgs {
  isModalOpen: boolean
  isLicenseExpired: boolean
  isSeatsLimitReached: boolean
  setIsModalOpen: (x: boolean) => void
  isLicenseExpiringWithin30Days: boolean
}

const LicenseExpirationModal: React.FC<LicenseExpirationModalArgs> = ({
  isModalOpen,
  setIsModalOpen,
  isSeatsLimitReached,
  isLicenseExpired,
  isLicenseExpiringWithin30Days,
}) => {
  return (
    <Modal
      size="small"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Resolve issue"
      body={
        <div className="flex flex-col gap-6">
          {isSeatsLimitReached && (
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Seat limit reached</span>
              <span className="text-xs">
                All of the seats on the organization&apos;s plan have been used.
                Please reach out to{' '}
                {/* @ts-expect-error - A hasn't been typed yet */}
                <A
                  href={'mailto:support@codecov.io'}
                  hook="codecov-support"
                  showExternalIcon={false}
                >
                  support@codecov.io
                </A>{' '}
                to update.
              </span>
            </div>
          )}
          {(isLicenseExpired || isLicenseExpiringWithin30Days) && (
            <div className="flex flex-col gap-1">
              <span className="font-semibold">License renewal</span>
              <span className="text-xs">
                Your license is about to expire. To avoid any interruption in
                service, please renew your license promptly. Follow{' '}
                {/* @ts-expect-error - A hasn't been typed yet */}
                <A
                  to={{ pageName: 'generateSelfHostedLicense' }}
                  showExternalIcon={false}
                >
                  these steps
                </A>{' '}
                to generate and activate your new license.
              </span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="font-semibold">
              Looking for more control and customization?
            </span>
            <span className="text-xs">
              Consider setting up a{' '}
              {/* @ts-expect-error - A hasn't been typed yet */}
              <A
                to={{ pageName: 'dedicatedEnterpriseCloudGuide' }}
                showExternalIcon={false}
              >
                dedicated namespace
              </A>{' '}
              for enhanced management and security.
            </span>
          </div>
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button
            to={{ pageName: 'generateSelfHostedLicense' }}
            showExternalIcon={false}
          >
            Generate New License
          </Button>
        </div>
      }
    />
  )
}

export default LicenseExpirationModal
