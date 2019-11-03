const comstats = document.querySelector('#comstats')
const loadingIndicator = document.querySelector('#loadingIndicator')
const name = document.querySelector('#name')

function displayStatsForCommunity(stats) {
    loadingIndicator.style.display = 'none'
    name.innerText = `${stats.name} ⚽️`
    stats.stats.forEach(stat => {
        const row = document.createElement('li')
        const name = document.createElement('a')
        name.innerText = stat.name
        name.href = `/search?name=${stat.name}`
        row.appendChild(name)
        row.appendChild(document.createTextNode(` • ${stat.total} (${stat.live ? stat.live : stat.last})`))
        comstats.appendChild(row)
    })
}

fetch('/api/comstats')
    .then(res => res.json())
    .then(json => displayStatsForCommunity(json))
