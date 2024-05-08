import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'

interface RepoContentsProps {
  isSearching: boolean
  isMissingHeadReport: boolean
  hasFlagsSelected: boolean
  hasComponentsSelected: boolean
}

const RepoContentsResult: React.FC<RepoContentsProps> = ({
  isSearching,
  isMissingHeadReport,
  hasFlagsSelected,
  hasComponentsSelected,
}) => {
  let copy: JSX.Element | string = ''

  if (
    !isSearching &&
    !isMissingHeadReport &&
    !hasFlagsSelected &&
    !hasComponentsSelected
  ) {
    return null
  }

  if (isSearching) {
    copy = 'No results found'
  } else if (isMissingHeadReport) {
    copy = 'No coverage report uploaded for this branch head commit'
  } else if (hasComponentsSelected && hasFlagsSelected) {
    copy = `
        No coverage reported for the selected flag/component combination in this
        branch's head commit
      `
  } else if (hasComponentsSelected) {
    copy = `
        No coverage report uploaded for the selected components in this
        branch's head commit
      `
  } else if (hasFlagsSelected) {
    copy = `
        No coverage report uploaded for the selected flags in this branch's
        head commit
      `
  }

  return (
    <Banner>
      <BannerContent>{copy}</BannerContent>
    </Banner>
  )
}

export default RepoContentsResult
