function FullLayout({ children }) {
  return (
    <div className="flex-grow bg-gray-200">
      <article
        className="container py-10 px-4 sm:px-0"
        data-testid="full-layout"
      >
        {children}
      </article>
    </div>
  )
}

export default FullLayout
