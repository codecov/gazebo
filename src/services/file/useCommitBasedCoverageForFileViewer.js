import { useCoverageWithFlags, useFileWithMainCoverage } from '.'

export function useCommitBasedCoverageForFileViewer({
  owner,
  repo,
  provider,
  commit,
  path,
  selectedFlags,
}) {
  const { data } = useFileWithMainCoverage({
    provider,
    owner,
    repo,
    ref: commit,
    path,
  })

  const coverageForAllFlags = selectedFlags.length === 0

  const queryPerFlag = useCoverageWithFlags(
    {
      provider,
      owner,
      repo,
      ref: commit,
      path,
      flags: selectedFlags,
    },
    {
      // only run the query if we are filtering per flag
      enabled: !coverageForAllFlags,
      suspense: false,
    }
  )

  if (coverageForAllFlags) {
    // no flag selected, we can return the default coverage
    return {
      coverage: data?.coverage,
      totals: data?.totals,
      flagNames: data?.flagNames,
      content: data?.content,
      isLoading: false,
    }
  }

  return {
    coverage: queryPerFlag.data?.coverage ?? {},
    totals: queryPerFlag.data?.totals ?? 0,
    isLoading: queryPerFlag.isLoading,
    flagNames: data?.flagNames,
    content: data?.content,
  }
}
