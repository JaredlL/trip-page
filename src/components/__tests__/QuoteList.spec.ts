import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import QuoteList from '../QuoteList.vue'

describe('QuoteList', () => {
  it('renders properly', () => {
    const wrapper = mount(QuoteList, { props: { msg: 'Origin' } })
    expect(wrapper.text()).toContain('Origin')
  })
})
