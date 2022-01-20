import { useEffect } from 'react'
import { useParams } from 'react-router'
import PropTypes from 'prop-types'

import { useCommits } from 'services/commits'
import { useRepo } from 'services/repo'

import A from 'ui/A'
import Icon from 'ui/Icon'
import CopyClipboard from 'ui/CopyClipboard'

import GithubConfigBanner from './githubConfigBanner'
import InstructionBox from './instructionBox/InstructionBox'

function useRedirectUsers() {
  const { provider, owner, repo } = useParams()
  const { data: commits } = useCommits({ provider, owner, repo })

  useEffect(() => {
    if (commits?.length) window.location = `/${provider}/${owner}/${repo}`
  }, [provider, owner, repo, commits])
}

const PrivateRepoScope = ({ token }) => (
  <>
    <p className="text-base">
      Copy the below token and set it in your CI environment variables.
    </p>
    <p className="flex flex-row justify-center text-s mt-4">
      Codecov Token={' '}
      <span className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto xl:h-5">
        {token}
      </span>
      <CopyClipboard string={token} />
    </p>
  </>
)

PrivateRepoScope.propTypes = {
  token: PropTypes.string,
}

const PublicRepoScope = ({ isCurrentUserPartOfOrg, token }) => {
  return isCurrentUserPartOfOrg ? (
    <>
      <p className="text-base">
        If the public project is on TravisCI, CircleCI, AppVeyor, Azure
        Pipelines, or GitHub Actions an upload token is not required. Otherwise,
        you&apos;ll need to set the token below and set it in your CI
        environment variables.
      </p>
      <p className="flex flex-row justify-center text-s mt-4">
        Codecov Token={' '}
        <span className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto xl:h-5">
          {token}
        </span>
        <CopyClipboard string={token} />
      </p>
    </>
  ) : (
    <p className="text-base">
      If the public project on TravisCI, CircleCI, AppVeyor, Azure Pipelines, or
      GitHub Actions an upload token is not required. Otherwise, you&apos;ll
      need a token to from the authorized member or admin.
    </p>
  )
}

PublicRepoScope.propTypes = {
  isCurrentUserPartOfOrg: PropTypes.bool,
  token: PropTypes.string,
}

function NewRepoTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })

  useRedirectUsers()

  if (!data || !data?.repository?.uploadToken) {
    return null
  }

  const { uploadToken, private: privateRepo } = data?.repository

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

      <GithubConfigBanner privateRepo={privateRepo} />

      <>
        <h2 className="font-semibold mt-8 text-base">Step 1</h2>
        <p className="text-base">
          Run your normal test suite to generate code coverage reports in a
          supported format (often an .xml format).
        </p>

        <h2 className="font-semibold mt-8 text-base">Step 2</h2>
        <div>
          {privateRepo ? (
            <PrivateRepoScope token={uploadToken} />
          ) : (
            <PublicRepoScope
              isCurrentUserPartOfOrg={data?.isCurrentUserPartOfOrg}
              token={uploadToken}
            />
          )}
        </div>

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
