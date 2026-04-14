import { describe, it, expect } from 'vitest'

// Funció simulant lògica de negoci del projecte
function calculateFinalPrice(basePrice, tax = 0.21, discount = 0) {
  if (basePrice <= 0) return 0
  const withTax = basePrice * (1 + tax)
  return parseFloat((withTax - discount).toFixed(2))
}

describe('Lògica de Preus (Funcions Específiques)', () => {
  it('calcula el preu amb IVA correctament', () => {
    expect(calculateFinalPrice(100, 0.21)).toBe(121.00)
  })

  it('aplica descomptes correctament', () => {
    expect(calculateFinalPrice(100, 0.21, 10)).toBe(111.00)
  })

  it('retorna 0 si el preu base és negatiu o zero (Early Return)', () => {
    expect(calculateFinalPrice(-50)).toBe(0)
    expect(calculateFinalPrice(0)).toBe(0)
  })
})
