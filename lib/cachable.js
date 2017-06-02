var Promise = require('bluebird');

var caches = {};

/**
 * Construct the cache class
 * @param name - Name that identifies this cache
 * @param options - An object containing additional config for the cache
 * @param options.ttl - The default ttl for cached items (defaults to 0 - infinite)
 */
function Cachable(name, options) {
  options = options || {};

  this.name = name;
  this.ttl = options.ttl || 0;
  this.init();
}

/**
 * Perform actions needed to initialize the cache
 */
Cachable.prototype.init = function() {
  this.cache = {};
};

/**
 * Get an item from the cache (if it exists and ttl has not epired)
 * @param key
 * @returns {Promise.<*>}
 */
Cachable.prototype.get = function(key) {
  return this
    ._read(key)
    .then(function (cachedItem) {
      if (!cachedItem) return null;

      if (cachedItem.expiresAt >= new Date()) {
        return this
          ._delete(key)
          .thenReturn(null);
      }

      return cachedItem.data;
    });
};

/**
 * Set an item in the cache
 * @param key - The key that references the item
 * @param data - The data that is to be written
 * @param ttl - The time in ms that this data is valid
 * @returns {Promise.<*>}
 */
Cachable.prototype.set = function(key, data, ttl) {
  var cacheData = { data: data };

  if (ttl) {
    cacheData.expiresAt = new Date((new Date()) + ttl);
  }

  return this._write(key, cacheData);
};

/**
 * Remove an item from the cache
 * @param key - The key that references the item
 * @returns {Promise.<*>}
 */
Cachable.prototype.remove = function(key) {
  return this._delete(key);
};

/**
 * Internal method that fetches data from the cache (if it exists)
 * @param key - The key that references the item
 * @returns {Promise.<*>}
 * @private
 */
Cachable.prototype._read = function(key) {
  return new Promise(function (resolve, reject) {
    var cacheKey = '_' + key;

    if (!this.cache.hasOwnProperty(cacheKey)) return resolve(null);

    resolve(this.cache[cacheKey]);
  });
};

/**
 * Internal method that writes data to the cache
 * @param key - The key that references the item
 * @param data - The data to write
 * @private
 */
Cachable.prototype._write = function (key, data) {
  return new Promise(function (resolve, reject) {
    var cacheKey = '_' + key;

    this[cacheKey] = data;

    resolve();
  });
};

/**
 * Internal method that deletes data from the cache
 * @param key - The key that references the item
 * @private
 */
Cachable.prototype._delete = function(key) {
  return new Promise(function (resolve, reject) {
    var cacheKey = '_' + key;

    delete this[cacheKey];

    resolve();
  });
};
