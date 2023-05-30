import { useParams } from 'react-router-dom'

import patchAndProject from 'assets/repoConfig/patch-and-project.svg'
import { useRepo } from 'services/repo'
import { useOnboardingTracking } from 'services/user'
import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard'

const codecovActionString =
  '- name: Upload coverage reports to Codecov\n  uses: codecov/codecov-action@v3'

function GitHubActions() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  const { copiedCIToken } = useOnboardingTracking()

  return (
    <>
      <div className="flex flex-col gap-4">
        <span>
          <h2 className="pt-6 text-base font-semibold">
            Step 1: add repository token as{' '}
            <A to={{ pageName: 'githubRepoSecrets' }} isExternal>
              repository secret
            </A>
          </h2>
          <p className="text-base">
            Admin required to access repo settings {'>'} secrets and variable
            {' >'} actions
          </p>
        </span>
        <pre className="flex items-center gap-2 overflow-auto rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          CODECOV_TOKEN={data?.repository?.uploadToken}
          <CopyClipboard
            string={data?.repository?.uploadToken}
            onClick={() => copiedCIToken(data?.repository?.uploadToken)}
          />
        </pre>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="pt-6 text-base font-semibold">
          Step 2: add Codecov to your{' '}
          <A
            to={{
              pageName: 'githubRepoActions',
            }}
            isExternal
          />
        </h2>
        <div className="flex items-start justify-between overflow-auto whitespace-pre-line rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          <pre>
            - name: Upload coverage reports to Codecov
            <br />
            &nbsp;&nbsp;uses: codecov/codecov-action@v3
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;env: CODECOV_TOKEN: $
            {'{{ secrets.CODECOV_TOKEN }}'}
          </pre>
          <CopyClipboard string={codecovActionString} />
        </div>
      </div>
      <>
        <h2 className="pt-6 text-base font-semibold">
          Step 3: get coverage analysis from Codecov
        </h2>
        <p>
          After you committed your changes and ran the repo&apos;s CI/CD
          pipeline. In your pull request, you should see two status checks and
          PR comment.
        </p>
        <img
          alt="codecov patch and project"
          src={patchAndProject}
          className="my-3 md:px-5"
          loading="lazy"
        />
        <p>
          Once merged to the default branch, subsequent pull requests will have
          checks and report comment. Additionally, you&apos;ll find your repo
          coverage dashboard here.
        </p>
      </>
      <p className="mt-6 border-l-2 border-ds-gray-secondary pl-4">
        <span className="font-semibold">How was your setup experience?</span>{' '}
        Let us know in{' '}
        <A to={{ pageName: 'repoConfigFeedback' }} isExternal>
          this issue
        </A>
      </p>
    </>
  )
}

export default GitHubActions
