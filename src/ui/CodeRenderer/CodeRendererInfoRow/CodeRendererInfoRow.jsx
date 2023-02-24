function CodeRendererInfoRow({ children }) {
  return (
    <div className="flex gap-2 border-x border-t border-solid border-ds-gray-tertiary bg-ds-gray-primary px-4 py-1 text-xs text-ds-gray-quinary">
      {children}
    </div>
  )
}

export default CodeRendererInfoRow
