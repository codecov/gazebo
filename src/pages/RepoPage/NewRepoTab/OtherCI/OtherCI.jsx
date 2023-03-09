import { useParams } from 'react-router-dom'

import codecovReport from 'assets/repoConfig/codecov-report.svg'
import patchAndProject from 'assets/repoConfig/patch-and-project.svg'
import { useOnboardingTracking } from 'layouts/UserOnboarding/useOnboardingTracking'
import { useRepo } from 'services/repo'
import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard'

import TerminalInstructions from './TerminalInstructions'

function OtherCI() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  const { copiedCIToken, downloadUploaderClicked } = useOnboardingTracking()

  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="pt-6 text-base font-semibold">
          Step 1: add repository token as a secret to your CI Provider
        </h2>
        <pre className="flex items-center gap-2 overflow-auto rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary py-2 px-4 font-mono">
          CODECOV_TOKEN={data?.repository?.uploadToken}
          <CopyClipboard
            string={data?.repository?.uploadToken}
            onClick={() => copiedCIToken(data?.repository?.uploadToken)}
          />
        </pre>
      </div>
      <div className="flex flex-col">
        <h2 className="pt-6 text-base font-semibold">
          Step 2: add Codecov{' '}
          <A
            to={{ pageName: 'uploader' }}
            data-testid="uploader"
            onClick={() => downloadUploaderClicked()}
            isExternal
          >
            uploader to your CI workflow
          </A>
        </h2>
        <TerminalInstructions />
        <div className="border-l-2 border-ds-gray-secondary">
          <p className="pl-2">
            It is highly recommended to{' '}
            <A to={{ pageName: 'integrityCheck' }} isExternal>
              integrity check the uploader
            </A>
          </p>
          <p className="pl-2">
            This will verify the uploader integrity before uploading to Codecov.
          </p>
        </div>
      </div>
      <div className="flex flex-col">
        <div>
          <h2 className="pt-6 text-base font-semibold">
            Step 3: get coverage analysis from Codecov
          </h2>
          <p className="text-base">
            Once you&apos;ve committed your changes in step 2 and ran your CI/CD
            pipeline. In your pull request, you should see two status checks:
          </p>
        </div>
        <img
          alt="codecov patch and project"
          src={patchAndProject}
          className="my-3 md:px-5"
        />
        <p className="text-base">
          and a comment with coverage report in the pull request:
        </p>
        <img alt="codecov report" src={codecovReport} />
        <p>
          Learn more about the comment report and customizing{' '}
          <A to={{ pageName: 'prCommentLayout' }}>here</A>
        </p>
      </div>
      <div className="mt-6 border-l-2 border-ds-gray-secondary">
        <p className="pl-3 pb-2 text-base">
          &#127881; Once steps are complete, you should see the coverage
          dashboard
        </p>
        <p className="pl-3">
          <span className="font-semibold">How was your setup experience?</span>{' '}
          Let us know in{' '}
          <A to={{ pageName: 'repoConfigFeedback' }} isExternal>
            this issue
          </A>
        </p>
      </div>
    </>
  )
}

export default OtherCI
