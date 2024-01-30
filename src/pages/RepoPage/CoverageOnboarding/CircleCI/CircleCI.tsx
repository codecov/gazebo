import { useFlags } from 'shared/featureFlags'

import CircleCIOrgToken from './CircleCIOrgToken'
import CircleCIRepoToken from './CircleCIRepoToken'

function CircleCI() {
  const { newRepoFlag: showOrgToken } = useFlags({
    newRepoFlag: false,
  })

  return showOrgToken ? <CircleCIOrgToken /> : <CircleCIRepoToken />
}

export default CircleCI
