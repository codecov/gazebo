import { totalsLabels, compareLabels, mapLabels } from 'shared/Summary/Labels'
import { usePull } from 'services/pull/hooks'

function useSummaryData(page, params) {
  let labels = []
  switch (page) {
    default:
      const { provider, owner, repo, pullid } = params
      const { data: pull } = usePull({ provider, owner, repo, pullid })

      const compareWithBase = pull?.compareWithBase
      const head = pull.head
      const patch = compareWithBase?.patchTotals?.coverage
      const change = compareWithBase?.changeWithParent
      const base = pull.comparedTo
      const compareCards = {
        headCommit: head?.commitid,
        baseCommit: base?.commitid,
      }

      labels = [
        ...totalsLabels({ head, patch, change }),
        ...compareLabels(compareCards),
      ]
  }

  return mapLabels(labels)
}

export default useSummaryData
