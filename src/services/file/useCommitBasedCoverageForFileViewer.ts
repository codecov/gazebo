import { useFileWithMainCoverage } from 'services/pathContents'

interface UseCommitBasedCoverageForFileViewerArgs {
  provider: string
  owner: string
  repo: string
  commit: string
  path: string
  selectedFlags: Array<string>
  selectedComponents: Array<string>
  opts?: {
    enabled?: boolean
  }
}

export function useCommitBasedCoverageForFileViewer({
  provider,
  owner,
  repo,
  commit,
  path,
  selectedFlags,
  selectedComponents,
  opts,
}: UseCommitBasedCoverageForFileViewerArgs) {
  const { data } = useFileWithMainCoverage({
    provider,
    owner,
    repo,
    ref: commit,
    path,
    opts: {
      enabled: opts?.enabled,
      suspense: true,
    },
  })

  const coverageForAllFlags = selectedFlags.length === 0
  const coverageForAllComponents = selectedComponents.length === 0

  const filteredQuery = useFileWithMainCoverage({
    provider,
    owner,
    repo,
    ref: commit,
    path,
    flags: selectedFlags,
    components: selectedComponents,
    // only run the query if we are filtering per flag and/or component
    opts: {
      enabled:
        (!coverageForAllFlags || !coverageForAllComponents) && opts?.enabled,
      suspense: false,
    },
  })

  if (coverageForAllFlags && coverageForAllComponents) {
    // no flags or components selected, we can return the default coverage
    return {
      coverage: data?.coverage,
      totals: data?.totals,
      flagNames: data?.flagNames,
      content: data?.content,
      isLoading: false,
      hashedPath: data?.hashedPath,
    }
  }

  return {
    coverage: filteredQuery.data?.coverage ?? {},
    totals: filteredQuery.data?.totals ?? 0,
    isLoading: filteredQuery.isLoading,
    flagNames: data?.flagNames,
    componentNames: data?.componentNames,
    content: data?.content,
    hashedPath: data?.hashedPath,
  }
}
