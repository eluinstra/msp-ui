const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 });
const lineStream = port.pipe(new Readline());
const protocol = require('./protocol');
const { FlowFlags } = require('typescript');

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

const mspMsg =
{
  state: mspState.MSP_IDLE,
  flag: 0,
  cmd: 0,
  length: 0,
  buffer: [],
  checksum: 0
}
// {
//   port = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 }),
//     mspState_e c_state;
//   uint8_t inBuf[MSP_PORT_INBUF_SIZE];
//   uint16_t cmdMSP;
//   uint8_t cmdFlags;
//   uint_fast16_t offset;
//   uint_fast16_t dataSize;
//   uint8_t checksum2;
// }

const hexInt = (num, width) => num.toString(16).padStart(width,"0").toUpperCase();

const hexInt8 = num => hexInt(num,2);

const int16ToHexStr = num => "0x" + hexInt8(num & 0xFF00) + hexInt8(num & 0x00FF);

const byteArrayToHexStr = bytes => bytes.reduce((acc, b) => acc + "0x" + b.toString(16).padStart(2,"0").toUpperCase(),"");

const checksum = bytes => bytes.reduce((crc, b) => crc8_dvb_s2(crc, b), 0);

const hexInt16 = data => [data & 0x00FF, data & 0xFF00];

const toByteArray = str => str.split("").map(ch => ch.charCodeAt(0));

const toByteBuffer = str => Buffer.from(toByteArray(str));

const getFlag = data => data[0];

const getCmd = data => (data[2] << 8) + data[1];

const getLength = data => (data[4] << 8) + data[3];

port.on('data', function (data)
{
  for (var i = 0; i < data.length; i++)
    parseMSPCommand(data.readInt8(i));
})

function command(cmd, payload)
{
  const flag = 0;
  const content = [].concat([flag],hexInt16(cmd),hexInt16(payload.size),payload);
  return [].concat(protocol.mspCMDHeader.split("").map(ch => ch.charCodeAt(0)),content,[checksum(content)]);
}

function parseMSPCommand(ch)
{
  console.log(ch);
  switch (mspMsg.state)
  {
    case mspState.MSP_IDLE:
      if (String.fromCharCode(ch) == '$')
        mspMsg.state = mspState.MSP_HEADER_START;
      break;
    case mspState.MSP_HEADER_START:
      mspMsg.buffer = [];
      mspMsg.checksum = 0;
      if (String.fromCharCode(ch) == 'X')
        mspMsg.state = mspState.MSP_HEADER_X;
      break;
    case mspState.MSP_HEADER_X:
      if (String.fromCharCode(ch) == '>')
        mspMsg.state = mspState.MSP_HEADER_V2_NATIVE;
      break;
    case mspState.MSP_HEADER_V2_NATIVE:
      mspMsg.buffer.push(ch);
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, ch);
      if (mspMsg.buffer.length == 5)
      {
        mspMsg.flag = getFlag(mspMsg.buffer);
        mspMsg.cmd = getCmd(mspMsg.buffer);
        mspMsg.length = getLength(mspMsg.buffer);
        mspMsg.buffer = [];
        console.log("length: " + mspMsg.length);
        if (mspMsg.length > 0)
          mspMsg.state = mspState.MSP_PAYLOAD_V2_NATIVE;
        else
          mspMsg.state = mspState.MSP_CHECKSUM_V2_NATIVE;
      }
      break;
    case mspState.MSP_PAYLOAD_V2_NATIVE:
      mspMsg.buffer.push(ch);
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, ch);
      mspMsg.length--;
      if (mspMsg.length == 0)
        mspMsg.state = mspState.MSP_CHECKSUM_V2_NATIVE;
      break;
    case mspState.MSP_CHECKSUM_V2_NATIVE:
      console.log(ch + " " + mspMsg.checksum);
      if (mspMsg.checksum == ch)
        console.log("SUCCESS");
      //   mspMsg.state = MSP_COMMAND_RECEIVED;
      // else
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

function crc8_dvb_s2(crc, ch)
{
  crc = (crc ^ ch) & 0xFF;
  for (let i = 0; i < 8; ++i)
    if ((crc & 0x80) != 0)
      crc = ((crc << 1) ^ 0xD5) & 0xFF;
    else
      crc = (crc << 1) & 0xFF;
  return crc;
}

function crc8_dvb_s2_update(crc, data, length)
{
  //return data.reduce((acc, b) => crc8_dvb_s2(crc,data[i]));
  for (i = 0; i < length; i++)
    crc = crc8_dvb_s2(crc,data[i]);
  return crc;
}

const CMD = '$X<\x00\x64\x00\x00\x00\x8F';
console.log(toByteBuffer(CMD));
port.write(toByteBuffer(CMD));

const CMD1 = command(protocol.mspCMD.MSP_IDENT,[]);
console.log(Buffer.from(CMD1));
port.write(Buffer.from(CMD1));

console.log(int16ToHexStr(1));

console.log(checksum([0x00, 0xFF, 0xFF, 0x07, 0x00, 0x02, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00]));
console.log(checksum([0x00, 0x64, 0x00, 0x00, 0x00]));