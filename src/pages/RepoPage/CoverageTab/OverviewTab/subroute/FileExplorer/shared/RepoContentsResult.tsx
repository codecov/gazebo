import A from 'ui/A'
interface RepoContentsProps {
  isSearching: boolean
  isMissingHeadReport: boolean
  hasFlagsSelected: boolean
  hasComponentsSelected: boolean
  isMissingCoverage: boolean
  isUnknownPath: boolean
}

const RepoContentsResult: React.FC<RepoContentsProps> = ({
  isSearching,
  isMissingHeadReport,
  hasFlagsSelected,
  hasComponentsSelected,
  isMissingCoverage,
  isUnknownPath,
}) => {
  let copy: JSX.Element | string = ''

  if (isSearching) {
    copy = 'No results found'
  } else if (isMissingHeadReport) {
    copy = 'No coverage report uploaded for this branch head commit'
  } else if (isMissingCoverage) {
    copy = 'No coverage data available.'
  } else if (isUnknownPath) {
    copy =
      'Unknown filepath. Please ensure that files/directories exist and are not empty.'
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
  } else {
    return (
      <p className="mt-4">
        Once merged to your default branch, Codecov will show your report
        results on this dashboard.{' '}
        <A
          to={{ pageName: 'configGeneral' }}
          hook={'repo-to-edit-branch'}
          variant="semibold"
          isExternal={false}
          data-testid="config-page"
        >
          edit default branch
        </A>
      </p>
    )
  }

  return <p className="m-4">{copy}</p>
}

export default RepoContentsResult
