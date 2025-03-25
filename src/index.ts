import fs from 'node:fs'
import { JSDOM } from 'jsdom'

const baseUrl = "https://www.footywire.com"
const injuryListPath = "/afl/footy/injury_list"

const fetchInjuryHtml = async () => {
  const response = await fetch(`${baseUrl}${injuryListPath}`);
  return await response.text();
}

const formatInjuryData = (html: string) => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find all team injury sections
  const teamDivs = document.querySelectorAll('td.tbtitle');
  const playersData = [];

  teamDivs.forEach(teamDiv => {
    // Extract team name from the title (removing trailing count)
    const teamFullName = teamDiv.textContent.trim();
    const teamName = teamFullName.replace(/\s*\(\d+.*\)$/, '');

    // Find the table containing player data for this team
    // The team title is in a td, which is in a tr, which is in a table
    const teamTable = teamDiv.closest('table');
    const playerRows = teamTable.querySelectorAll('tr.darkcolor, tr.lightcolor');

    playerRows.forEach(row => {
      // Get the player link element
      const playerLink = row.querySelector('a');
      if (!playerLink) return;

      // Extract player name
      const playerName = playerLink.textContent.trim();

      // Get injury and timeline cells
      const cells = row.querySelectorAll('td');
      const injury = cells[1]?.textContent.trim() || 'Unknown';
      const timeline = cells[2]?.textContent.trim() || 'Unknown';

      // Add to data array
      playersData.push({
        name: playerName,
        injury: injury,
        timeline: timeline,
        team: teamName
      });
    });
  });

  return { data: playersData };
}

(async () => {
  const html = await fetchInjuryHtml();
  const injuryData = await formatInjuryData(html);
  fs.writeFileSync('injuryData.json', JSON.stringify(injuryData, null, 2));
})()
