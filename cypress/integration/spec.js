/// <reference types="cypress" />

describe('App', () => {
  it('works', () => {
    cy.visit('/')
    cy.contains('h1', 'Load SW')
  })
})
