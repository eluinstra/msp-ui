const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 })

const lineStream = port.pipe(new Readline())

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

var state = mspState.MSP_IDLE; 

port.on('data', function(data)
{
  for (var i = 0; i < data.length; i++)
  {
    console.log(data.readInt8(i));
    parseMSPCommand(data.readInt8(i));
  }
})

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
port.write(toCharArray('$X<\x00\x64\x00\x00\x00\x8F'))

function toCharArray(str)
{
  var arr = [];
  for (var i = 0; i < str.length; i ++)
  {
    var ch = str.charCodeAt(i);
    arr.push(ch);
  }
  return Buffer.from(arr);
}
