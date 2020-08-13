/// <reference types="cypress" />

describe('App', () => {
  let sw = {}

  beforeEach(() => {
    if (sw.reg && sw.reg.active) {
      console.log('clearing mocks')
      sw.reg.active.postMessage('clear')
    }
    cy.wait(1000)
  })

  // SKIP because we need to remove any remaining SW
  it.skip('shows fetched users', () => {
    cy.visit('/')
    cy.contains('button', 'Load').click()
    cy.get('.user').should('have.length', 3)
  })

  it('shows mock users', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        console.log('onBeforeLoad')

        // three ways of loading a service worker

        // 1:
        // sw.js will come from the site's /
        // capable of (scoped) intercepting application requests
        // probably not what we want
        // win.navigator.serviceWorker.register('sw.js')

        // load OUR service worker into the web app

        // 2:
        // /__root/.../sw.js will be scoped to /__root/...
        // which is NOT what we want
        // we can try relaxing the scope to the top level /
        // by adding header "Service-Worker-Allowed" "/" to the top page
        // win.navigator.serviceWorker.register('/__root/public/sw.js', {scope: '/'})

        // 3:
        // we could proxy /sw.js to SW script in the Cypress built-in routes
        win.navigator.serviceWorker.register('/__sw.js')
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

    cy.wrap(sw)
      .its('reg.active')
      .invoke('postMessage', {
        method: 'get',
        url: 'https://jsonplaceholder.cypress.io/users?_limit=3',
        options: {
          data: [{
            id: 101,
            name: 'Joe 1'
          }, {
            id: 102,
            name: 'Joe 2'
            }],
          delay: 1000
        }
      })
    cy.log('Mocked SW with **2** users, delay **1000**ms')

    cy.contains('button', 'Load').click()
    // only two mock users
    cy.get('.user').should('have.length', 2)
  })

  it('shows fetched users (again)', () => {
    cy.visit('/')
    cy.contains('button', 'Load').click()
    cy.get('.user').should('have.length', 3)
  })
})
