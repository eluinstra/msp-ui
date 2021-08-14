import { Transform } from "stream";
import { MspMsg } from "../msp/Msp";
import { createMspMsgState, MspMsgState, MspState, parseNextCharCode } from "../msp/MspParser";

export class MspDecoder extends Transform {
  msgState: MspMsgState

  constructor(options = {}) {
    super({ ...options, objectMode: true })
    this.msgState = createMspMsgState()
  }

  _transform(buffer, _, cb) {
    const data = Buffer.from(buffer)
    for (let i = 0; i < data.length; i++) {
      parseNextCharCode(this.msgState, data.readInt8(i))
      this.applyMsgState()
    }
    cb()
  }

  private applyMsgState = () => {
    const msgState = this.msgState
    if (msgState.state == MspState.MSP_COMMAND_RECEIVED) {
      this.push(toMspMsg(msgState))
      msgState.state = MspState.MSP_IDLE
    } else if (msgState.state == MspState.MSP_ERROR_RECEIVED) {
      this.push(new Error())
      msgState.state = MspState.MSP_IDLE
    }
  }

}

const toMspMsg = ({ cmd, flag = 0, buffer }): MspMsg  => {
  return { cmd: cmd, flag: flag, buffer: buffer }
}
