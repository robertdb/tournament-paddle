async function runFlow() {
  const baseUrl = 'http://localhost:3001/api';

  console.log('🔄 PASO 1: Creando 7 equipos...');
  const rt = () => Math.floor(Math.random() * 10000000).toString();
  const teamsData = [
    { playerA: { name: 'Juan Perez', category: 5 }, playerB: { name: 'Martin Lopez', category: 5 }, contactPhone: rt() },
    { playerA: { name: 'Beto Gomez', category: 5 }, playerB: { name: 'Luis Garcia', category: 4 }, contactPhone: rt() },
    { playerA: { name: 'Carlos Rey', category: 6 }, playerB: { name: 'Pedro Paz', category: 6 }, contactPhone: rt() },
    { playerA: { name: 'Diego Sol', category: 4 }, playerB: { name: 'Enzo Mar', category: 5 }, contactPhone: rt() },
    { playerA: { name: 'Fede Cruz', category: 7 }, playerB: { name: 'Gabi Luz', category: 7 }, contactPhone: rt() },
    { playerA: { name: 'Hugo Juez', category: 5 }, playerB: { name: 'Ivan Flor', category: 5 }, contactPhone: rt() },
    { playerA: { name: 'Keko Van', category: 6 }, playerB: { name: 'Leo Mar', category: 6 }, contactPhone: rt() }
  ];

  const teamIds = [];
  for (const team of teamsData) {
    const res = await fetch(`${baseUrl}/teams`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team)
    });
    const data = await res.json();
    if (!res.ok) {
       console.error('Error creando equipo:', data);
       return;
    }
    teamIds.push(data.id);
    console.log(`✅ Equipo creado: ID: ${data.id}`);
  }

  console.log('\n🔄 PASO 2: Realizando Check-in de los equipos...');
  for (const id of teamIds) {
    const res = await fetch(`${baseUrl}/teams/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked_in: true })
    });
    const data = await res.json();
    console.log(`✅ Check-in exitoso para Equipo ID: ${id}`);
  }

  console.log('\n🔄 PASO 3: Creando el Torneo End-to-End...');
  const tournamentPayload = {
    name: 'Torneo Testing End-to-End',
    numberOfCourts: 2,
    stages: [
      { order: 1, type: 'GROUP_STAGE', config: { groupsOf4: 1, groupsOf3: 1, teamsAdvancingPerGroup: 2 } },
      { order: 2, type: 'KNOCKOUT_STAGE', config: { startingRound: 'SEMIFINALS' } }
    ]
  };
  const resTourn = await fetch(`${baseUrl}/tournament`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tournamentPayload)
  });
  const dataTourn = await resTourn.json();
  console.log('✅ Torneo Creado:', dataTourn);

  console.log('\n🔄 PASO 4: Obteniendo el Overview del Torneo (Grupos)...');
  const resOverview = await fetch(`${baseUrl}/tournament`, { method: 'GET' });
  const docOverview = await resOverview.json();
  console.log('✅ Overview obtenido:', JSON.stringify(docOverview, null, 2));
  
  if (docOverview.stages) {
    const stageGroups = docOverview.stages.find(s => s.type === 'GROUP_STAGE');
    if (stageGroups) {
      console.log('Grupos generados:');
      console.log(JSON.stringify(stageGroups.groups.map(g => ({ name: g.name, id: g.id })), null, 2));
    }
  }

  console.log('\n🔄 PASO 5: Obteniendo la lista completa de partidos...');
  const resMatches = await fetch(`${baseUrl}/tournament/matches`, { method: 'GET' });
  const matchesData = await resMatches.json();
  console.log(`✅ Se obtuvieron ${matchesData.length} partidos en total.`);
  console.log(`- De Grupo: ${matchesData.filter(m => m.round === 'GROUP_MATCH').length}`);
  console.log(`- De Semifinales: ${matchesData.filter(m => m.round === 'SEMIFINALS').length}`);
  console.log(`- De Final: ${matchesData.filter(m => m.round === 'FINALS').length}`);

  if (matchesData.length > 0) {
    const matchTarget = matchesData[matchesData.length - 1]; // agarramos la final o uno cualquiera
    console.log(`\n🔄 PASO 6: Consultar el partido específico ID: ${matchTarget.id} (Ronda: ${matchTarget.round})...`);
    const resSingleMatch = await fetch(`${baseUrl}/tournament/matches/${matchTarget.id}`);
    const singleMatch = await resSingleMatch.json();
    console.log('✅ Partido devuelto individualmente:', JSON.stringify(singleMatch, null, 2));
  }
}

runFlow().catch(console.error);
