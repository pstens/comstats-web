const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()

const url = 'https://stats.comunio.de/matchday'
const detailUrl = 'https://stats.comunio.de/matchdetails.php?mid='
const team = ['Volland']

function filterStats(stats) {
  return (team.length == 0) ? stats : stats.filter(stat => team.includes(stat.name))
}

function flatten(stats) {
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
  return await Promise.all($('.zoomable a').map(async (i, e) => {
    const id = $(e).attr('id').substr(1, 4)
    return await getGameDetails(id)
  }).toArray())
}

app.get('/', async (req, res) => {
  const stats = flatten(await getStats())
  const filtered = filterStats(stats)
  res.status(200).json(filtered.sort((a, b) => b.points - a.points))
})

app.listen(3000, () => {
  console.log("Listening on 3000")
})
