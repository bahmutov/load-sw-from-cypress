/// <reference types="cypress" />

describe('App', () => {
  it('works', () => {
    let sw = {}

    cy.visit('/', {
      onBeforeLoad(win) {
        console.log('onBeforeLoad')
        // sw.js will come from the site's /
        // capable of (scoped) intercepting application requests
        win.navigator.serviceWorker.register('sw.js')
        // /__root/.../sw.js will be scoped to /__root/...
        // which is NOT what we want
        // we can try relaxing the scope to the top level /
        // by adding header "Service-Worker-Allowed" "/" to the top page
        // win.navigator.serviceWorker.register('/__root/public/sw.js', {scope: '/'})
        // we could proxy /sw.js to SW script in the Cypress built-in routes
          .then(reg => {
            sw.reg = reg
            console.log('SW registered! scope %s', reg.scope, reg)
            console.log('this page has SW controller', navigator.serviceWorker.controller)
          })
          .catch(err => console.log('Boo!', err));

        // TODO prevent any other SW from registering on the page?
        // https://glebbahmutov.com/blog/cypress-tips-and-tricks/#disable-serviceworker
      }
    })

    cy.contains('h1', 'Load SW')

    cy.wrap(sw).should('have.property', 'reg')
      .its('active')
      // .invoke('postMessage', 'hi there')
      .invoke('postMessage', {
        method: 'get',
        url: 'https://jsonplaceholder.cypress.io/users?_limit=3',
        options: {
          data: []
        }
    })

    cy.contains('button', 'Load').click()
  })
})
