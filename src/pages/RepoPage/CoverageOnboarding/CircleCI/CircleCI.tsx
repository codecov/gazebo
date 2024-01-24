import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'

import CircleCIOrgToken from './CircleCIOrgToken'
import CircleCIRepoToken from './CircleCIRepoToken'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function CircleCI() {
  const { newRepoFlag } = useFlags({
    newRepoFlag: false,
  })

  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepo({ provider, owner, repo })
  const showOrgToken = newRepoFlag && data?.orgUploadToken

  return showOrgToken ? <CircleCIOrgToken /> : <CircleCIRepoToken />
}

export default CircleCI
