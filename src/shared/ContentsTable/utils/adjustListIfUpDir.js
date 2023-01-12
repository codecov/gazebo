import A from 'ui/A'

export const adjustListIfUpDir = ({ treePaths, displayType, rawTableRows }) => {
  if (treePaths.length > 1 && displayType === 'TREE') {
    const upDir = treePaths?.at(-2)
    const items = [
      {
        name: (
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
