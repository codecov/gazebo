const SummaryRoot: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex flex-wrap justify-start divide-x divide-ds-gray-secondary">
    {children}
  </div>
)

export default SummaryRoot
