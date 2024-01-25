import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useFlags } from 'shared/featureFlags'

import CircleCIOrgToken from './CircleCIOrgToken'
import CircleCIRepoToken from './CircleCIRepoToken'

interface URLParams {
  provider: string
  owner: string
}

function CircleCI() {
  const { newRepoFlag } = useFlags({
    newRepoFlag: false,
  })

  const { provider, owner } = useParams<URLParams>()
  const { data: orgUploadToken } = useOrgUploadToken({ provider, owner })

  const showOrgToken = newRepoFlag && orgUploadToken

  return showOrgToken ? <CircleCIOrgToken /> : <CircleCIRepoToken />
}

export default CircleCI
