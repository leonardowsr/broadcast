import { beforeEach, describe, expect, it } from 'vitest'
import { useMessageFilters } from './useMessageFilters'

describe('useMessageFilters', () => {
  beforeEach(() => {
    useMessageFilters.getState().reset()
  })

  it('resets contact when connection changes', () => {
    useMessageFilters.getState().setContactId('contact-1')
    useMessageFilters.getState().setConnectionId('connection-1')

    expect(useMessageFilters.getState()).toMatchObject({
      connectionId: 'connection-1',
      contactId: '',
    })
  })

  it('resets all message filters', () => {
    useMessageFilters.getState().setStatus('scheduled')
    useMessageFilters.getState().setConnectionId('connection-1')
    useMessageFilters.getState().setContactId('contact-1')

    useMessageFilters.getState().reset()

    expect(useMessageFilters.getState()).toMatchObject({
      status: 'all',
      connectionId: '',
      contactId: '',
    })
  })
})

