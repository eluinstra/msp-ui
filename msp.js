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

// const mspPort =
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

var state = mspState.MSP_IDLE;

port.on('data', function (data)
{
  for (var i = 0; i < data.length; i++)
  {
    console.log(data.readInt8(i));
    parseMSPCommand(data.readInt8(i));
  }
})

function command(cmd, payload)
{
  const flag = 0;
  const content = [].concat([flag],to16Bit(cmd),to16Bit(payload.size));// + payload;
  return [].concat(protocol.mspCMDHeader.split("").map(ch => ch.charCodeAt(0)),content,[checksum(content)]);
}

function checksum(bytes)
{
  return bytes.reduce((crc, b) => crc8_dvb_s2(crc, b), 0);
}

function to16Bit(data)
{
  return [data & 0x00FF, data & 0xFF00];
}

function parseMSPCommand(ch)
{
  switch (state)
  {
    case mspState.MSP_IDLE:
      if (String.fromCharCode(ch) == '$')
      {
        console.log("msp header");
        state = mspState.MSP_HEADER_START;
      }
      break;
    case mspState.MSP_HEADER_START:
      if (String.fromCharCode(ch) == 'X')
      {
        console.log("msp v2");
        state = mspState.MSP_HEADER_X;
      }
      break;
    case mspState.MSP_HEADER_X:
      if (String.fromCharCode(ch) == '>')
      {
        console.log("msp response");
        state = mspState.MSP_IDLE;
      }
      break;
    default:
      state = mspState.MSP_IDLE;
      break;
  }
}
// port.on('readable', function ()
// {
//   console.log('Data:', port.read())
// })
// port.on('data', function (data)
// {
//   console.log('Data:', data)
// })
const CMD = '$X<\x00\x64\x00\x00\x00\x8F';
console.log(toByteBuffer(CMD));
port.write(toByteBuffer(CMD));

const CMD1 = command(protocol.mspCMD.MSP_IDENT,"");
console.log(CMD1);
port.write(Buffer.from(CMD1));

function number16AsHexStr(num)
{
  var high = num & 0xFF00;
  var low = num & 0x00FF;
  return ("0x" + high.toString(16).padStart(2,"0").toUpperCase() + low.toString(16).padStart(2,"0").toUpperCase());
}

function byteArrayAsHexStr(bytes)
{
  return bytes.reduce((acc, b) => acc + "0x" + b.toString(16).padStart(2,"0").toUpperCase(),"");
}

function toByteBuffer(str)
{
  return Buffer.from(str.split("").map(ch => ch.charCodeAt(0)));
}

function crc8_dvb_s2(crc, ch)
{
  crc = (crc ^ ch) % 256;
  for (let i = 0; i < 8; ++i)
    if ((crc & 0x80) != 0)
      crc = ((crc << 1) ^ 0xD5) % 256;
    else
      crc = (crc << 1) % 256;
  return crc;
}

function crc8_dvb_s2_update(crc, data, length)
{
  //return data.reduce((acc, b) => crc8_dvb_s2(crc,data[i]));
  for (i = 0; i < length; i++)
  {
    crc = crc8_dvb_s2(crc,data[i]);
  }
  return crc;
}
