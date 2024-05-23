import { cva, VariantProps } from 'cva'
import React from 'react'

import { cn } from 'shared/utils/cn'
import { CopyClipboard } from 'ui/CopyClipboard'

const codeSnippet = cva([
  'rounded-md',
  'border',
  'border-ds-gray-secondary',
  'bg-ds-gray-primary',
  'font-mono',
  'relative',
])
interface CodeSnippetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof codeSnippet> {
  clipboard?: string
  clipboardOnClick?: (value: string) => void
}

export const CodeSnippet = React.forwardRef<HTMLDivElement, CodeSnippetProps>(
  (
    { children, clipboard, clipboardOnClick = () => {}, className, ...props },
    ref
  ) => (
    <div ref={ref} className={cn(codeSnippet({ className }))} {...props}>
      <div className="overflow-auto p-4">
        <pre className="whitespace-pre font-mono">{children}</pre>
      </div>
      {clipboard ? (
        <div className="absolute right-0 top-0 p-4">
          <div className="flex h-5 items-center rounded-md bg-ds-gray-primary">
            <CopyClipboard
              value={clipboard}
              onClick={clipboardOnClick}
              data-testid="clipboard-code-snippet"
            />
          </div>
        </div>
      ) : null}
    </div>
  )
)
CodeSnippet.displayName = 'CodeSnippet'
