'use strict'

/*!
 * migrate - Set
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events')
var Migration = require('./migration')
var migrate = require('./migrate')
var inherits = require('inherits')

/**
 * Expose `Set`.
 */

module.exports = MigrationSet

/**
 * Initialize a new migration `Set` with the given `path`
 * which is used to store data between migrations.
 *
 * @param {String} path
 * @api private
 */

function MigrationSet (store) {
  this.store = store
  this.migrations = []
  this.map = {}
  this.lastRun = null
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

inherits(MigrationSet, EventEmitter)

/**
 * Add a migration.
 *
 * @param {String} title
 * @param {Function} up
 * @param {Function} down
 * @api public
 */

MigrationSet.prototype.addMigration = function (title, up, down) {
  var migration
  if (!(title instanceof Migration)) {
    migration = new Migration(title, up, down)
  } else {
    migration = title
  }

  // Only add the migration once, but update
  if (this.map[migration.title]) {
    this.map[migration.title].up = migration.up
    this.map[migration.title].down = migration.down
    this.map[migration.title].description = migration.description
    return
  }

  this.migrations.push(migration)
  this.map[migration.title] = migration
}

/**
 * Save the migration data.
 *
 * @api public
 */

MigrationSet.prototype.save = function (fn) {
  this.store.save(this, (err) => {
    if (err) return fn(err)
    this.emit('save')
    fn(null)
  })
}

/**
 * Run down migrations and call `fn(err)`.
 *
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

MigrationSet.prototype.down = function (options, fn) {
  this.migrate('down', options, fn)
}

/**
 * Run up migrations and call `fn(err)`.
 *
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

MigrationSet.prototype.up = function (options, fn) {
  this.migrate('up', options, fn)
}

/**
 * Migrate in the given `direction`, calling `fn(err)`.
 *
 * @param {String} direction
 * @param {Objection} options
 * @param {Function} fn
 * @api public
 */

MigrationSet.prototype.migrate = function (direction, options, fn) {
  if (typeof options === 'function') {
    fn = options
    options = null
  }
  migrate(this, direction, options, fn)
}
