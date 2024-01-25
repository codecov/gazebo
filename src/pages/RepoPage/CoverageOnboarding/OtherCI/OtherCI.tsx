import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useFlags } from 'shared/featureFlags'

import OtherCIOrgToken from './OtherCIOrgToken'
import OtherCIRepoToken from './OtherCIRepoToken'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function OtherCI() {
  const { newRepoFlag } = useFlags({
    newRepoFlag: false,
  })

  const { provider, owner } = useParams<URLParams>()
  const { data: orgUploadToken } = useOrgUploadToken({ provider, owner })

  const showOrgToken = newRepoFlag && orgUploadToken

  return showOrgToken ? <OtherCIOrgToken /> : <OtherCIRepoToken />
}

export default OtherCI
