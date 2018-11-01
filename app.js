const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const path = require('path')
const app = express()
app.use(express.static("scripts"))

// const url = 'https://stats.comunio.de/matchday'
const url = 'https://stats.comunio.de/matchday/2019/9'
const detailUrl = 'https://stats.comunio.de/matchdetails.php?mid='
const team = []

function filterStats(stats) {
  return (team.length == 0) ? stats : stats.filter(stat => team.includes(stat.name))
}

function flatten(stats) {
  console.log(stats)
  return [].concat(...stats)
}

async function getGameDetails(id) {
  const response = await axios.get(detailUrl + id)
  const stats = response.data.h.concat(response.data.a)
  return stats.map((stat) => ({ name: stat.n, points: stat.pk }))
}

async function getStats() {
  const response = await axios.get(url)
  const $ = cheerio.load(response.data)
  const stats = await Promise.all($('.zoomable a').map(async (i, e) => {
    const id = $(e).attr('id').substr(1, 4)
    return await getGameDetails(id)
  }).toArray())
  return filterStats(flatten(stats)).sort((a, b) => b.points - a.points)
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/stats.html')
})

app.get('/stats', async (req, res) => {
  res.json(await getStats())
})

app.listen(3000, () => {
  console.log("Listening on 3000")
})

module.exports = {
  getStats
}
