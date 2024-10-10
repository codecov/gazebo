import { setupWorker } from 'msw2'

import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
