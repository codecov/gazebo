function CodeRendererInfoRow({ children }) {
  return (
    <div className="flex gap-2 bg-ds-gray-primary px-4 py-1 border-t border-r border-l border-solid border-ds-gray-tertiary text-xs text-ds-gray-quinary">
      {children}
    </div>
  )
}

export default CodeRendererInfoRow
