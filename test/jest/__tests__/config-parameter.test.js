import ConfigParameter from 'src/components/config/config-parameter.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Framework7 from 'framework7'
import Framework7Vue from 'f7vue'

describe('ConfigParameter', () => {
  const localVue = createLocalVue()
  //localVue.use(AsyncComputed)
  Framework7.use(Framework7Vue)
  const configDescription = {
    name: 'test',
    description: 'Test Parameter',
    type: 'TEXT',
    options: ['choice', 'choice2']
  }
  const wrapper = shallowMount(ConfigParameter, {
    propsData: {
      configDescription,
      value: 'foo'
    }
  })

  it('is a Vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
  it('shows a list of options', () => {
    expect(wrapper.vm.smartSelectParams).toBeDefined()
    expect(wrapper.vm.smartSelectParams.openIn).toBe('popover')
  })
  it('renders the description', () => {
     expect(wrapper.find('.param-description').text()).toBe(configDescription.description)
  })
})
