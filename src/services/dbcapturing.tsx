import { remote } from 'electron'
import { fromEvent, Subject } from 'rxjs'
import { ImuDataTypeSensor } from "../common/types";
export const redis = remote.require('redis')
const masterClientW = redis.createClient({host: '127.0.0.1', port: 6379});
const replicationClientR = redis.createClient({host: '127.0.0.1', port: 6380});
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
export const getAsync = promisify(masterClientW.get).bind(masterClientW);
export const hmsetAsync = promisify(masterClientW.hmset).bind(masterClientW);
export const hsetAsync = promisify(masterClientW.hset).bind(masterClientW);
export const lpushAsync = promisify(masterClientW.lpush).bind(masterClientW);
export const smembersAsync = promisify(masterClientW.smembers).bind(masterClientW);
export const flushallAsync = promisify(masterClientW.flushall).bind(masterClientW);
export const flushDBAsync = promisify(masterClientW.flushdb).bind(masterClientW);
export const zaddAsync = promisify(masterClientW.zadd).bind(masterClientW);
export const zrangeAsync = promisify(masterClientW.zrange).bind(masterClientW);
export const sortAsync = promisify(masterClientW.sort).bind(masterClientW);
export const delAsync = promisify(masterClientW.del).bind(masterClientW);

export const lrangeAsync = promisify(replicationClientR.lrange).bind(replicationClientR);
export const llenAsync = promisify(replicationClientR.llen).bind(replicationClientR);