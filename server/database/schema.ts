/* eslint-disable */
/** auto generated, do not edit */
import { sql } from 'drizzle-orm';
import { boolean, foreignKey, index, integer, pgTable, real, text, uniqueIndex, uuid, varchar, customType } from "drizzle-orm/pg-core"

export const customTimestamptz = customType<{
  data: Date;
  driverData: string;
  config: { precision?: number };
}>({
  dataType(config) {
    const precision = typeof config?.precision !== 'undefined'
      ? ` (${config.precision})`
      : '';
    return `timestamptz${precision}`;
  },
  toDriver(value: Date | string | number) {
    if (value == null) return value as any;
    if (typeof value === 'number') return new Date(value).toISOString();
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    throw new Error('Invalid timestamp value');
  },
  fromDriver(value: string | Date): Date {
    if (value instanceof Date) return value;
    return new Date(value);
  },
});

export const userProfile = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'user_profile';
  },
  toDriver(value: string) {
    return sql`ROW(${value})::user_profile`;
  },
  fromDriver(value: string) {
    const [userId] = value.slice(1, -1).split(',');
    return userId.trim();
  },
});

export type FileAttachment = {
  bucket_id: string;
  file_path: string;
};

export const fileAttachment = customType<{
  data: FileAttachment;
  driverData: string;
}>({
  dataType() {
    return 'file_attachment';
  },
  toDriver(value: FileAttachment) {
    return sql`ROW(${value.bucket_id},${value.file_path})::file_attachment`;
  },
  fromDriver(value: string): FileAttachment {
    const [bucketId, filePath] = value.slice(1, -1).split(',');
    return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
  },
});

export function escapeLiteral(str: string): string {
  return "'" + str.replace(/'/g, "''") + "'";
}

export const userProfileArray = customType<{
  data: string[];
  driverData: string;
}>({
  dataType() {
    return 'user_profile[]';
  },
  toDriver(value: string[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::user_profile[]`;
    }
    const elements = value.map(id => `ROW(${escapeLiteral(id)})::user_profile`).join(',');
    return sql.raw(`ARRAY[${elements}]::user_profile[]`);
  },
  fromDriver(value: string): string[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => m.slice(1, -1).split(',')[0].trim());
  },
});

export const fileAttachmentArray = customType<{
  data: FileAttachment[];
  driverData: string;
}>({
  dataType() {
    return 'file_attachment[]';
  },
  toDriver(value: FileAttachment[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::file_attachment[]`;
    }
    const elements = value.map(f =>
      `ROW(${escapeLiteral(f.bucket_id)},${escapeLiteral(f.file_path)})::file_attachment`
    ).join(',');
    return sql.raw(`ARRAY[${elements}]::file_attachment[]`);
  },
  fromDriver(value: string): FileAttachment[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => {
      const [bucketId, filePath] = m.slice(1, -1).split(',');
      return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
    });
  },
});

export const collabMember = pgTable("collab_member", {
  groupId: uuid("group_id").primaryKey(),
  userId: userProfile("user_id").primaryKey(),
  nickname: varchar("nickname", { length: 20 }),
  color: varchar("color", { length: 7 }),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  foreignKey({
    columns: [table.groupId],
    foreignColumns: [collabGroup.id],
    name: "collab_member_group_id_fkey",
  }).onDelete("cascade"),
]);

export const collabGroup = pgTable("collab_group", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  shareCode: varchar("share_code", { length: 8 }).notNull().unique(),
  createdBy: userProfile("created_by"),
  createdByAudit: userProfile("_created_by_audit").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  uniqueIndex("idx_collab_group_share_code").on(table.shareCode),
  // Complex index: CREATE INDEX idx_collab_group_created_by ON collab_group USING btree (((created_by).user_id)),
]);

export const userInfo = pgTable("user_info", {
  userId: userProfile("user_id").primaryKey(),
  nickname: varchar("nickname", { length: 20 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  avatar: text("avatar"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
});

export const foodEntryTag = pgTable("food_entry_tag", {
  foodEntryId: uuid("food_entry_id").primaryKey(),
  tagId: uuid("tag_id").primaryKey(),
}, (table) => [
  index("idx_food_entry_tag_tag_id").on(table.tagId),
  foreignKey({
    columns: [table.foodEntryId],
    foreignColumns: [foodEntry.id],
    name: "food_entry_tag_food_entry_id_fkey",
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.tagId],
    foreignColumns: [tag.id],
    name: "food_entry_tag_tag_id_fkey",
  }).onDelete("cascade"),
]);

export const foodEntry = pgTable("food_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  dishName: varchar("dish_name", { length: 255 }).notNull(),
  restaurantName: varchar("restaurant_name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull().default(0),
  longitude: real("longitude").notNull().default(0),
  rating: integer("rating").notNull().default(5),
  note: text("note").notNull(),
  images: text("images").notNull().default('[]'),
  visitDate: customTimestamptz("visit_date", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  favorite: boolean("favorite").notNull().default(false),
  userId: userProfile("user_id"),
  groupId: uuid("group_id"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_food_entry_visit_date").on(table.visitDate),
  index("idx_food_entry_rating").on(table.rating),
  index("idx_food_entry_restaurant").on(table.restaurantName),
  index("idx_food_entry_location").on(table.latitude, table.longitude),
]);

export const tag = pgTable("tag", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  color: varchar("color", { length: 20 }).notNull().default('#f97316'),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("tag_name_key").on(table.name),
]);

// table aliases
export const collabGroupTable = collabGroup;
export const collabMemberTable = collabMember;
export const foodEntryTable = foodEntry;
export const foodEntryTagTable = foodEntryTag;
export const tagTable = tag;
export const userInfoTable = userInfo;
