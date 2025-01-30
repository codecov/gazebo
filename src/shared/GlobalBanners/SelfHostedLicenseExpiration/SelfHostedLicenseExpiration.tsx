import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { differenceInCalendarDays } from 'date-fns'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import config from 'config'

import { SelfHostedSeatsAndLicenseQueryOpts } from 'services/selfHosted/SelfHostedSeatsAndLicenseQueryOpts'
import { Provider } from 'shared/api/helpers'
import Banner from 'ui/Banner'
import Button from 'ui/Button'

import LicenseExpirationModal from './LicenseExpirationModal'

interface BannerTextProps {
  dateDiff: number
  isLicenseExpired: boolean
  isSeatsLimitReached: boolean
  isLicenseExpiringWithin30Days: boolean
}

const BannerText = ({
  dateDiff,
  isLicenseExpired,
  isSeatsLimitReached,
  isLicenseExpiringWithin30Days,
}: BannerTextProps) => {
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

interface URLParams {
  provider: Provider
}

const SelfHostedLicenseExpiration = () => {
  const { provider } = useParams<URLParams>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data } = useSuspenseQueryV5(
    SelfHostedSeatsAndLicenseQueryOpts({
      provider,
    })
  )

  const licenseExpirationDate = data?.selfHostedLicense?.expirationDate
  const seatsUsed = data?.seatsUsed
  const seatsLimit = data?.seatsLimit

  if (!licenseExpirationDate || !seatsUsed || !seatsLimit) {
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
    (isSeatsLimitReached ||
      isLicenseExpired ||
      isLicenseExpiringWithin30Days) &&
    config.DISPLAY_SELF_HOSTED_EXPIRATION_BANNER

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

// This wrapper is just so we don't make a request to the API if we're not on a
// self-hosted instance, this is because we're useSuspenseQuery is not
// toggle'ble through a `enabled` field like useQuery
function SelfHostedLicenseExpirationWrapper() {
  const isSelfHosted = !!config.IS_SELF_HOSTED
  const isDedicatedNamespace = !!config.IS_DEDICATED_NAMESPACE

  if (!isSelfHosted || !isDedicatedNamespace) {
    return null
  }

  return <SelfHostedLicenseExpiration />
}

export default SelfHostedLicenseExpirationWrapper
