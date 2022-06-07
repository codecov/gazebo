import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'
import { NotFoundException } from 'shared/utils'
import A from 'ui/A'

import GithubConfig from './GithubConfig'
import { useRedirectToVueOverview } from './hooks'
import TerminalInstructions from './TerminalInstructions'
import Token from './Token'

function NewRepoTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })

  if (!data?.isCurrentUserPartOfOrg && data?.repository?.private)
    throw new NotFoundException()

  useRedirectToVueOverview({
    noAccessOpenSource:
      !data?.isCurrentUserPartOfOrg && !data?.repository?.private,
    missingUploadToken: !data?.repository?.uploadToken,
  })

  return (
    <div className="mx-auto w-4/5 md:w-3/5 lg:w-2/5 mt-6">
      <h1 className="font-semibold text-3xl my-4">
        Let&apos;s get your repo covered
      </h1>

      <p className="border-b border-ds-gray-tertiary pb-8 text-base">
        Codecov requires an upload in your test suite to get started. Using the{' '}
        <A to={{ pageName: 'uploader' }}>Codecov Uploader</A> and the repository
        upload token, upload your coverage reports to Codecov. See our{' '}
        <A to={{ pageName: 'docs' }}> quick start guide </A>
        and{' '}
        <A href={'https://docs.codecov.com/docs/codecov-tutorial'} isExternal>
          Codecov Tutorial
        </A>{' '}
        to learn more.
      </p>

      <GithubConfig privateRepo={data?.repository?.private} />

      <>
        <h2 className="font-semibold mt-8 text-base">Step 1</h2>
        <p className="text-base">
          Run your normal test suite to generate code coverage reports in a
          supported format (often an .xml format).
        </p>

        <h2 className="font-semibold mt-8 text-base">Step 2</h2>
        <Token
          privateRepo={data?.repository?.privateRepo}
          uploadToken={data?.repository?.uploadToken}
          isCurrentUserPartOfOrg={data?.isCurrentUserPartOfOrg}
        />

        <h2 className="font-semibold mt-8 text-base">Step 3</h2>
        <p className="text-base">
          Download the <A to={{ pageName: 'uploader' }}>uploader </A>
          and share your coverage reports with Codecov, by adding the the
          following commands to your CI pipeline:
        </p>

        <TerminalInstructions />

        <p className="text-base">
          It is highly recommended to{' '}
          <A to={{ pageName: 'integrityCheck' }}>
            integrity check the uploader
          </A>
          .
        </p>
        <h2 className="font-semibold mt-8 text-base">
          🎉 &nbsp;Confirming completion
        </h2>
        <p className="text-base">
          These steps should be added to the CI configuration. Codecov jobs
          occur after the test runner ran and output coverage report. Once
          uploader runs it will return a link where you can view your reports on
          Codecov.
        </p>
      </>
    </div>
  )
}

export default NewRepoTab
