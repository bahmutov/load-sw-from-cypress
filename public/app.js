// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('sw.js')
//     .then(reg => {
//       console.log('SW registered! scope %s', reg.scope, reg)
//       console.log('this page has SW controller', navigator.serviceWorker.controller)
//     })
//     .catch(err => console.log('Boo!', err));
// }

document.getElementById('load').addEventListener('click', () => {
  console.log('load')
  fetch('https://jsonplaceholder.cypress.io/users?_limit=3')
    .then(r => r.json())
    .then(users => {
      console.table(users)
      const list = users
        .map(user => `<li class="user">${user.id} - ${user.name}</li>`)
        .join('\n')
      document.getElementById('results').innerHTML = `
        <ul>
          ${list}
        </ul>
      `
    })
})
