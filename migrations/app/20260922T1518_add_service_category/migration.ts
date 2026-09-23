#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/00efeb75b1913c4003280e9b6edf5adb9cb143a376d9054d7136c24a0637786a/contract';
import startContract from '../../snapshots/00efeb75b1913c4003280e9b6edf5adb9cb143a376d9054d7136c24a0637786a/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a7c082a4dec370215d921cf46e4b6018fdd74e908ddfa05b1146b0cdcef4c10e/contract';
import endContract from '../../snapshots/a7c082a4dec370215d921cf46e4b6018fdd74e908ddfa05b1146b0cdcef4c10e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'appointment',
        columns: [
          col('appointmentDate', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('appointmentTime', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('message', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('service', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'service',
        column: col('category', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
