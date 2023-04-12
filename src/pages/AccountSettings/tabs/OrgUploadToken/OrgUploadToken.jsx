import { useParams } from 'react-router-dom'

import { useOwner } from 'services/user'
import A from 'ui/A'
import Banner from 'ui/Banner'

import GenerateOrgUploadToken from './GenerateOrgUploadToken'
import RegenerateOrgUploadToken from './RegenerateOrgUploadToken'

function OrgUploadToken() {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const orgUploadToken = ownerData?.orgUploadToken

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1">
        <h1 className="text-lg font-semibold">
          Global repository upload token
        </h1>
        <div className="mt-2 text-xs">
          <A to={{ pageName: 'orgUploadTokenDoc' }}>learn more</A>
        </div>
      </div>
      <hr />
      <div className="flex flex-col gap-6 xl:w-4/5 2xl:w-3/5">
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
