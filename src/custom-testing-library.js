// https://testing-library.com/docs/react-testing-library/setup/#custom-render
import { render } from '@testing-library/react'
import ReactModal from 'react-modal'

function modalRender(ui, options) {
  const baseElement = document.body
  const container = baseElement.appendChild(document.createElement('div'))
  ReactModal.setAppElement(container)
  return render(ui, {
    container,
    baseElement,
    ...options,
  })
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { modalRender as render }
