import PropTypes from 'prop-types'

import ChartCard from 'ui/ChartCard'

import useChartsDetails from './useChartDetails'

function URLEmbed({ graphToken, defaultBranch }) {
  const ChartDetailsEnum = useChartsDetails({ defaultBranch, graphToken })

  return (
    <div className="flex flex-col border-2 border-ds-gray-primary p-4 xl:w-4/5 2xl:w-3/5 gap-2">
      <h3 className="font-semibold">Embed via URL</h3>
      <p>Use the URL of the svg to embed a graph of your repository page.</p>
      <div className="grid grid-cols-3 gap-2">
        <ChartCard
          title={ChartDetailsEnum.SUNBURST.TITLE}
          content={ChartDetailsEnum.SUNBURST.CONTENT}
          svg={ChartDetailsEnum.SUNBURST.SVG}
        />
        <ChartCard
          title={ChartDetailsEnum.ICICLE.TITLE}
          content={ChartDetailsEnum.ICICLE.CONTENT}
          svg={ChartDetailsEnum.SUNBURST.SVG}
        />
        <ChartCard
          title={ChartDetailsEnum.GRID.TITLE}
          content={ChartDetailsEnum.GRID.CONTENT}
          svg={ChartDetailsEnum.SUNBURST.SVG}
        />
      </div>
    </div>
  )
}

URLEmbed.propTypes = {
  graphToken: PropTypes.string.isRequired,
  defaultBranch: PropTypes.string.isRequired,
}

export default URLEmbed
