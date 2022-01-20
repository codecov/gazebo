import { useEffect } from 'react'
import { useParams, useHistory } from 'react-router'

import { NotFoundException } from 'shared/utils'
import { useCommits } from 'services/commits'
import { useRepo } from 'services/repo'

import A from 'ui/A'
import Icon from 'ui/Icon'

import GithubConfigBanner from './GithubConfigBanner'
import InstructionBox from './InstructionBox'
import Token from './Token'

function useRedirect() {
  const { provider, owner, repo } = useParams()
  const history = useHistory()

  return {
    hardRedirect: () => {
      console.log('history push')
      history.push(`/${provider}/${owner}/${repo}`)
      history.go() // Force refresh
    },
  }
}

function useRedirectToVueOverview({
  noAccessOpenSource,
  missingUploadToken,
  hasCommits,
}) {
  const { hardRedirect } = useRedirect()

  useEffect(() => {
    // Let vue handle deactivated repos
    if (hasCommits) {
      console.log('commits')

      hardRedirect()
    }

    // Open source repo not yet set up cannot be set up by a user not part of the org (dont expose token)
    if (noAccessOpenSource) {
      console.log('redirect if not member')

      hardRedirect()
    }

    // Hopefully not hitting this in prod but just incase
    if (missingUploadToken) {
      console.log('no token')

      hardRedirect()
    }
  }, [hardRedirect, noAccessOpenSource, missingUploadToken, hasCommits])
}

function NewRepoTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })

  if (!data?.isCurrentUserPartOfOrg && data?.repository?.private)
    throw new NotFoundException()

  const { data: commits } = useCommits({ provider, owner, repo })

  useRedirectToVueOverview({
    noAccessOpenSource:
      !data?.isCurrentUserPartOfOrg && !data?.repository?.private,
    missingUploadToken: !!data?.repository?.uploadToken,
    hasCommits: Array.isArray(commits) && commits?.length > 0,
  })

  return (
    <div className="mx-auto w-4/5 md:w-3/5 lg:w-2/5 mt-6">
      <h1 className="font-semibold text-3xl my-4">
        Let&apos;s get your repo covered
      </h1>

      <p className="border-b border-ds-gray-tertiary pb-8 text-base">
        Codecov requires an upload in your test suite to get started. Using the{' '}
        <A to={{ pageName: 'uploader' }} target="_blank">
          Codecov Uploader
        </A>
        <span className="inline-block text-gray-500">
          <Icon name="external-link" size="sm" />
        </span>{' '}
        and the repository upload token, upload your coverage reports to
        Codecov. See our{' '}
        <A to={{ pageName: 'docs' }} target="_blank">
          {' '}
          quick start guide{' '}
        </A>
        <span className="inline-block text-gray-500">
          <Icon name="external-link" size="sm" />
        </span>{' '}
        to learn more.
      </p>

      <GithubConfigBanner privateRepo={data?.repository?.private} />

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
          Download the{' '}
          <A to={{ pageName: 'uploader' }} target="_blank">
            uploader{' '}
          </A>
          <span className="inline-block text-gray-500">
            <Icon name="external-link" size="sm" />
          </span>{' '}
          and share your coverage reports with Codecov, by adding the the
          following commands to your CI pipeline:
        </p>

        <InstructionBox />

        <p className="text-base">
          It is highly recommended to{' '}
          <A to={{ pageName: 'integrityCheck' }} target="_blank">
            integrity check the uploader
          </A>
          <span className="inline-block text-gray-500">
            <Icon name="external-link" size="sm" />
          </span>
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
