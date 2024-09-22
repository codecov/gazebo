interface SummaryFieldProps {
  title?: React.ReactNode
}

const SummaryField: React.FC<React.PropsWithChildren<SummaryFieldProps>> = ({
  children,
  title,
}) => {
  return (
    <div className="flex flex-col justify-between gap-1 px-8 text-xl font-light first:pl-0 last:pr-0">
      {title ? (
        <h4 className="flex gap-2 font-mono text-xs text-ds-gray-quinary">
          {title}
        </h4>
      ) : null}
      {children}
    </div>
  )
}

export default SummaryField
