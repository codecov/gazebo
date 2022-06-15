import PropTypes from 'prop-types'

import A from 'ui/A'
import TokenWrapper from 'ui/TokenWrapper'

function ChartCard({ link, title, description, src }) {
  return (
    <div className="flex flex-col gap-2 border-2 border-ds-gray-primary">
      <div className="flex flex-col flex-1 gap-2 p-4">
        <img src={src} alt="graph-chart" className="h-32 md:h-48" />
        <h2 className="font-semibold">{title}</h2>
        <p className="text-ds-gray-quinary flex-1 text-xs">{description}</p>
      </div>
      <hr />
      <div className="flex flex-col gap-2 p-4">
        <TokenWrapper token={link} truncate />
        <A href={link} hook="open-svg-hook" isExternal>
          Open SVG
        </A>
      </div>
    </div>
  )
}

ChartCard.propTypes = {
  src: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}

export default ChartCard
