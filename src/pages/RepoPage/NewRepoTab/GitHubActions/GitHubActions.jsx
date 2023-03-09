import { useParams } from 'react-router-dom'

import codecovReport from 'assets/repoConfig/codecov-report.svg'
import patchAndProject from 'assets/repoConfig/patch-and-project.svg'
import { useOnboardingTracking } from 'layouts/UserOnboarding/useOnboardingTracking'
import { useRepo } from 'services/repo'
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
        <h2 className="pt-6 text-base font-semibold">
          Step 1: add repository token as{' '}
          <A to={{ pageName: 'githubRepoSecrets' }} isExternal>
            repository secret
          </A>
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
          Step 2: configure{' '}
          <A to={{ pageName: 'codecovGithubApp' }} isExternal>
            Codecov&apos;s GitHub app
          </A>
        </h2>
        <p className="text-base">
          Codecov will use the integration to post statuses and comments
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="pt-6 text-base font-semibold">
          Step 3: add Codecov to your{' '}
          <A to={{ pageName: 'githubRepoActions' }} isExternal>
            GitHub Actions workflow
          </A>
        </h2>
        <div className="flex items-start justify-between overflow-auto whitespace-pre-line rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary py-2 px-4 font-mono">
          <pre>
            - name: Upload coverage reports to Codecov
            <br />
            &nbsp;&nbsp;uses: codecov/codecov-action@v3
          </pre>
          <CopyClipboard string={codecovActionString} />
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="pt-6 text-base font-semibold">
          Step 4: get coverage analysis from Codecov
        </h2>
        <p className="text-base">
          Once you&apos;ve committed your changes in step 2 and ran your CI/CD
          pipeline. In your pull request, you should see two status checks:
        </p>
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

export default GitHubActions
