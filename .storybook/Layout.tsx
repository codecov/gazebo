import React from 'react'
import '../src/globals.css'

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div className="text-sm text-ds-primary-base">{children}</div>
}

export default Layout
