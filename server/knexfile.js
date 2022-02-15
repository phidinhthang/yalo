// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'pg',
    pool: {
      min: 2,
      max: 10,
    },
    connection: 'postgres://postgres:456852@localhost:5432/zalo-web',
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  staging: {
    client: 'pg',
    pool: {
      min: 2,
      max: 10,
    },
    connection: 'postgres://postgres:456852@localhost:5432/zalo-web',
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'pg',
    pool: {
      min: 2,
      max: 10,
    },
    connection: 'postgres://postgres:456852@localhost:5432/zalo-web',
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
