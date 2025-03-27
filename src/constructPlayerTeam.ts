import playerMap from './data/playerMap.json';
import { getTeamStatsData } from './utils/xhrInterceptor';

interface TeamPlayer {
  "player_id": number,
  "round": number,
  "picked": string,
  "position": string,
  "updated": string,
  "order": number,
  "user_team_id": number,
  "position_long": string,
  "position_sort": number
}

export interface Player {
  id: number,
  name: string
  firstName: string
  lastName: string
  team: {
    id: number,
    abbrev: string
    name: string
  },
  position: string
  positionLong: string
}

export const constructUserTeam = async (): Promise<Player[]> => {
  const data = await getTeamStatsData()
  const teamPlayers = data.players as TeamPlayer[];

  return teamPlayers.map((player => {
    // @ts-ignore
    const playerMapPlayer = playerMap[player.player_id.toString()];
    return {
      id: player.player_id,
      name: `${playerMapPlayer.first_name} ${playerMapPlayer.last_name}`,
      firstName: playerMapPlayer.first_name,
      lastName: playerMapPlayer.last_name,
      team: playerMapPlayer.team,
      position: player.position,
      positionLong: player.position_long,
    }
  }))

}