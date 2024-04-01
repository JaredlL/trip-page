describe('Trip Page', () => {
  it('Loads trip page', () => {
    cy.clock(new Date('2024-03-30T21:02:00+00:00'), ['Date'])
    cy.intercept('GET', /\/trips\//, { fixture: 'glasgow-dundee.json' })
    cy.visit('#/trip/123')
    cy.contains('div', 'Yutong Coach (SG23 ORX)')
    cy.contains('div', 'Last GPS update from bus: 35 seconds ago (21:01:24)')
  })
})

describe('Cancelled Trip', () => {
  it('Shows that the trip has been cancelled', () => {
    cy.intercept('GET', /\/trips\//, { fixture: 'cancelled-trip.json' })
    cy.visit('#/trip/123')
    cy.get('h1[class="cancelled"]').should('be.visible')
    cy.get('h1[class="finished"]').should('not.be.visible')
  })
})

describe('Completed Trip', () => {
  it('Shows that the trip has completed', () => {
    cy.intercept('GET', /\/trips\//, { fixture: 'completed-trip.json' })
    cy.visit('#/trip/123')
    cy.get('h1[class="finished"]').should('be.visible')
    cy.get('h1[class="cancelled"]').should('not.be.visible')
  })
})

describe('Network erroor', () => {
  it('Shows an error message', () => {
    cy.intercept('GET', /\/trips\//, {
      statusCode: 500,
      body: '500 internal server error'
    })
    cy.visit('#/trip/123')
    cy.get('h1[id="error"]')
      .should('be.visible')
      .and(
        'contain.text',
        'Recieved error response when retrieving bus update: 500 internal server error'
      )
  })
})
