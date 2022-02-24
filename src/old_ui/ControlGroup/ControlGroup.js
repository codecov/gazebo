import cs from 'classnames'

import controlGroup from './controlGroup.module.css'

// Overrides ui components to render a horiztonal a crontorl group
// Removes borders and rounded corners to create a control group.
export default function ControlGroup({ children, className }) {
  return <div className={cs(className, controlGroup)}>{children}</div>
}
