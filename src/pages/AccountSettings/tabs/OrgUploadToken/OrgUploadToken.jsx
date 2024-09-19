import { lazy } from 'react'
import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import Banner from 'ui/Banner'

import GenerateOrgUploadToken from './GenerateOrgUploadToken'
import RegenerateOrgUploadToken from './RegenerateOrgUploadToken'

const TokenlessSection = lazy(() => import('./TokenlessSection'))

function OrgUploadToken() {
  const { provider, owner } = useParams()
  const { data: orgUploadToken } = useOrgUploadToken({ provider, owner })
  const { TokenlessSection: TokenlessSectionFlag } = useFlags({
    TokenlessSection: false,
  })

  return (
    <div className="flex flex-col gap-4 lg:w-3/4">
      <div className="flex gap-1">
        <h1 className="text-lg font-semibold">Global upload token</h1>
        <div className="mt-2 text-xs">
          <A to={{ pageName: 'orgUploadTokenDoc' }}>learn more</A>
        </div>
      </div>
      <hr />
      <div className="flex flex-col gap-6">
        {TokenlessSectionFlag ? <TokenlessSection /> : null}
        <Banner>
          <h2 className="font-semibold">Sensitive credential</h2>
          <p>
            This token allows for valid upload of coverage reports to Codecov
            for any repository in your organization. You should treat it as a
            sensitive credential and not commit it to source control.
          </p>
        </Banner>
        <div className="border-2 border-ds-gray-primary p-4">
          {!orgUploadToken ? (
            <GenerateOrgUploadToken />
          ) : (
            <RegenerateOrgUploadToken orgUploadToken={orgUploadToken} />
          )}
        </div>
      </div>
    </div>
  )
}

export default OrgUploadToken
