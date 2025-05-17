export class CalendarBuilder {
  constructor(name) {
    this.name = name;
    this.events = [];
  }

  static start(name = 'My Calendar') {
    return new CalendarBuilder(name);
  }

  addEvent(builderFn) {
    const event = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}@calendar`, // default UID
      summary: 'Untitled Event',
      from: '',
      to: '',
      location: ''
    };
    builderFn(event);
    this.events.push(event);
    return this;
  }

  createIcsContent() {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${this.name}`,
      'PRODID:-//Generated Calendar//EN'
    ];

    for (const ev of this.events) {
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${ev.id}`);
      lines.push(`SUMMARY:${ev.summary}`);
      if (ev.from) lines.push(`DTSTART:${ev.from}`);
      if (ev.to) lines.push(`DTEND:${ev.to}`);
      if (ev.location) lines.push(`LOCATION:${ev.location}`);
      if (ev.desc) lines.push(`DESCRIPTION:${ev.desc}`);
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }
}

export const createIcsFromFixtures = (fixtures, calendarName) => {
  const calendarBuilder = CalendarBuilder.start(calendarName);

  const getTeamName = (teamName) => {
    return teamName
      .replaceAll('Technical NC -', '')
      .replaceAll('Riccarton NC - C Team', 'Riccarton C')
      .replaceAll('UC -', 'UC')
      .replaceAll('Belfast Netball Club -', 'Belfast')
      .replaceAll('Marist Albion -', 'Marist')
      .replaceAll('Knights Netball Club -', 'Knights')
      .replaceAll('Team', '')
      .replaceAll('NC', '')
      .replaceAll('Netball', '')
      .replaceAll('Club', '')
      .replaceAll('  ', ' ')
      .replaceAll('  ', ' ')
      .trim()
      ;
  }

  const buildSummary = (fixture) => {
    if (!!fixture.HomeScore && !!fixture.AwayScore) {
      const homeTeam = getTeamName(`${fixture.HomeOrgAbbr} - ${fixture.HomeTeamName}`);
      const awayTeam = getTeamName(`${fixture.AwayOrgAbbr} - ${fixture.AwayTeamName}`);

      const riccartonScore = homeTeam.includes('Riccarton C') 
      ? parseInt(fixture.HomeScore, 10)
      : parseInt(fixture.AwayScore, 10);

      const otherScore = !homeTeam.includes('Riccarton C') 
      ? parseInt(fixture.HomeScore, 10)
      : parseInt(fixture.AwayScore, 10);

      const emoji = riccartonScore > otherScore
        ? '🟢'
        : riccartonScore === otherScore
          ? '🟡'
          : '🔴';

      return `${emoji} ${homeTeam} ${fixture.HomeScore}-${fixture.AwayScore} ${awayTeam}`;
    }
    else {
      const homeTeam = getTeamName(`${fixture.HomeOrgAbbr} - ${fixture.HomeTeamName}`);
      const awayTeam = getTeamName(`${fixture.AwayOrgAbbr} - ${fixture.AwayTeamName}`);

      return `${homeTeam} vs ${awayTeam}`;
    }

  }

  for (const fixture of fixtures) {
    calendarBuilder.addEvent(event => {
      event.id = fixture.Id;
      event.summary = buildSummary(fixture);
      event.from = new Date(fixture.From).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';;
      event.to = new Date(fixture.To).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';;
      event.desc = fixture.VenueName
      event.location = fixture.VenueAddress ?? '';
    });
  }

  return calendarBuilder.createIcsContent();
}