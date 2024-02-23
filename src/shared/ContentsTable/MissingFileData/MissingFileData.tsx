interface MissingFileDataProps {
  isSearching: boolean
  hasFlagsSelected: boolean
  hasComponentsSelected: boolean
}

function MissingFileData({
  isSearching,
  hasFlagsSelected,
  hasComponentsSelected,
}: MissingFileDataProps) {
  if (isSearching) {
    return <p className="flex flex-1 justify-center">No results found</p>
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
      There was a problem getting repo contents from your provider
    </p>
  )
}

export default MissingFileData
