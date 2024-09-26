import A from 'ui/A'
import TokenWrapper from 'ui/TokenWrapper'

interface GraphCardProps {
  description: string
  link: string
  src: string
  title: string
}

function GraphCard({ link, title, description, src }: GraphCardProps) {
  return (
    <div className="flex flex-col gap-2 border-2 border-ds-gray-primary">
      <div className="flex flex-1 flex-col gap-2 p-4">
        <img src={src} alt="graph-chart" className="h-32 md:h-48" />
        <h2 className="font-semibold">{title}</h2>
        <p className="flex-1 text-xs text-ds-gray-quinary">{description}</p>
      </div>
      <hr />
      <div className="flex flex-col gap-2 p-4">
        <TokenWrapper token={link} truncate />
        <A href={link} hook="open-svg-hook" isExternal={true} to={undefined}>
          Open SVG
        </A>
      </div>
    </div>
  )
}

export default GraphCard
