import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TodoApp from '../components/TodoApp.vue'  // ファイルパスと拡張子を確認

describe('TodoApp', () => {
  it('mounts without errors', () => {
    const wrapper = mount(TodoApp)
    expect(wrapper.exists()).toBe(true)
  })
})
