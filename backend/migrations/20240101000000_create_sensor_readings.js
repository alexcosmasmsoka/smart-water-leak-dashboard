
exports.up = function(knex) {
  return knex.schema.createTable('sensor_readings', function(table) {
    table.increments('id').primary();
    table.string('zone_name').notNullable();
    table.float('flow_rate').notNullable();
    table.float('pressure').notNullable();
    table.string('status').notNullable();
    table.boolean('leak_detected').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sensor_readings');
};

