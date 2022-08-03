import { cleanupBaremetrics } from './utils'

function addBaremetricsScript() {
  const script = document.createElement('script')
  script.src =
    'https://baremetrics-barecancel.baremetrics.com/js/application.js'
  script.dataset.testid = 'baremetrics-script'
  document.body.appendChild(script)
  window.barecancel = { created: true }
}

describe('cleanupBaremetrics', () => {
  function setup() {
    addBaremetricsScript()
    cleanupBaremetrics()
  }

  beforeEach(() => {
    setup()
  })

  it('cleans up baremetrics script', () => {
    expect(
      document.querySelector('[data-testid="baremetrics-script"]')
    ).not.toBeInTheDocument()
    expect(
      document.querySelector(
        '[href="https://baremetrics-barecancel.baremetrics.com/css/barecancel.css"]'
      )
    ).not.toBeInTheDocument()
  })
})
