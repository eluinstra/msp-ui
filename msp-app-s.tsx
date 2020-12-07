import { remote } from 'electron'
const SerialPort = remote.require('serialport')
import { mspCMD, mspCMDHeader, mspMessageType } from './protocol.js';

const mspState = {
  MSP_IDLE: "idle",
  MSP_HEADER_START: "header start",
  MSP_HEADER_X: "header x",
  MSP_HEADER_V2_NATIVE: "header",
  MSP_PAYLOAD_V2_NATIVE: "payload",
  MSP_CHECKSUM_V2_NATIVE: "checksum",
  MSP_COMMAND_RECEIVED: "command received"
}

const mspMsg = {
  state: mspState.MSP_IDLE,
  flag: 0,
  cmd: 0,
  length: 0,
  buffer: [],
  checksum: 0
}

const mspOutputFunctions = [];
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

const hexInt = (num, width) => num.toString(16).padStart(width,"0").toUpperCase();

const hexInt8 = num => hexInt(num & 0xFF,2);

const hexInt16 = data => [data & 0x00FF, data & 0xFF00]

const checksum = bytes => bytes.reduce((crc, b) => crc8_dvb_s2(crc, b), 0)

function crc8_dvb_s2(crc, num) {
  crc = (crc ^ num) & 0xFF
  for (let i = 0; i < 8; i++)
    if ((crc & 0x80) != 0)
      crc = ((crc << 1) ^ 0xD5) & 0xFF
    else
      crc = (crc << 1) & 0xFF
  return crc
}

const getFlag = data => data[0]

const getCmd = data => (data[2] << 8) + data[1]

const getLength = data => (data[4] << 8) + data[3]

const port = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 })

port.on('data', function (data) {
  for (let i = 0; i < data.length; i++) {
    parseMSPCommand(data.readInt8(i))
    if (mspMsg.state == mspState.MSP_COMMAND_RECEIVED) {
      // console.log("SUCCESS")
      mspOutput.innerHTML = "SUCCESS " + mspOutputFunctions[mspMsg.cmd](mspMsg)
      mspMsg.state = mspState.MSP_IDLE
    }
  }
})

function parseMSPCommand(num) {
  //console.log(num & 0xFF)
  //console.log(hexInt8(num & 0xFF))
  switch (mspMsg.state) {
    case mspState.MSP_IDLE:
      if (String.fromCharCode(num) == '$')
        mspMsg.state = mspState.MSP_HEADER_START
      break
    case mspState.MSP_HEADER_START:
      mspMsg.buffer = []
      mspMsg.checksum = 0
      if (String.fromCharCode(num) == 'X')
        mspMsg.state = mspState.MSP_HEADER_X
      break
    case mspState.MSP_HEADER_X:
      if (String.fromCharCode(num) == '>')
        mspMsg.state = mspState.MSP_HEADER_V2_NATIVE
      else if (String.fromCharCode(num) == '!')
        mspMsg.state = mspState.MSP_IDLE
      break
    case mspState.MSP_HEADER_V2_NATIVE:
      mspMsg.buffer.push(num & 0xFF)
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, num)
      if (mspMsg.buffer.length == 5) {
        mspMsg.flag = getFlag(mspMsg.buffer)
        mspMsg.cmd = getCmd(mspMsg.buffer)
        mspMsg.length = getLength(mspMsg.buffer)
        mspMsg.buffer = []
        if (mspMsg.length > 0)
          mspMsg.state = mspState.MSP_PAYLOAD_V2_NATIVE
        else
          mspMsg.state = mspState.MSP_CHECKSUM_V2_NATIVE
      }
      break
    case mspState.MSP_PAYLOAD_V2_NATIVE:
      mspMsg.buffer.push(num & 0xFF)
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, num)
      mspMsg.length--
      if (mspMsg.length == 0)
        mspMsg.state = mspState.MSP_CHECKSUM_V2_NATIVE
      break
    case mspState.MSP_CHECKSUM_V2_NATIVE:
      if (mspMsg.checksum == (num & 0xFF))
        mspMsg.state = mspState.MSP_COMMAND_RECEIVED
      else
        mspMsg.state = mspState.MSP_IDLE
      break
    default:
      mspMsg.state = mspState.MSP_IDLE
      break
  }
  //console.log("state " + mspMsg.state)
}

const mspButton = document.getElementById('mspButton')
const mspInput = document.getElementById('mspInput')
const mspOutput = document.getElementById('mspOutput')

function command(cmd, payload) {
  const flag = 0
  const content = [].concat([flag],hexInt16(cmd),hexInt16(payload.size),payload)
  return [].concat(mspCMDHeader.split("").map(ch => ch.charCodeAt(0)),content,[checksum(content)])
}

mspButton.addEventListener('click', () => {
  mspOutput.innerHTML = ""
  // const CMD = command(mspInput["value"],[])
  const CMD = command((mspInput as HTMLInputElement).value,[])
  console.log(Buffer.from(CMD))
  port.write(Buffer.from(CMD))
})
