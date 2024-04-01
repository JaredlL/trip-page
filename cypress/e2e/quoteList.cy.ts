// https://on.cypress.io/api

describe('Quote List Test', () => {
  it('visits the app root url', () => {
    cy.visit('/')
    cy.contains('h1', 'Select a trip')
    cy.contains('th', 'Origin')
  })
})
