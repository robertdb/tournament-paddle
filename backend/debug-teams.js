const { Team } = require('./src/models');

async function debug() {
  const teams = await Team.findAll({ where: { checked_in: true } });
  console.log(`Teams checked in: ${teams.length}`);
  if (teams.length > 0) {
    console.log(`Sample team status: ${teams[0].status}, checked_in: ${teams[0].checked_in}, groupId: ${teams[0].groupId}`);
  }
}
debug().catch(console.error);
