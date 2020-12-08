import { mspCMD } from './protocol.js'
import { mspMsg, mspState, port, command, parseMSPCommand } from './msp.js'

const hexInt = (num, width) => num.toString(16).padStart(width,"0").toUpperCase();

const hexInt8 = num => hexInt(num & 0xFF,2);

const mspOutputFunctions = [];

const mspButton = document.getElementById('mspButton')
const mspInput = document.getElementById('mspInput')
const mspOutput = document.getElementById('mspOutput')

const printMspResult = mspMsg => mspOutput.innerHTML = "SUCCESS " + mspOutputFunctions[mspMsg.cmd](mspMsg)

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

mspButton.addEventListener('click', () => {
  mspOutput.innerHTML = ""
  // const cmd = command(mspInput["value"],[])
  const cmd = command((mspInput as HTMLInputElement).value,[])
  console.log(Buffer.from(cmd))
  port.write(Buffer.from(cmd))
})

mspOutputFunctions[mspCMD.MSP_API_VERSION] = function(mspMsg) {
  return <div>
    <div>MSP_API_VERSION</div>
    <div>{mspMsg.buffer.map(v => hexInt8(v))}</div>
    </div>
}
mspOutputFunctions[mspCMD.MSP_FC_VARIANT] = function(mspMsg) {
  return <div>
    <div>MSP_FC_VARIANT</div>
    <div>{mspMsg.buffer.reduce((s, v) => s + String.fromCharCode(v),"")}</div>
    </div>
}
mspOutputFunctions[mspCMD.MSP_FC_VERSION] = function(mspMsg) {
  return <div>
    <div>MSP_FC_VERSION</div>
    <div>{mspMsg.buffer.map(v => hexInt8(v))}</div>
    </div>
}
mspOutputFunctions[mspCMD.MSP_IDENT] = function(mspMsg) {
  return <div>
    <div>MSP_IDENT</div>
    <div>{mspMsg.buffer.map(v => hexInt8(v))}</div>
    </div>
}

