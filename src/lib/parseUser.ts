import { DomainUser, ParsedUser, UserAccess, UserRegion, UserStations } from '../../types/user';
import { DBUser } from '../db/users';

type ParseUser = (dbUser: DBUser, domainUser: DomainUser) => ParsedUser;

// string aus db (stations in users), mit komma getrennte stationsnummern
export const parseStations = (stations: string | null | undefined): UserStations => {
  const numStations: UserStations = [];

  if (!stations) return numStations;

  // leerstellen entfernen
  const stationsString = stations.replace(/\s+/g, '');
  const extraStations = stationsString.split(',');
  for (const station of extraStations) {
    const numStation = Number(station);
    if (Number.isNaN(numStation)) {
      throw new Error(`Ungültige Station in stations: ${stationsString}`);
    }
    numStations.push(numStation);
  }

  return numStations;
};

export const parseOUStation = (dn: string) => {
  const dnParts = dn.split('=');
  const station = Number(dnParts[2].substring(0, 3));
  return Number.isNaN(station) ? 0 : station;
};

const parseUser: ParseUser = (dbUser, domainUser) => {
  const { username, access: accessString, region: regionString, stations: stationString } = dbUser;

  const region =
    typeof regionString === 'string' ? (regionString.toLowerCase() as UserRegion) : null;

  const numericAccess = {
    idl: 1,
    sl: 2,
    rl: 3,
    admin: 4,
  };

  const accessIndex = accessString?.toLowerCase() ?? 'undefined';
  const access = numericAccess[accessIndex as UserAccess] ?? 0;

  const ouStation = parseOUStation(domainUser.distinguishedName);

  // 0 bei keiner OU Station
  const extraStations = parseStations(stationString);

  const stations = [ouStation, ...extraStations];

  const user: ParsedUser = {
    username,
    email: domainUser.mail.toLowerCase(),
    firstName: domainUser.givenName,
    lastName: domainUser.sn,
    access,
    region,
    stations,
  };

  return user;
};

export default parseUser;