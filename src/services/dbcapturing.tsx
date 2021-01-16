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
export const lrangeAsync = promisify(client.lrange).bind(client);
export const lpushAsync = promisify(client.lpush).bind(client);
export const smembersAsync = promisify(client.smembers).bind(client);
export const flushallAsync = promisify(client.flushall).bind(client);
export const zaddAsync = promisify(client.zadd).bind(client);
export const zrangeAsync = promisify(client.zrange).bind(client);
export const sortAsync = promisify(client.sort).bind(client);
export const llenAsync = promisify(client.llen).bind(client);