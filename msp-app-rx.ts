import { fromEvent } from 'rxjs'
import { map, filter } from 'rxjs/operators'
import { mspCMD } from './protocol.js'
import { mspMsg, mspState, port, command, parseMSPCommand } from './msp.js'

const mspFunctions = [];
mspFunctions[100] = function() {

}

const hexInt = (num, width) => num.toString(16).padStart(width,"0").toUpperCase();

const hexInt8 = num => hexInt(num & 0xFF,2);

const mspButton = document.getElementById('mspButton')
const mspInput = document.getElementById('mspInput')
const mspOutput = document.getElementById('mspOutput')

const printMspResult = mspMsg => mspOutput.innerHTML = "SUCCESS " + mspMsg.buffer.map(v => hexInt8(v))

const clickStream = fromEvent(mspButton, 'click')
.pipe(
  // map(event => command(mspInput["value"],[]))
  map(event => command((mspInput as HTMLInputElement).value,[]))
)
.subscribe(val => {
  console.log(Buffer.from(val))
  // port.write(Buffer.from(val))
  getMSP(val)
  .then(printMspResult)
  .catch(error => console.log('Error occurred: ' + error.message))
})

var getMSP = function (cmd) {
  return new Promise(function(resolve, reject) {
    port.on('data', function (data) {
      for (let i = 0; i < data.length; i++) {
        parseMSPCommand(data.readInt8(i))
        if (mspMsg.state == mspState.MSP_COMMAND_RECEIVED) {
          resolve(mspMsg);
          mspMsg.state = mspState.MSP_IDLE
        } else if (mspMsg.state == mspState.MSP_ERROR_RECEIVED) {
          reject(new Error('MSP error received!'));
          mspMsg.state = mspState.MSP_IDLE
        }
      }
    })
    port.write(Buffer.from(cmd))
  });
};
