import { remote } from 'electron'
export const redis = remote.require('redis')
const client = redis.createClient();


export function log_2_redis(logtext : string) {
    client.lpush('log', logtext, (err, reply) => {
        //console.log(reply);
          // }
        });
}