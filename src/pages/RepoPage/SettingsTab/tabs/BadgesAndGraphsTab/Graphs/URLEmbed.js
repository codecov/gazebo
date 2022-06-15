import PropTypes from 'prop-types'

import ChartCard from 'ui/GraphCard'

import useChartsDetails from './useChartDetails'

function URLEmbed({ graphToken, defaultBranch }) {
  const ChartDetailsEnum = useChartsDetails({ defaultBranch, graphToken })

  return (
    <div className="flex flex-col border-2 border-ds-gray-primary p-4 xl:w-4/5 2xl:w-3/5 gap-2">
      <h3 className="font-semibold">Embed via URL</h3>
      <p>Use the URL of the svg to embed a graph of your repository page.</p>
      <div className="grid grid-cols-3 gap-2">
        {Object.keys(ChartDetailsEnum).map((chart) => {
          return (
            <ChartCard
              key={ChartDetailsEnum[chart].TITLE}
              title={ChartDetailsEnum[chart].TITLE}
              description={ChartDetailsEnum[chart].DESCRIPTION}
              svg={ChartDetailsEnum[chart].SVG}
              src={ChartDetailsEnum[chart].SRC}
            />
          )
        })}
      </div>
    </div>
  )
}

URLEmbed.propTypes = {
  graphToken: PropTypes.string.isRequired,
  defaultBranch: PropTypes.string,
}

export default URLEmbed
