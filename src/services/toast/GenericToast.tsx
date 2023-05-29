/* eslint-disable react/prop-types */
import type { ToastProps } from './useRenderToast'

const GenericToast: React.FC<ToastProps> = ({ title, content }) => (
  <div className="min-w-[300px] bg-ds-gray-secondary p-4">
    <h3 className="text-base font-semibold">&#127881; {title}</h3>
    <p className="whitespace-pre-line text-sm">{content}</p>
  </div>
)

export default GenericToast
