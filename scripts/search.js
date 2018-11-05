const searchName = document.querySelector('#searchName')
const searchButton = document.querySelector('#searchButton')
const squadStats = document.querySelector('#squadStats')
const points = document.querySelector('#totalPoints')
const loadingIndicator = document.querySelector('#loadingIndicator')


searchButton.addEventListener('click', (event) => {
    squadStats.innerHTML = ''
    points.innerText = ''
    loadingIndicator.style.display = ''
    event.preventDefault()
    scrapeUserId(searchName.value)
})

async function scrapeUserId(userName) {
    fetch(`/search/${userName}`)
        .then(res => res.json())
        .then(json => getSquadForUser(json))
}

async function getSquadForUser(user) {
  fetch(`/stats/${user.id}`)
    .then(res => res.json())
    .then(json => displayStatsForSquad(json))
}

function displayStatsForSquad(squad) {
  loadingIndicator.style.display = 'none'
  const totalPoints = squad.reduce((total, player) => total + player.points, 0)
  points.innerText = `Insgesamt: ${totalPoints}`
  squad.forEach(player => {
    const row = document.createElement('li')
    row.appendChild(document.createTextNode(`${player.name} • ${player.points}`))
    squadStats.appendChild(row)
  })
}