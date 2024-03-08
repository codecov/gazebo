import qs from 'qs'

import A from 'ui/A'

import { displayTypeParameter } from '../constants'

type TreePath = {
  pageName: string
  text: string
  options: {
    tree?: string
    ref?: string
    queryParams?: qs.ParsedQs
  }
}

export function adjustListIfUpDir<RowType>({
  treePaths,
  displayType,
  rawTableRows,
}: {
  treePaths: TreePath[]
  displayType: 'LIST' | 'TREE'
  rawTableRows: RowType[]
}) {
  if (treePaths.length > 1 && displayType === displayTypeParameter.tree) {
    const upDir = treePaths?.at(-2)
    const items = [
      {
        name: (
          /* @ts-expect-error */
          <A to={upDir} variant="upDirectory">
            <div className="pl-1 ">..</div>
          </A>
        ),
        lines: '',
        hits: '',
        misses: '',
        partials: '',
        coverage: '',
      },
      ...rawTableRows,
    ]
    return items
  }

  return rawTableRows
}
