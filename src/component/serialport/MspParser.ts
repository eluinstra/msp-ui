import { Transform } from "stream";
import { createMspMsgState, MspMsgState, MspState, parseNextCharCode } from "@/component/msp/MspParser";

export interface MspMsg {
  cmd: number,
  buffer: number[]
}

export class MspParser extends Transform {
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
      this.push(this.toMspMsg())
      msgState.state = MspState.MSP_IDLE
    } else if (msgState.state == MspState.MSP_ERROR_RECEIVED) {
      this.push(new Error())
      msgState.state = MspState.MSP_IDLE
    }
  }

  private toMspMsg = (): MspMsg  => {
    const msgState = this.msgState
    return { cmd: msgState.cmd, buffer: msgState.buffer }
  }
  
}
