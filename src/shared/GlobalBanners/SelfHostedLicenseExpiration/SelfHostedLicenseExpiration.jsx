import { differenceInCalendarDays } from 'date-fns'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import config from 'config'

import { useSelfHostedSeatsAndLicense } from 'services/selfHosted/useSelfHostedSeatsAndLicense'
import Banner from 'ui/Banner'
import Button from 'ui/Button'

import LicenseExpirationModal from './LicenseExpirationModal'

const BannerText = ({
  dateDiff,
  isLicenseExpired,
  isSeatsLimitReached,
  isLicenseExpiringWithin30Days,
}) => {
  return (
    <p className="flex flex-row gap-2 font-semibold">
      {isLicenseExpired && isSeatsLimitReached ? (
        <>
          <span>👋</span>Your organization&apos;s license has expired and seat
          count has been reached.
        </>
      ) : isSeatsLimitReached ? (
        <>
          <span>👋</span>Your organization&apos;s seat count has been reached.
        </>
      ) : isLicenseExpiringWithin30Days ? (
        <>
          <span>👋</span>Your organization&apos;s license ends in {dateDiff}{' '}
          days.
        </>
      ) : (
        <>
          <span>👋</span>Your organization&apos;s license has expired.
        </>
      )}
    </p>
  )
}

BannerText.propTypes = {
  dateDiff: PropTypes.number.isRequired,
  isLicenseExpired: PropTypes.bool.isRequired,
  isSeatsLimitReached: PropTypes.bool.isRequired,
  isLicenseExpiringWithin30Days: PropTypes.bool.isRequired,
}

const SelfHostedLicenseExpiration = () => {
  const { provider } = useParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isSelfHosted = !!config.IS_SELF_HOSTED
  const isDedicatedNamespace = !!config.IS_DEDICATED_NAMESPACE
  const { data } = useSelfHostedSeatsAndLicense({
    provider,
    opts: { enabled: !!provider && isSelfHosted && isDedicatedNamespace },
  })

  const licenseExpirationDate = data?.selfHostedLicense?.expirationDate
  const seatsUsed = data?.seatsUsed
  const seatsLimit = data?.seatsLimit

  if (
    !isSelfHosted ||
    !isDedicatedNamespace ||
    !licenseExpirationDate ||
    !seatsUsed ||
    !seatsLimit
  ) {
    return null
  }

  const dateDiff = differenceInCalendarDays(
    new Date(licenseExpirationDate),
    new Date()
  )
  const isSeatsLimitReached = seatsUsed === seatsLimit
  const isLicenseExpired = dateDiff < 0
  const isLicenseExpiringWithin30Days = dateDiff < 31 && dateDiff >= 0

  const shouldDisplayBanner =
    isSeatsLimitReached || isLicenseExpired || isLicenseExpiringWithin30Days

  if (!shouldDisplayBanner) {
    return null
  }

  return (
    <>
      <LicenseExpirationModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isLicenseExpired={isLicenseExpired}
        isSeatsLimitReached={isSeatsLimitReached}
        isLicenseExpiringWithin30Days={isLicenseExpiringWithin30Days}
      />
      <Banner variant="plain">
        <div className="flex flex-row items-center justify-between">
          <BannerText
            dateDiff={dateDiff}
            isLicenseExpired={isLicenseExpired}
            isSeatsLimitReached={isSeatsLimitReached}
            isLicenseExpiringWithin30Days={isLicenseExpiringWithin30Days}
          />
          <Button
            variant="primary"
            hook="license-expiration"
            onClick={() => setIsModalOpen(true)}
          >
            Resolve issue
          </Button>
        </div>
      </Banner>
    </>
  )
}

export default SelfHostedLicenseExpiration
