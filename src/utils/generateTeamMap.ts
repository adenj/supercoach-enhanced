import * as fs from 'node:fs';

const url = 'https://www.supercoach.com.au/2025/api/afl/draft/v1/teams'

type TeamResponse = {
  "id": number,
  "abbrev": string,
  "name": string,
  "competition": {
    "id": number,
    "season": null | number,
    "abbrev": string,
    "name": string,
    "long_name": string
  }
}

type TeamMap = Record<number, TeamResponse>;


const generateTeamMap = (): Promise<TeamMap> => {
  return fetch(url)
    .then(res => res.json())
    .then((data: TeamResponse[]) => {
      const teamMap: TeamMap = {}
      data.forEach(team => {
        teamMap[team.id] = team
      })
      return teamMap
    })
}

(async () => {
  const teamMap = await generateTeamMap()
  fs.writeFileSync('src/data/teamMap.json', JSON.stringify(teamMap, null, 2));
})()