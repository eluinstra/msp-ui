import { Transform } from "stream";
import { checksum, mspCmdHeader, MspMsg } from "../msp/Msp";

export class MspEncoder extends Transform {
  constructor(options = {}) {
    super({ ...options, objectMode: true })
  }

  _transform(buffer, _, cb) {
    cb(null, Buffer.from(encode(buffer)))
  }
}

const encode = ({ cmd, buffer, flag = 0 }: MspMsg) => {
  const content = [].concat([flag], numberToInt16LE(cmd), numberToInt16LE(buffer.length), buffer)
  return [].concat(mspCmdHeader.split('').map(ch => ch.charCodeAt(0)), content, [checksum(content)])
}

export const numberToInt16LE = (n: number) => [n & 0x00FF, (n & 0xFF00) >> 8]

export const stringToCharArray = (buffer: string): number[] => {
  return buffer.split('').map(ch => ch.charCodeAt(0));
}

