import { IndexedDB } from "../../shared/IndexedDB.js";
import { TABLE_METAS_STORE } from "../../shared/constants.js";

/**
 * Load all tableMeta records from IDB into lookup Maps.
 * @returns {Promise<{ metaMap: Map, metaByTable: Map }>}
 */
export async function loadMetas() {
  const records = await IndexedDB.getAll(TABLE_METAS_STORE);
  const metaMap = new Map();
  const metaByTable = new Map();
  for (const meta of records) {
    metaMap.set(meta.modelName, meta);
    metaByTable.set(meta.tableName, meta);
  }
  return { metaMap, metaByTable };
}
