"use strict"
//import {adapt} from '@cycle/run/lib/adapt';
const SerialPort = require('serialport');
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 });
const protocol = require('./protocol');

const mspState =
{
  MSP_IDLE: "idle",
  MSP_HEADER_START: "header start",
  MSP_HEADER_X: "header x",
  MSP_HEADER_V2_NATIVE: "header",
  MSP_PAYLOAD_V2_NATIVE: "payload",
  MSP_CHECKSUM_V2_NATIVE: "checksum",
  MSP_COMMAND_RECEIVED: "command received"
}

const mspCommand =
{
  cmd: 0,
  payload: []
}

const mspMsg =
{
  state: mspState.MSP_IDLE,
  flag: 0,
  cmd: 0,
  length: 0,
  buffer: [],
  checksum: 0
}

const hexInt16 = data => [data & 0x00FF, data & 0xFF00];

const checksum = bytes => bytes.reduce((crc, b) => crc8_dvb_s2(crc, b), 0);

function mspDriver(outgoing$) {
  outgoing$.addListener(
  {
    next: outgoing =>
    {
      const cmd = command(outgoing.cmd, outgoing.payload);
      port.write(Buffer.from(cmd));
    },
    error: () => {},
    complete: () => {},
  });

  const incoming$ = xs.create(
  {
    start: listener =>
    {
      port.on('data', function (data)
      {
        for (var i = 0; i < data.length; i++)
        {
          parseMSPCommand(data.readInt8(i));
          if (mspMsg.state == mspState.MSP_COMMAND_RECEIVED)
          {
            console.log("SUCCESS");
            listener.next(msg)
            mspMsg.state = mspState.MSP_IDLE;
          }
        }
      });
    },
    stop: () => {},
  });
  return adapt(incoming$);
}

function command(cmd, payload)
{
  const flag = 0;
  const content = [].concat([flag],hexInt16(cmd),hexInt16(payload.size),payload);
  return [].concat(protocol.mspCMDHeader.split("").map(ch => ch.charCodeAt(0)),content,[checksum(content)]);
}

function parseMSPCommand(num)
{
  //console.log(num);
  console.log(hexInt8(num));
  switch (mspMsg.state)
  {
    case mspState.MSP_IDLE:
      if (String.fromCharCode(num) == '$')
        mspMsg.state = mspState.MSP_HEADER_START;
      break;
    case mspState.MSP_HEADER_START:
      mspMsg.buffer = [];
      mspMsg.checksum = 0;
      if (String.fromCharCode(num) == 'X')
        mspMsg.state = mspState.MSP_HEADER_X;
      break;
    case mspState.MSP_HEADER_X:
      if (String.fromCharCode(num) == '>')
        mspMsg.state = mspState.MSP_HEADER_V2_NATIVE;
      break;
    case mspState.MSP_HEADER_V2_NATIVE:
      mspMsg.buffer.push(num);
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, num);
      if (mspMsg.buffer.length == 5)
      {
        mspMsg.flag = getFlag(mspMsg.buffer);
        mspMsg.cmd = getCmd(mspMsg.buffer);
        mspMsg.length = getLength(mspMsg.buffer);
        mspMsg.buffer = [];
        if (mspMsg.length > 0)
          mspMsg.state = mspState.MSP_PAYLOAD_V2_NATIVE;
        else
          mspMsg.state = mspState.MSP_CHECKSUM_V2_NATIVE;
      }
      break;
    case mspState.MSP_PAYLOAD_V2_NATIVE:
      mspMsg.buffer.push(num);
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, num);
      mspMsg.length--;
      if (mspMsg.length == 0)
        mspMsg.state = mspState.MSP_CHECKSUM_V2_NATIVE;
      break;
    case mspState.MSP_CHECKSUM_V2_NATIVE:
      if (mspMsg.checksum == num)
        mspMsg.state = mspState.MSP_COMMAND_RECEIVED;
      else
        mspMsg.state = mspState.MSP_IDLE;
      break;
    default:
      mspMsg.state = mspState.MSP_IDLE;
      break;
  }
  console.log("state " + mspMsg.state);
}
// port.on('readable', function ()
// {
//   console.log('Data:', port.read())
// })
// port.on('data', function (data)
// {
//   console.log('Data:', data)
// })

function crc8_dvb_s2(crc, num)
{
  crc = (crc ^ num) & 0xFF;
  for (let i = 0; i < 8; ++i)
    if ((crc & 0x80) != 0)
      crc = ((crc << 1) ^ 0xD5) & 0xFF;
    else
      crc = (crc << 1) & 0xFF;
  return crc;
}
