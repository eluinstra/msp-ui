import { remote } from 'electron'
import { fromEvent, Subject } from 'rxjs'
import { ImuDataTypeSensor } from "../common/types";
export const redis = remote.require('redis')
const client = redis.createClient();
const { promisify } = require('util');


//Promise.all([doThing1, doThing2]).then(([thing1, thing2]) => { ...` for concurrent stuff, a
//Promise.all(foos.map(foo => addFoo(foo))).then((arrayOfResults) => { ...

var sensorImuDataType: ImuDataTypeSensor = {
    sensorname: 'sensor1',
    timems: "" + new Date().toISOString(),
    x: 0,
    y: 0,
    z: 0
};

//use const always, unless you have to reassign it. then use let.
export const getAsync = promisify(client.get).bind(client);
export const hmsetAsync = promisify(client.hmset).bind(client);
export const hsetAsync = promisify(client.hset).bind(client);
export const smembersAsync = promisify(client.smembers).bind(client);

getAsync.then(console.log).catch(console.error);
//hmsetAsync('messsage:+id+id', 'id', id, 'roomId', roomId, 'senderId', senderId, "created", datetime, "text", text);

// function asyncDataCapturing(go: boolean, sensordatadevice: ImuDataTypeSensor, callback) {
//     // ... lots of hard work ...
//     const entryJSON = JSON.stringify(sensordatadevice);
//     client.lpush(sensordatadevice.sensorname, entryJSON, (err, reply) => {

//         if (err) {
//             return callback(new Error("An error has occurred"));
//         }

//         if (reply) {
//             callback(true, sensorImuDataType);
//         }
//     });
// }

// asyncDataCapturing(true, sensorImuDataType, function (err, returnValues) {
//     //This code gets run after the async operation gets run
//     /* But this is all happening in the function */
// });