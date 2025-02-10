import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import { ErrorCodeEnum } from 'shared/utils/commit'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Icon from 'ui/Icon'

import { CommitUploadsErrorsQueryOpts } from '../queries/CommitUploadsErrorsQueryOpts'

const CodeSnippet = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-1 text-xs text-ds-primary-red">
    {children}
  </code>
)

const FileNotFoundBanner = () => (
  <Banner variant="warning">
    <BannerHeading>
      <div className="flex items-center gap-2">
        <Icon name="exclamation" className="text-orange-500" />
        <h3 className="font-semibold">JUnit XML file not found</h3>
      </div>
    </BannerHeading>
    <BannerContent>
      <p>
        No result to display due to Test Analytics couldn&apos;t locate a JUnit
        XML file. Please rename the file to include{' '}
        <CodeSnippet>junit</CodeSnippet>, ensure CLI file search is enabled, or
        use the <CodeSnippet>file</CodeSnippet> or{' '}
        <CodeSnippet>search_dir</CodeSnippet> arguments to specify the file(s)
        for upload.
      </p>
    </BannerContent>
  </Banner>
)

const ProcessingTimeoutBanner = () => (
  <Banner variant="warning">
    <BannerHeading>
      <div className="flex items-center gap-2">
        <Icon name="exclamation" className="text-orange-500" />
        <h3 className="font-semibold">Upload timeout</h3>
      </div>
    </BannerHeading>
    <BannerContent>
      Your upload failed due to timeout. Please try it again.
    </BannerContent>
  </Banner>
)

const UnsupportedFormatBanner = () => (
  <Banner variant="warning">
    <BannerHeading>
      <div className="flex items-center gap-2">
        <Icon name="exclamation" className="text-orange-500" />
        <h3 className="font-semibold">Unsupported file format</h3>
      </div>
    </BannerHeading>
    <BannerContent>
      Upload processing failed due to unusable file format. Please review the
      parser error message: <CodeSnippet>No time/duration found</CodeSnippet>{' '}
      <br /> For more help, visit our{' '}
      <A
        to={{
          pageName: 'testAnalyticsTroubleshooting',
        }}
        hook="trouble shooting guide"
        isExternal={true}
      >
        troubleshooting guide
      </A>
      .
    </BannerContent>
  </Banner>
)

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
}

function FailedTestsErrorBanner() {
  const { provider, owner, repo, branch } = useParams<URLParams>()

  const { data: commitUploadsErrors } = useSuspenseQueryV5(
    CommitUploadsErrorsQueryOpts({
      provider,
      owner,
      repo,
      branch: branch ?? '',
    })
  )

  const latestCommitUpload =
    commitUploadsErrors?.uploads[commitUploadsErrors.uploads.length - 1]
  const errorCode = latestCommitUpload?.errors?.edges[0]?.node?.errorCode

  if (!latestCommitUpload || !errorCode) {
    return null
  }

  if (errorCode === ErrorCodeEnum.fileNotFoundInStorage) {
    return <FileNotFoundBanner />
  }

  if (errorCode === ErrorCodeEnum.processingTimeout) {
    return <ProcessingTimeoutBanner />
  }

  if (errorCode === ErrorCodeEnum.unsupportedFileFormat) {
    return <UnsupportedFormatBanner />
  }

  return null
}

export default FailedTestsErrorBanner
