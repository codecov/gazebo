import { useFlags } from 'shared/featureFlags'

import OtherCIOrgToken from './OtherCIOrgToken'
import OtherCIRepoToken from './OtherCIRepoToken'

function OtherCI() {
  const { newRepoFlag: showOrgToken } = useFlags({
    newRepoFlag: false,
  })

  return showOrgToken ? <OtherCIOrgToken /> : <OtherCIRepoToken />
}

export default OtherCI
