import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard/CopyClipboard'
import PropTypes from 'prop-types'
import Spinner from 'ui/Spinner'

function Overview({ token }) {
  if (!token) {
    return <Spinner />
  }

  return (
    <div className="flex w-2/5 flex-col">
      <div className="font-semibold text-3xl my-4">
        Let&apos;s get your repo covered
      </div>
      <div className="border-b border-ds-gray-tertiary pb-8">
        Codecov requires an upload in your test suite to get started. Using the{' '}
        <A to={{ pageName: 'uploader' }}>Codecov Uploader</A> and the repository
        upload token, upload your coverage reports to Codecov. See our{' '}
        <A to={{ pageName: 'docs' }}> quick start guide </A> to learn more.
      </div>
      <div>
        <div className="font-semibold mt-8">Step 1</div>
        <div>
          Run your normal test suite to generate code coverage reports in a
          supported format (often an .xml format).
        </div>
        <div className="font-semibold mt-8">Step 2</div>
        <div>
          If you are uploading reports for a private repository, copy the below
          token and set it in your CI environment variables. You don’t need a
          token if the project is public and the CI you use is one that supports
          tokenless uploads.
        </div>
        <div className="flex flex-row justify-center text-xs mt-4">
          Codecov Token={' '}
          <span className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-4">
            {token}
          </span>
          {token && <CopyClipboard string={token} />}
        </div>
        <div className="font-semibold mt-4">Step 3</div>
        <div>
          Download the <A to={{ pageName: 'uploader' }}>uploader </A> and share
          your coverage reports with Codecov, by adding the the following
          commands to your CI pipeline:
        </div>
        <div>
          It is highly recommended to{' '}
          <A to={{ pageName: 'integrityCheck' }}>
            integrity check the uploader{' '}
          </A>{' '}
          .
        </div>
      </div>
    </div>
  )
}

Overview.propTypes = {
  token: PropTypes.string,
}

export default Overview
