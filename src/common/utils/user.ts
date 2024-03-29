import { Access, AccessPositions, ParsedUser } from 'src/common/types/server';
import { checkBit as cb } from 'src/common/utils/bitwise';
import { isNumber } from 'src/common/utils/shared';
import { User } from 'src/entities/User';
import { DomainUser } from 'src/modules/ldap/types';
import { DataSource } from 'typeorm';

/** Access Buffer aus DB lesen */
export const readBuffer = (buffer: Buffer | null) =>
  Buffer.isBuffer(buffer) ? buffer.readUIntBE(0, 1) : 0;

export const writeBuffer = (num: number) => Buffer.from([num]);

/** Positionen des Bits mit Berechtigung innerhalb der 2 Byte, siehe `parseAccess()` */
export const ap: AccessPositions = {
  regions: { read: 7, write: 6 },
  stations: { read: 5, write: 4 },
  users: { read: 3, write: 2 },
  admin: { read: 1, write: 0 },
};

/**
 * `access` ist 2 byte BE. Jede Tabelle (jedes Feature) hat 2 Bits für Berechtigungen,
 * _Lesen_ und _Schreiben_ (in dieser Reihenfolge).
 *
 * Features (Tabellen) werden in dieser Reihenfolge geparsed:
 * `regions` > `stations` > `users` > `admin`
 */
export const parseAccess = (a: number): Access => ({
  regions: {
    read: cb(a, ap.regions.read),
    write: cb(a, ap.regions.write),
  },
  stations: {
    read: cb(a, ap.stations.read),
    write: cb(a, ap.stations.write),
  },
  users: {
    read: cb(a, ap.users.read),
    write: cb(a, ap.users.write),
  },
  admin: {
    read: cb(a, ap.admin.read),
    write: cb(a, ap.admin.write),
  },
});

/** Erstelle User-Objekt aus User in der Datenbank, auch für Session */
export function readUser(user: User) {
  const {
    id,
    username,
    first_name,
    last_name,
    access,
    region,
    allowed_stations,
    email,
    location,
    entry_date,
    crent,
    hardware,
    qlik,
    active,
  } = user;

  const accessFromBinary = readBuffer(access);

  const numOrStringLocation = isNumber(location)
    ? Number(location)
    : location.replace(/_/g, '');

  const nameString =
    last_name && !first_name ? last_name : `${first_name} ${last_name}`;

  const parsed: ParsedUser = {
    id,
    username,
    region,
    crent,
    hardware,
    active,
    email: email?.toLowerCase() ?? null,
    firstName: first_name,
    lastName: last_name,
    fullName: nameString,
    access: parseAccess(accessFromBinary),
    location: numOrStringLocation,
    stations: Array.isArray(allowed_stations)
      ? allowed_stations.map((stat) => stat.id)
      : [],
    entryDate: entry_date,
    qlik,
  };

  return parsed;
}

// username extra für login
export async function writeUser(
  db: DataSource,
  ldapUser: DomainUser,
  username = ldapUser.sAMAccountName
) {
  const userRepo = db.getRepository(User);

  // suche username aus request in der db
  let dbUser = await userRepo.findOne({
    where: { username },
    relations: ['region', 'allowed_stations'],
  });

  // wenn kein user: Modell erstellen
  if (dbUser === null) {
    dbUser = new User();
    dbUser.username = username;
    // dbUser.access = emptyAccess; // im entity default gesetzt
  }

  // in jedem Fall Modell updaten
  dbUser.first_name = ldapUser.givenName;
  dbUser.last_name = ldapUser.sn;
  dbUser.email = ldapUser.mail;
  dbUser.active = ldapUser.userAccountControl === '514' ? 0 : 1;

  // aus DN die Station / Abteilung ermitteln
  // location ist der Branch über CN
  const dn = ldapUser.distinguishedName;
  const dnParts = dn.split('=');
  // eslint-disable-next-line prefer-destructuring
  const locationPart = dnParts[2];
  const station = locationPart.substring(0, 3);
  const [department] = locationPart.split(',');
  const dnLocation = isNumber(station) ? station : department;

  const oldLocation = dbUser.location;
  if (oldLocation && isNumber(oldLocation)) {
    // todo wenn andere location und station, dann alte wegnehmen und neue rein
    // todo dafür allowed_stations klonen, alte raus und neue rein
    // todo https://orkhan.gitbook.io/typeorm/docs/many-to-many-relations
  }

  dbUser.location = dnLocation;

  // am Ende User speichern
  dbUser = await userRepo.save(dbUser);

  return dbUser;
}

/* todo
es werden nur aktive gefunden? aktiv setzen ist also schwachsinn und funktioniert nicht mal richtig
am besten alle inaktiv setzen, dann gefundenene aktiv setzen
*/
