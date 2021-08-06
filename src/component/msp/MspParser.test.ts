// import rewire from 'rewire';
import { BehaviorSubject, Subject } from 'rxjs';
import { checksum, createMspInternalMsg, MspMsg, MspState, parseDataBuffer, toInt16LE } from './MspParser';
import { MspCmd } from './MspProtocol';
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
  const response$ = new BehaviorSubject<MspMsg>(null);
  const error$ = new BehaviorSubject<Error>(null);
  parseDataBuffer(mspMsg, response$, error$, data)
  const { state, cmd, length, buffer } = mspMsg
  expect(state).toBe(MspState.MSP_IDLE)
  expect(cmd).toBe(MspCmd.MSP_IDENT)
  expect(length).toBe(0)
  expect(buffer).toMatchObject([])
  expect(response$.getValue()).toMatchObject({
    cmd: MspCmd.MSP_IDENT,
    buffer: []
  })
  expect(error$.getValue()).toBe(null)
})

test('parseDataBuffer "Hello flying world"', () => {
  const mspMsg = createMspInternalMsg()
  const data = Buffer.from([0x24, 0x58, 0x3e, 0xa5, 0x42, 0x42, 0x12, 0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x66, 0x6c, 0x79, 0x69, 0x6e, 0x67, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x82])
  const response$ = new BehaviorSubject<MspMsg>(null);
  const error$ = new BehaviorSubject<Error>(null);
  parseDataBuffer(mspMsg, response$, error$, data)
  const { state, cmd, flag, length, buffer } = mspMsg
  expect(state).toBe(MspState.MSP_IDLE)
  expect(cmd).toBe(0x4242)
  expect(flag).toBe(0xa5)
  expect(length).toBe(0)
  expect(buffer).toMatchObject([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x66, 0x6c, 0x79, 0x69, 0x6e, 0x67, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64])
  expect(response$.getValue()).toMatchObject({
    cmd: 0x4242,
    buffer: [0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x66, 0x6c, 0x79, 0x69, 0x6e, 0x67, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64]
  })
  expect(error$.getValue()).toBe(null)
})

test('parseDataBuffer MSP Error', () => {
  const mspMsg = createMspInternalMsg()
  const data = Buffer.from([0x24, 0x58, 0x21])
  const response$ = new BehaviorSubject<MspMsg>(null);
  const error$ = new BehaviorSubject<Error>(null);
  parseDataBuffer(mspMsg, response$, error$, data)
  const { state, cmd, flag, length, buffer } = mspMsg
  expect(state).toBe(MspState.MSP_IDLE)
  expect(cmd).toBe(0)
  expect(flag).toBe(0)
  expect(length).toBe(0)
  expect(buffer).toMatchObject([])
  expect(response$.getValue()).toBe(null)
  expect(error$.getValue()).toMatchObject(new Error())
})

test.each([
  [[0x24, 0x58, 0x3c, 0x00, 0x64, 0x00, 0x00, 0x00, 0x8f], 0],
  [[0x24, 0x58, 0x3e, 0x00, 0x64, 0x00, 0x00, 0x00, 0x80], MspCmd.MSP_IDENT]
])('parseDataBuffer Invalid message %j', (array, expectedCmd) => {
  const mspMsg = createMspInternalMsg()
  const data = Buffer.from(array)
  const response$ = new BehaviorSubject<MspMsg>(null);
  const error$ = new BehaviorSubject<Error>(null);
  parseDataBuffer(mspMsg, response$, error$, data)
  const { state, cmd, length, buffer } = mspMsg
  expect(state).toBe(MspState.MSP_IDLE)
  expect(cmd).toBe(expectedCmd)
  expect(length).toBe(0)
  expect(buffer).toMatchObject([])
  expect(response$.getValue()).toBe(null)
  expect(error$.getValue()).toBe(null)
})
