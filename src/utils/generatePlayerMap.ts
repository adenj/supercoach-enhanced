import * as fs from 'node:fs';

const url = 'https://www.supercoach.com.au/2025/api/afl/draft/v1/players-cf'

type PlayerResponse = {
  "id": number,
  "first_name": string,
  "last_name": string,
  "team_id": number,
  "previous_games": number,
  "previous_average": number,
  "previous_total": number,
  "feed_id": string,
  "hs_url": null,
  "injury_suspension_status": null | string,
  "injury_suspension_status_text": null | string,
  "predraft_rank": number,
  "locked": boolean,
  "played_status": {
    "status": string,
    "display": string
  },
  "active": boolean,
  "team": {
    "id": number,
    "abbrev": string,
    "name": string
  }
}

type PlayerMap = Record<number, PlayerResponse>;


const generatePlayerMap = (): Promise<PlayerMap> => {
  return fetch(url)
    .then(res => res.json())
    .then((data: PlayerResponse[]) => {
      const playerMap: PlayerMap = {}
      data.forEach(player => {
        playerMap[player.id] = player
      })
      return playerMap
    })
}

(async () => {
  const playerMap = await generatePlayerMap()
  fs.writeFileSync('src/data/playerMap.json', JSON.stringify(playerMap, null, 2));
})()