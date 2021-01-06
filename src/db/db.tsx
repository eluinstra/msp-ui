//https://www.techiediaries.com/electron-data-persistence/
//https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project-typescript-postgres
//https://www.prisma.io/docs/reference/database-reference/connection-urls
//https://www.prisma.io/docs/concepts/components/prisma-schema
//https://stackoverflow.com/questions/64088437/how-to-use-prisma-with-electron
//https://www.prisma.io/docs/concepts/components/prisma-client/generating-prisma-client

import { useEffect } from "react";
import { ImuDataTypeSensor } from "../db/types";

// import { ImuDataTypeSensor } from "../db/types";
// import { PrismaClient } from '../../dist/generated/client';

const path = require('path');

// const prisma = new PrismaClient()

//await prisma().user.findMany()

// Importing SQLite3 to our project.
//const Database = require('better-sqlite3');

const sqlite3 = require('sqlite3').verbose();

// open the database
var db_path = path.resolve(__dirname, '../server/db/db.sqlite')
//let db = new sqlite3.Database(db_path);

let db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the imu database.');
  });

//const db = require('better-sqlite3')(db_path , options);
//const db = new Database('imudb.db', { verbose: console.log });


export async function writeDB(todo : ImuDataTypeSensor)
{

    const sql = 'INSERT INTO imudata (timems, sensorname, x, y, z) VALUES (?,?,?,?,?);';
    db.serialize(() =>  {
        db.run("INSERT INTO imudata VALUES (NULL, ?, ?, ? , ?, ?)", [todo.sensorname, todo.timems, todo.x, todo.y, todo.z]);
      
        db.each("SELECT * FROM imudata;", function (err, row) {
           console.log(row);
        });

     });
}

// db.close((err) => {
//   if (err) {
//     console.error(err.message);
//   }
//   console.log('Close the database connection.');
// });
  
//   const imudatai = await prisma.imudata.create({
//     data: {
//       timems: ""+new Date(),
//       sensorname: "sensor1",
//       x: "1",
//       y: "2",
//       z: "4"
//     }
//   });
// }