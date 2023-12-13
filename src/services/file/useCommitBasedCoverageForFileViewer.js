import { useFileWithMainCoverage } from 'services/pathContents'

import { useCoverageWithFilters } from './index'

export function useCommitBasedCoverageForFileViewer({
  owner,
  repo,
  provider,
  commit,
  path,
  selectedFlags,
  selectedComponents,
  opts,
}) {
  const { data } = useFileWithMainCoverage({
    provider,
    owner,
    repo,
    ref: commit,
    path,
    opts,
  })

  const coverageForAllFlags = selectedFlags.length === 0
  const coverageForAllComponents = selectedComponents.length === 0

  const filteredQuery = useCoverageWithFilters({
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
      isCriticalFile: !!data?.isCriticalFile,
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
    isCriticalFile: !!data?.isCriticalFile,
    hashedPath: data?.hashedPath,
  }
}
