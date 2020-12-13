import { mspMsg, mspState, port, command, parseMSPCommand } from './msp.js'
//import { mspOutputFunctions } from './msp-view.jsx'

const hexInt = (num, width) => num.toString(16).padStart(width,"0").toUpperCase();
const hexInt8 = num => hexInt(num & 0xFF,2);

const clearMspResult = () => document.getElementById('mspOutput').innerHTML = ""
const printMspResult = mspMsg => document.getElementById('mspOutput').innerHTML = "SUCCESS " + mspMsg.buffer.map(v => hexInt8(v))
// const printMspResult = mspMsg => document.getElementById('mspOutput').innerHTML = "SUCCESS " + mspOutputFunctions[mspMsg.cmd](mspMsg)

port.on('data', function (data) {
  for (let i = 0; i < data.length; i++) {
    parseMSPCommand(data.readInt8(i))
    if (mspMsg.state == mspState.MSP_COMMAND_RECEIVED) {
      // console.log("SUCCESS")
      printMspResult(mspMsg)
      mspMsg.state = mspState.MSP_IDLE
    }
  }
})

document.getElementById('mspButton').addEventListener('click', () => {
  clearMspResult()
  // const cmd = command(mspInput["value"],[])
  const cmd = command((document.getElementById('mspInput') as HTMLInputElement).value,[])
  console.log(Buffer.from(cmd))
  port.write(Buffer.from(cmd))
})
