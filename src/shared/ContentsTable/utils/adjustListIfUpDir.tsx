import qs from 'qs'
import { ReactNode } from 'react'

import A from 'ui/A'

import { displayTypeParameter } from '../constants'

type TreePath = {
  pageName: string
  text: string
  options?: {
    tree?: string
    ref?: string
    queryParams?: qs.ParsedQs
  }
}

export type Row = {
  name: ReactNode
  lines: string
  hits: string
  misses: string
  partials: string
  coverage: ReactNode
}

export function adjustListIfUpDir({
  treePaths,
  displayType,
  rawTableRows,
}: {
  treePaths: TreePath[]
  displayType: 'LIST' | 'TREE'
  rawTableRows: Row[]
}) {
  if (
    Array.isArray(treePaths) &&
    treePaths.length > 1 &&
    displayType === displayTypeParameter.tree
  ) {
    const upDir = treePaths.at(-2)
    const items = [
      {
        name: (
          /* @ts-expect-error - A hasn't been typed yet */
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
