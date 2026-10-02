import { db } from "../config/db";

// ─── BLOB Codec ───────────────────────────────────────────────────────────────
// Mocks legacy CRM binary format: each BLOB encodes { field_id, val } as JSON
// bytes. This mirrors the opaque storage used by the upstream Java system.

interface BlobPayload {
  field_id: number;
  val: any;
}

/**
 * Encodes a field_id + value pair into a BLOB Buffer.
 * Binary layout: raw JSON bytes → e.g. {"field_id":12,"val":250000}
 */
export function encodeBlob(field_id: number, val: any): Buffer {
  const payload: BlobPayload = { field_id, val };
  return Buffer.from(JSON.stringify(payload), "utf-8");
}

/**
 * Decodes a BLOB Buffer back into { field_id, val }.
 * Returns null if the buffer is malformed (defensive — mirrors legacy behavior).
 */
export function decodeBlob(blob: Buffer | Uint8Array): BlobPayload | null {
  try {
    const raw = Buffer.isBuffer(blob) ? blob : Buffer.from(blob);
    return JSON.parse(raw.toString("utf-8")) as BlobPayload;
  } catch {
    return null;
  }
}

// ─── EAV Service ─────────────────────────────────────────────────────────────
export const EavService = {
  /**
   * Reads all BLOB rows for a sales_id, decodes each blob, and returns a flat
   * key-value map keyed by field_id (as string) — same contract as before.
   * e.g. { "12": 250000, "15": "John" }
   */
  async flattenPayload(salesId: number): Promise<Record<string, any>> {
    const rows = await db.sales_field_cache.findMany({
      where: { sales_id: salesId },
    });

    return rows.reduce<Record<string, any>>((acc, row) => {
      const decoded = decodeBlob(row.data_value as Buffer);
      if (decoded) {
        acc[String(decoded.field_id)] = decoded.val;
      }
      return acc;
    }, {});
  },

  /**
   * Inserts field values as BLOB rows for a given sales record.
   * Mimics the legacy system: no upsert logic — each write appends a new row.
   * Use deleteAndReinsert if you need idempotent writes.
   */
  async insertFields(
    salesId: number,
    fields: Array<{ field_id: number; data_value: any }>,
  ): Promise<void> {
    await db.sales_field_cache.createMany({
      data: fields.map((f) => ({
        sales_id: salesId,
        data_value: encodeBlob(f.field_id, f.data_value),
        update_date: new Date(),
      })),
    });
  },

  /**
   * Delete all existing BLOB rows for a sales+field pair (by decoding each blob)
   * then re-insert. This is the idempotent write path for update scenarios.
   */
  async upsertFields(
    salesId: number,
    fields: Array<{ field_id: number; data_value: any }>,
  ): Promise<void> {
    const existing = await db.sales_field_cache.findMany({
      where: { sales_id: salesId },
    });

    // Identify row IDs that belong to incoming field_ids
    const fieldIds = new Set(fields.map((f) => f.field_id));
    const toDelete = existing
      .filter((row) => {
        const decoded = decodeBlob(row.data_value as Buffer);
        return decoded && fieldIds.has(decoded.field_id);
      })
      .map((row) => row.id);

    // Delete stale rows, then insert fresh BLOBs
    if (toDelete.length > 0) {
      await db.sales_field_cache.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    await this.insertFields(salesId, fields);
  },
};
