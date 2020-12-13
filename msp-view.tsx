import { mspCMD } from './protocol.js'

const hexInt = (num, width) => num.toString(16).padStart(width,"0").toUpperCase();
const hexInt8 = num => hexInt(num & 0xFF,2);

export const mspOutputFunctions = [];

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
