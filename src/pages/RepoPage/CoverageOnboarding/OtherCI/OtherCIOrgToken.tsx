import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'
import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard'

import { InstructionBoxOrgToken } from './TerminalInstructions'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function OtherCIOrgToken() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepo({ provider, owner, repo })
  const orgUploadToken = data?.orgUploadToken

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">
          Step 1: add global token as a secret to your CI Provider
        </h2>
        <pre className="flex items-center gap-2 overflow-auto rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          CODECOV_TOKEN={orgUploadToken}
          <CopyClipboard string={orgUploadToken} />
        </pre>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">
          Step 2: add Codecov{' '}
          <A
            to={{ pageName: 'uploader' }}
            data-testid="uploader"
            isExternal
            hook="uploaderLink"
          >
            uploader to your CI workflow
          </A>
        </h2>
        <InstructionBoxOrgToken />
      </div>
      <div>
        <h3 className="text-base font-semibold">
          Step 3: upload coverage to Codecov via CLI after your tests have run
        </h3>
        <pre className="mt-2 flex items-center gap-2 overflow-auto rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          #upload to Codecov <br />
          #after your tests run <br />
          codecovcli upload-process -t {orgUploadToken} -r {repo}
        </pre>
      </div>
      <div>
        <p>
          Once merged to the default branch, subsequent pull requests will have
          checks and report comment. Additionally, you&apos;ll find your repo
          coverage dashboard here.
        </p>
        <p className="mt-6 border-l-2 border-ds-gray-secondary pl-4">
          <span className="font-semibold">How was your setup experience?</span>{' '}
          Let us know in{' '}
          <A
            to={{ pageName: 'repoConfigFeedback' }}
            isExternal
            hook="repoConfigFeedbackLink"
          >
            this issue
          </A>
        </p>
      </div>
    </div>
  )
}

export default OtherCIOrgToken
