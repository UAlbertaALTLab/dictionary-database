/**
 * A class representing a database index.
 */
export default class Index extends Map {

  /**
   * Create a new database index.
   * @param {Array}    database         An Array of database entries to index.
   * @param {Function} indexingFunction A function that accepts two arguments - a database entry to add to the index, and the index itself. The function should return the **unique** key use for that entry. If this function returns a falsy value, no index will be created for the entry.
   */
  constructor(database, createIndex) {
    super();
    this.createIndex = createIndex;
    for (const entry of database) {
      this.add(entry);
    }
  }

  /**
   * Adds an entry to the index. Will use the same key-generating function that was passed to the Index constructor to create the key for the entry.
   * @param {Object} entry The entry to add to the index.
   */
  add(entry) {
    const key = this.createIndex(entry, this);
    if (key) return this.set(key, entry);
    return this;
  }

  /**
   * Remove an entry from the index.
   * @param  {String}  key The key for the entry to remove
   * @return {Boolean}
   */
  remove(key) {
    return this.delete(key);
  }

}
