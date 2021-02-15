const SerialPort = require('serialport')

const port1 = new SerialPort('COM17', { baudRate: 115200 })

port1.value.on('data', function (data) {
  const timestamp = new Date().getTime();
  console.log('port1' + timestamp)
})

const port2 = new SerialPort('COM16', { baudRate: 115200 })

port2.value.on('data', function (data) {
  const timestamp = new Date().getTime();
  console.log('port2' + timestamp)
})