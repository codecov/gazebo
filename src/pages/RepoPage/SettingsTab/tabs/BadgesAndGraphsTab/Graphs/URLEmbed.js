import PropTypes from 'prop-types'

import GraphCard from 'ui/GraphCard'

import useGraphsDetails from './useGraphsDetails'

function URLEmbed({ graphToken, defaultBranch }) {
  const GraphsDetailsEnum = useGraphsDetails({ defaultBranch, graphToken })

  return (
    <div className="flex flex-col border-2 border-ds-gray-primary p-4 xl:w-4/5 2xl:w-3/5 gap-2">
      <h3 className="font-semibold">Embed via URL</h3>
      <p>Use the URL of the svg to embed a graph of your repository page.</p>
      <div className="grid grid-cols-3 gap-2">
        {Object.keys(GraphsDetailsEnum).map((graph) => {
          return (
            <GraphCard
              key={GraphsDetailsEnum[graph].TITLE}
              title={GraphsDetailsEnum[graph].TITLE}
              description={GraphsDetailsEnum[graph].DESCRIPTION}
              link={GraphsDetailsEnum[graph].LINK}
              src={GraphsDetailsEnum[graph].SRC}
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
