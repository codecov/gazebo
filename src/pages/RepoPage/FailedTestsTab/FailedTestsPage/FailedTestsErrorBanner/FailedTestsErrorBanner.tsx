import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import { ErrorCodeEnum } from 'shared/utils/commit'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Icon from 'ui/Icon'

import { CommitUploadsQueryOpts } from '../queries/CommitUploadsQueryOpts'

const ERROR_CODES_CONFIG = {
  [ErrorCodeEnum.fileNotFoundInStorage]: {
    title: 'File not in storage',
    description: 'The file was not found in storage',
  },
  [ErrorCodeEnum.reportExpired]: {
    title: 'Report expired',
    description: 'The report has expired',
  },
  [ErrorCodeEnum.reportEmpty]: {
    title: 'Report empty',
    description: 'The report is empty',
  },
  [ErrorCodeEnum.processingTimeout]: {
    title: 'Processing timeout',
    description: 'The processing timed out',
  },
  [ErrorCodeEnum.unsupportedFileFormat]: {
    title: 'Unsupported file format',
    description: 'The file format is unsupported',
  },
  [ErrorCodeEnum.unknownProcessing]: {
    title: 'Unknown processing',
    description: 'The processing is unknown',
  },
  [ErrorCodeEnum.unknownStorage]: {
    title: 'Unknown storage',
    description: 'The storage is unknown',
  },
} as const

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch: string
}

export default function FailedTestsErrorBanner() {
  const { provider, owner, repo, branch } = useParams<URLParams>()

  const { data: commitUploads } = useSuspenseQueryV5(
    CommitUploadsQueryOpts({ provider, owner, repo, branch })
  )

  const latestCommitUpload =
    commitUploads?.uploads[commitUploads.uploads.length - 1]
  const errorCode = latestCommitUpload?.errors?.edges[0]?.node?.errorCode

  if (!errorCode || !latestCommitUpload) {
    return null
  }

  const errorConfig = ERROR_CODES_CONFIG[errorCode]

  return (
    <Banner variant="warning">
      <BannerHeading>
        <div className="flex items-center gap-2">
          <Icon name="exclamation" className="text-orange-500" />
          <h3 className="font-semibold">{errorConfig.title}</h3>
        </div>
      </BannerHeading>
      <BannerContent>{errorConfig.description}</BannerContent>
    </Banner>
  )
}
