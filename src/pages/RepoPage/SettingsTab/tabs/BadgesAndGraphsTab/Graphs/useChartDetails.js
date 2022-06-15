import { useParams } from 'react-router-dom'

import { icicle, sunburst, tree } from 'assets/svg/graphs'

const useChartsDetails = ({ defaultBranch, graphToken }) => {
  const { provider, owner, repo } = useParams()

  const repoPath = `https://codecov.io/${provider}/${owner}/${repo}`
  const fullPath = `${repoPath}/branch/${defaultBranch}/graphs`

  const ChartDetailsEnum = Object.freeze({
    SUNBURST: {
      TITLE: 'Sunburst',
      DESCRIPTION:
        'The inner-most circle is the entire project, moving away from the center are folders then, finally, a single file. The size and color of each slice is representing the number of statements and the coverage, respectively.',
      SVG: `${fullPath}/sunburst.svg?token=${graphToken}`,
      SRC: sunburst,
    },
    GRID: {
      TITLE: 'Grid',
      DESCRIPTION:
        'Each block represents a single file in the project. The size and color of each block is represented by the number of statements and the coverage, respectively.',
      SVG: `${fullPath}/tree.svg?token=${graphToken}`,
      SRC: tree,
    },
    ICICLE: {
      TITLE: 'Icicle',
      DESCRIPTION:
        'The top section represents the entire project. Proceeding with folders and finally individual files. The size and color of each slice is representing the number of statements and the coverage, respectively.',
      SVG: `${fullPath}/icicle.svg?token=${graphToken}`,
      SRC: icicle,
    },
  })

  return ChartDetailsEnum
}

export default useChartsDetails
