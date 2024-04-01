describe('Trip Page', () => {
  it('Loads trip page', () => {
    cy.clock(new Date('2024-03-30T21:02:00+00:00'), ['Date'])
    cy.intercept('GET', /\/trips\/([^/]+)\/?\?all=true$/, { fixture: 'glasgow-dundee.json' })
    cy.visit('/trip/123')
    cy.contains('div', 'Yutong Coach (SG23 ORX)')
    cy.contains('div', 'Last GPS update from bus: 35 seconds ago (21:01:24)')
  })
})

describe('Trip Page - Cancelled Trip', () => {
  it('Shows that the trip has been cancelled', () => {
    cy.intercept('GET', /\/trips\/([^/]+)\/?\?all=true$/, { fixture: 'cancelled-trip.json' })
    cy.visit('/trip/123')
    cy.get('h1[class="cancelled"]').should('be.visible')
    cy.get('h1[class="finished"]').should('not.be.visible')
  })
})

describe('Trip Page - Completed Trip', () => {
  it('Shows that the trip has completed', () => {
    cy.intercept('GET', /\/trips\/([^/]+)\/?\?all=true$/, { fixture: 'completed-trip.json' })
    cy.visit('/trip/123')
    cy.get('h1[class="finished"]').should('be.visible')
    cy.get('h1[class="cancelled"]').should('not.be.visible')
  })
})
