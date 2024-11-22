import MissingDesignatedAdmins from './MissingDesignatedAdmins'
import SelfHostedLicenseExpiration from './SelfHostedLicenseExpiration'

const GlobalBanners = () => {
  return (
    <>
      <MissingDesignatedAdmins />
      <SelfHostedLicenseExpiration />
    </>
  )
}

export default GlobalBanners
