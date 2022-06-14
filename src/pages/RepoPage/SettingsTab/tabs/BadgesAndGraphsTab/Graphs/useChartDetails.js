import { useParams } from 'react-router-dom'

const useChartsDetails = ({ defaultBranch, graphToken }) => {
  const { provider, owner, repo } = useParams()

  const repoPath = `https://codecov.io/${provider}/${owner}/${repo}`
  const fullPath = `${repoPath}/branch/${defaultBranch}/graph`

  const ChartDetailsEnum = Object.freeze({
    SUNBURST: {
      TITLE: 'Sunburst',
      CONTENT:
        'The inner-most circle is the entire project, moving away from the center are folders then, finally, a single file. The size and color of each slice is representing the number of statements and the coverage, respectively.',
      SVG: `${fullPath}/sunburst.svg?token=${graphToken}`,
    },
    GRID: {
      TITLE: 'Grid',
      CONTENT:
        'Each block represents a single file in the project. The size and color of each block is represented by the number of statements and the coverage, respectively.',
      SVG: `${fullPath}/grid.svg?token=${graphToken}`,
    },
    ICICLE: {
      TITLE: 'Icicle',
      CONTENT:
        'The top section represents the entire project. Proceeding with folders and finally individual files. The size and color of each slice is representing the number of statements and the coverage, respectively.',
      SVG: `${fullPath}/icicle.svg?token=${graphToken}`,
    },
  })

  return ChartDetailsEnum
}

export default useChartsDetails
