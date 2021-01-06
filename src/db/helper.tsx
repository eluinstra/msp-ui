import React from "react";

// helper function thart starts performace - time measurement
export const timeStart = () => {
    return performance.now();
  };
  
  // helper function  to end and print  - time measurement
  export const timeEnd = (timeStart: number, funName: string) => {
    var t1 = performance.now();
    console.log(`fun: ${funName} took ${(t1 - timeStart).toFixed(2)}ms`);
    return +(t1 - timeStart).toFixed(2);
  };

//   // ass n - number of dummy users to the db
// export const addImuDatatoDB = async (
//   db: PouchDB
// ) => {
//   const t0 = performance.now();
//   const timeTaken = [];
//   let total = 0;

//   // if the chunk is the default one set it to an appropriate value (max of 100 or .5% increment is considered)
//   console.log("inserting data");

//   let done = 0;

//   const imuArry = [];
//   imuArry.push(createImuData());

//   //const result = await db?.imudata.bulkInsert(imuArry);

//   await db.imudata?.insert(createImuData());
//   const ta1 = performance.now();
//   timeTaken.push(ta1 - t0);
//     // console.log(
//     //   `inserted ${result?.success.length} docs & failed ${result?.error.length} docs`
//     // );
  
//   const t1 = performance.now();
//   console.log(
//     `idb: Time Taken to add imudata : ${(t1 - t0).toFixed(
//       1
//     )}ms`
//   );
//   console.log(
//     `Pass: ${timeTaken.length}, time: ${timeTaken
//       .reduce((a, b) => a + b, 0)
//       .toFixed(1)},min: ${Math.min(...timeTaken).toFixed(1)},max: ${Math.max(
//       ...timeTaken
//     ).toFixed(1)},avg: ${(
//       timeTaken.reduce((a, b) => a + b, 0) / timeTaken.length
//     ).toFixed(1)},  `
//   );
//   //saveTimeTaken &&
  //  saveTimeTaken([+timeTaken.reduce((a, b) => a + b, 0).toFixed(2), done]);
  // console.log(db);
//};