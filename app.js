const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const path = require('path')
const app = express()
app.use(express.static("scripts"))
app.use(express.static("images"))

const STATS_URL = 'https://stats.comunio.de/matchday'
const DETAIL_URL = 'https://stats.comunio.de/matchdetails.php?mid='
const COMMUNITY_URL = 'https://api.comunio.de/communities/1611599?include=standings'
const USER_URL = 'https://api.comunio.de/users/' // userId/squad

function filterStats(stats, squad) {
  return (squad.length == 0) ? stats : stats.filter(stat => squad.includes(stat.id))
}

function flatten(stats) {
  return [].concat(...stats)
}

async function getGameDetails(id) {
  const response = await axios.get(DETAIL_URL + id)
  const stats = response.data.h.concat(response.data.a)
  return stats.map((stat) => ({ 
    id: stat.i,
    name: stat.n, 
    points: stat.pk 
  }))
}

async function getStatsForSquad(squad) {
  const response = await axios.get(STATS_URL)
  const $ = cheerio.load(response.data)
  const stats = await Promise.all($('.zoomable a').map(async (i, e) => {
    const id = $(e).attr('id').substr(1, 4)
    return await getGameDetails(id)
  }).toArray())
  return filterStats(flatten(stats), squad).sort((a, b) => b.points - a.points)
}

async function getUserByName(name) {
  const response = await axios.get(COMMUNITY_URL)
  const user = response.data.standings.items.find(e => e._embedded.user.name == name)
  return user._embedded.user
}

async function getSquadForUser(userId) {
  const response = await axios.get(`${USER_URL}${userId}/squad`)
  const squad = response.data.items.map(player => player.id)
  return squad
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/search.html')
})

app.get('/stats/:userId', async (req, res) => {
  const squad = await getSquadForUser(req.params.userId)
  const stats = await getStatsForSquad(squad)
  res.json(stats)
})

app.get('/search/:name', async (req, res) => {
  const user = await getUserByName(req.params.name)
  res.json(user)
})

app.listen(3000, () => {
  console.log("Listening on 3000")
})
