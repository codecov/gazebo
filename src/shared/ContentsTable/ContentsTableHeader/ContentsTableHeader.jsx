function ContentsTableHeader({ children }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-8 grid-flow-row gap-4">
      {children}
    </div>
  )
}

export default ContentsTableHeader
