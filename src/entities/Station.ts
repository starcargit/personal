import type { Relation } from 'typeorm';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Min } from 'class-validator';
import { NULL, UNIQUE } from 'src/common/utils/server';
import { Region } from 'src/entities/Region';
import { User } from 'src/entities/User';

@Entity({ name: 'stations' })
export class Station {
  @Min(1)
  @PrimaryColumn({ ...UNIQUE })
  id!: number;

  @Column('varchar', { ...UNIQUE })
  name!: string;

  @Column('varchar', { ...NULL })
  address!: string | null;

  @Column('int', { ...NULL })
  zip!: number | null;

  @Column('varchar', { ...NULL })
  city!: string | null;

  @Column('varchar', { ...NULL })
  telephone!: string | null;

  @Column('varchar', { ...NULL })
  fax!: string | null;

  @Column('varchar', { ...NULL })
  email!: string | null;

  @Column('int', { ...NULL })
  region_id!: number | null;

  @Column('tinyint', { width: 1, default: 1 })
  active!: 0 | 1;

  // ---

  @ManyToOne(() => Region, (region) => region.stations, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'region_id' })
  region!: Relation<Region>;

  @ManyToMany(() => User, (user) => user.allowed_stations)
  users!: Relation<User[]>;
}
