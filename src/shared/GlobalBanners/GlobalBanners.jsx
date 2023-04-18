import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

import MissingDesignatedAdmins from './MissingDesignatedAdmins'
import TrialPeriodEnd from './TrialPeriodEnd'

const GlobalBanners = () => {
  return (
    <>
      <MissingDesignatedAdmins />
      <SilentNetworkErrorWrapper>
        <TrialPeriodEnd />
      </SilentNetworkErrorWrapper>
    </>
  )
}

export default GlobalBanners
