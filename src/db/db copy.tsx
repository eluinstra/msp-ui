// import PouchDB from "pouchdb";

// import { ImuDataTypeSensor } from "./types";

// import { timeStart, timeEnd } from "./helper";
// import { write } from "fs";

// //you can name the function within .then, even make it async and await within it, but it probably isn't 
// //valuable to whatever you're trying to do. The function will only exist within
// // the scope of that particular '.then'. There is probably a more suitable way to do whatever you're trying to do

// let d = new Date();
// let dformat = '${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}';

// var dbName = "imu-data-repo-001";

// // Creating the PouchDB database instance is a synchronous operation. This means that we
// // can immediately start to interact with the "db" object. The data will be persisted to
// // either IndexedDB or WebSQL (favoring IndexedDB), with plugins available for other
// // persistence engines (ex, localStorage).
// let db = new PouchDB(dbName);
// //db.destroy();
// //db = new PouchDB(dbName);

// // When I am playing around with PouchDB, I like to destroy and recreate the database on
// // each test run. This way, any conflicts with existing data are explicitly coded into
// // the experiment and not a byproduct of dirty data.
// var promise = db.destroy().then(
// 	function() {

// 		// Once we destroy the database, we have to create a new one otherwise we'll get
// 		// an error, "Error: database is destroyed".
//     db = new PouchDB( dbName );

//   })
//   .catch(function (err) {
//     console.log(err);
//   });

//   export function writeDB(todo) {
//   // db.put({todo}).then(function (response) {
//   //   console.log(response);
//   // }).catch(function (err) {
//   //   console.log(err);
//   // });

//   db.put(todo, function (err, result) {
//     //console.log('Successfully saved a todo!\n');
//     db.allDocs({ include_docs: true, descending: true }, function (err, result) {
//       //console.log('fetched', result.rows.length, 'items\n');
//       //console.log(result.rows+"\n");
//     });
//   })
// }


// // export function getOne() {
// //   db.get('mydoc').then(function(doc) {
// //     return db.put({
// //       _id: 'mydoc',
// //       _rev: doc._rev,
// //       title: "Let's Dance"
// //     });
// //   }).then(function(response) {
// //     // handle response
// //   }).catch(function (err) {
// //     console.log(err);
// //   });
// // }

// // export function writeDB() {
// //    const controlsArray = Object.entries(controls);
// //    const dbArray = controlsArray.map(([key, value]) => ({
// //        _id: key,
// //        name: key,
// //        curVal: value
// //      }));

// //   db.bulkDocs(dbArray)
// //       .then((res) => console.log(res))
// //       .catch((err) => console.log(err))
// //       .finally(() => db.close());
// // }

// // function fetchAllDocs() {
// //          db
// //           .allDocs({ include_docs: true })
// //           .then((res) => res.rows)
// //           .then((rows) => rows.map((row) => row.doc.curVal))
// //           .catch((err) => console.log(err))
// //           .finally(() => db.close());
// //       }

// // async function getStored() {
// //   const arr = await this.fetchAllDocs();
// //   console.log(arr);
// //   }
   
// //   function consoleDraw() {
// //           console.log("\n==========\n==========\n");
// //   }
  
// //   export function getOne(val = "0.01") {
// //     db.get("xa")
// //       .then((res) => console.log(res))
// //       .catch((err) => console.log(err))
// //       // .finally(() => db.close());
// //   }