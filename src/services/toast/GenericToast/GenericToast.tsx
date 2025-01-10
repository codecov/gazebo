import type { ToastProps } from '../renderToast'

export const GenericToast: React.FC<ToastProps> = ({ title, content }) => (
  <div className="min-w-[300px] bg-ds-gray-secondary p-4">
    <h3 className="text-base font-semibold">&#127881; {title}</h3>
    <p className="whitespace-pre-line text-sm">{content}</p>
  </div>
)
