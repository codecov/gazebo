// Summary on Commit Detail and Compare using a config object instead of composition
// The newer preferred way is to import the Summary root and field yourself per implementation.
//
// TODO: Update Commit Detail and Compare pages to use the composable summary components instead.

interface Fields {
  name: string
  title?: React.ReactNode
  value: React.ReactNode
}

interface SummaryProps {
  fields?: Fields[]
}

const Summary: React.FC<SummaryProps> = ({ fields }) => {
  return fields && fields.length > 0 ? (
    <div className="flex flex-wrap items-start justify-start gap-8 md:flex-nowrap">
      {fields.map(({ name, title, value }) => {
        // Below changes is the original SummaryField markup
        return value ? (
          <div key={name} className="flex flex-col justify-center gap-1">
            {title ? (
              <h4 className="flex gap-2 font-mono text-xs text-ds-gray-quinary">
                {title}
              </h4>
            ) : null}
            {value ? <div className="text-xl font-light">{value}</div> : null}
          </div>
        ) : null
      })}
    </div>
  ) : null
}

export default Summary
