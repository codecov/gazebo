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
  if (isSearching) {
    return <p className="flex flex-1 justify-center">No results found</p>
  }

  if (isMissingHeadReport) {
    return (
      <p className="flex flex-1 justify-center">
        No coverage report uploaded for this branch head commit
      </p>
    )
  }

  if (hasComponentsSelected && hasFlagsSelected) {
    return (
      <p className="flex flex-1 justify-center">
        No coverage reported for the selected flag/component combination in this
        branch&apos;s head commit
      </p>
    )
  }

  if (hasComponentsSelected) {
    return (
      <p className="flex flex-1 justify-center">
        No coverage report uploaded for the selected components in this
        branch&apos;s head commit
      </p>
    )
  }

  if (hasFlagsSelected) {
    return (
      <p className="flex flex-1 justify-center">
        No coverage report uploaded for the selected flags in this branch&apos;s
        head commit
      </p>
    )
  }

  return (
    <p className="flex flex-1 justify-center">
      There is no coverage on the default branch for this repository. Use the
      Branch Context selector above to choose a different branch.
    </p>
  )
}

export default RepoContentsResult
