// import rewire from 'rewire';
import { Subject } from 'rxjs';
import { checksum, createMspInternalMsg, MspMsg, MspState, parseDataBuffer, toInt16LE } from './MspParser'
import { MspCmd } from './MspProtocol'
/*
const MspParser = rewire("./MspParser");
const getFlag = MspParser.__get__("getFlag");

test("", () => {
  expect(getFlag([1])).toBe(1)
})
*/
test.each([
  ['0', [0, 0]],
  ['256', [0, 1]]
])('toInt16(%i)', (value, expected) => {
  const actual = toInt16LE(value);
  expect(actual).toMatchObject(expected);
})

test.each([
  [[0x00, 0x64, 0x00, 0x00, 0x00], 0x8f],
  [[0xa5, 0x42, 0x42, 0x12, 0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x66, 0x6c, 0x79, 0x69, 0x6e, 0x67, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64], 0x82]
])('checksum(%j)', (array, expected) => {
  const actual = checksum(array)
  expect(actual).toBe(expected)
})

test('parseDataBuffer ""', () => {
  const mspMsg = createMspInternalMsg()
  const data = Buffer.from([0x24, 0x58, 0x3e, 0x00, 0x64, 0x00, 0x00, 0x00, 0x8f])
  parseDataBuffer(mspMsg, new Subject<MspMsg>(), new Subject<MspMsg>(), data)
  const { state, cmd, length, buffer } = mspMsg
  expect(state).toBe(MspState.MSP_IDLE)
  expect(cmd).toBe(MspCmd.MSP_IDENT)
  expect(length).toBe(0)
  expect(buffer).toMatchObject([])
})

test('parseDataBuffer "Hello flying world"', () => {
  const mspMsg = createMspInternalMsg()
  const data = Buffer.from([0x24, 0x58, 0x3e, 0xa5, 0x42, 0x42, 0x12, 0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x66, 0x6c, 0x79, 0x69, 0x6e, 0x67, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x82])
  parseDataBuffer(mspMsg, new Subject<MspMsg>(), new Subject<MspMsg>(), data)
  const { state, cmd, flag, length, buffer } = mspMsg
  expect(state).toBe(MspState.MSP_IDLE)
  expect(cmd).toBe(0x4242)
  expect(flag).toBe(0xa5)
  expect(length).toBe(0)
  expect(buffer).toMatchObject([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x66, 0x6c, 0x79, 0x69, 0x6e, 0x67, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64])
})