const statsList = document.getElementById('stats')

function populateList(stats) {
  stats.forEach(stat => {
    const li = document.createElement('li')
    const text = document.createTextNode(`${stat.name} - ${stat.points}`)
    li.appendChild(text)
    statsList.appendChild(li)
  });
}

fetch('/stats')
  .then(res => res.json())
  .then(populateList)