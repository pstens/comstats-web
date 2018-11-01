const statsList = document.getElementById('stats')

function populateList(stats) {
  console.log(stats.length)
  stats.forEach(stat => {
    console.log(stat);
    const li = document.createElement('li')
    const text = document.createTextNode(`${stat.name} - ${stat.points}`)
    li.appendChild(text)
    statsList.appendChild(li)
  });
}

fetch('/stats')
  .then(res => res.json())
  .then(populateList)