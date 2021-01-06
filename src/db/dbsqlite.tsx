// Import path module
const path = require('path')

// Get the location of database.sqlite file
const dbPath = path.resolve(__dirname, 'server/db/db.sqlite')

// Create connection to SQLite database
export const knexi = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: dbPath,
    },
    useNullAsDefault: true
  })

  // Create a table in the database called "books"
knexi.schema
// Make sure no "books" table exists
// before trying to create new
.hasTable('imudata')
  .then((exists) => {
    if (!exists) {
      // If no "books" table exists
      // create new, with "id", "author", "title",
      // "pubDate" and "rating" columns
      // and use "id" as a primary identification
      // and increment "id" with every new record (book)
      return knexi.schema.createTable('imudata', (table)  => {
        table.increments('id').primary()
        table.string('sensorname')
        table.integer('time')
        table.string('x')
        table.string('y')
        table.string('z')
      })
      .then(() => {
        // Log success message
        console.log('Table \'Imudata\' created')
      })
      .catch((error) => {
        console.error(`There was an error creating table: ${error}`)
      })
    }
  })
  .then(() => {
    // Log success message
    console.log('done')
  })
  .catch((error) => {
    console.error(`There was an error setting up the database: ${error}`)
  })

// Just for debugging purposes:
// Log all data in "books" table
knexi.select('*').from('imudata')
.then(data => console.log('data:', data))
.catch(err => console.log(err))

// Export the database
module.exports = knexi