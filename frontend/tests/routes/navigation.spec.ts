import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('Tests de Rutes', async () => {
  await setup({
    // Configuració del test setup si calgués
  })

  it('la portada (/) carrega correctament', async () => {
    const html = await $fetch('/')
    expect(html).toContain('FlowPass')
  })

  it('la pàgina d\'admin bloqueja l\'accés sense token', async () => {
    const html = await $fetch('/admin')
    expect(html).toContain('Admin')
    expect(html).toContain('Introdueix la clau')
  })
})
