import { useParams } from 'react-router-dom'

import { useIsCurrentUserAnAdmin } from 'services/user'
import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

import useGenerateOrgUploadToken from './useGenerateOrgUploadToken'

interface URLParams {
  owner: string
}

function GenerateOrgUploadToken() {
  const { owner } = useParams<URLParams>()
  const { regenerateToken, isLoading } = useGenerateOrgUploadToken()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row">
        <p>
          Generating a global token allows you to apply the same upload token to
          all of your repos. This can make configuration easier and more
          streamlined.
        </p>
        <div>
          <Button
            variant="primary"
            hook="generate-org-upload-token"
            onClick={() => regenerateToken()}
            disabled={isLoading || !isAdmin}
          >
            Generate
          </Button>
        </div>
      </div>
      {!isAdmin && (
        <div className="flex gap-1">
          <Icon name="informationCircle" size="sm" />
          Only organization admins can regenerate this token.
        </div>
      )}
      <div className="flex gap-1">
        {/* @ts-expect-error error until convert A to ts */}
        <A to={{ pageName: 'orgUploadTokenDoc' }}>Learn more</A>
        <p>how to generate and use the global upload token.</p>
      </div>
    </div>
  )
}

export default GenerateOrgUploadToken
