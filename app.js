const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()
app.use(express.static("scripts"))
app.use(express.static("images"))

const STATS_URL = 'https://stats.comunio.de/matchday'
const DETAIL_URL = 'https://stats.comunio.de/xhr/matchDetails.php?mid='
const COMMUNITY_URL = 'https://api.comunio.de/communities/1611599?include=standings'
const USER_URL = 'https://api.comunio.de/users/' // userId/squad
const PLAYER_SEARCH = 'https://stats.comunio.de/search.php'

function filterStats(stats, squad) {
    return (squad.length == 0) ? stats : stats.filter(stat => squad.includes(stat.id))
}

function flatten(stats) {
    return [].concat(...stats)
}

async function getIdForPlayerName(name) {
    // const response = await rp.get(PLAYER_SEARCH + name, {encoding:'latin1'})
    const response = await axios.get(PLAYER_SEARCH, {
        params: {
            name: name
        }
    })
    const $ = cheerio.load(response.data)
    const players = await Promise.all($('.zoomable tr').map(async (i, e) => {
        const row = $(e)
        const id = row.find('td.left.playerName').data('playerid')
        const name = row.find('td.left.playerName > a').text()
        const club = row.find('td.clubPic > a > img').attr('title')
        const points = row.find('td:nth-child(7)').text()
        return {
            id: id,
            name: name,
            club: club,
            points: points
        }
    }).toArray())
    // get rid of table header and footer
    return players.filter(e => e.id).sort((a, b) => b.points - a.points)
}

async function getGameDetails(id) {
    const response = await axios.get(DETAIL_URL + id)
    const stats = response.data.homePlayers.concat(response.data.awayPlayers)
    return stats.map((stat) => ({
        id: stat.playerId,
        name: stat.name,
        rating: stat.rating,
        points: stat.points
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

async function getCommunityStats() {
    const response = await axios.get(COMMUNITY_URL)
    const name = response.data.name
    const stats = response.data.standings.items.map(e => ({
        id: e._embedded.user.id,
        name: e._embedded.user.name,
        total: e.totalPoints,
        last: e.lastPoints,
        live: e.livePoints,
    }))
    return {
        name: name,
        stats: stats
    }
}

async function getSquadForUser(userId) {
    const response = await axios.get(`${USER_URL}${userId}/squad`)
    const squad = response.data.items.map(player => player.id)
    return squad
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/stats.html')
})

app.get('/search', (req, res) => {
    res.sendFile(__dirname + '/search.html')
})

app.get('/api/stats/:userId', async (req, res) => {
    const squad = await getSquadForUser(req.params.userId)
    const stats = await getStatsForSquad(squad)
    res.json(stats)
})

app.get('/api/search/:name', async (req, res) => {
    const user = await getUserByName(req.params.name)
    res.json(user)
})

app.get('/api/player/:name', async (req, res) => {
    const players = await getIdForPlayerName(req.params.name)
    res.json(players)
})

app.get('/api/stats', async (req, res) => {
    const ids = req.query.ids.split(',').map(Number)
    const stats = await getStatsForSquad(ids)
    res.json(stats)
})

app.get('/api/comstats', async (_, res) => {
    const stats = await getCommunityStats()
    res.json(stats)
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started...")
})
