import { MspCmd } from '../msp/Msp'
import { MspParser } from './MspParser'
import { identity } from 'rxjs'

test('parseDataBuffer ""', () => {
  const mockCallback = jest.fn(identity)
  const parser = new MspParser()
  parser.on('data', mockCallback)
  parser.write(Buffer.from([0x24, 0x58, 0x3e, 0x00, 0x64, 0x00, 0x00, 0x00, 0x8f]))
  expect(mockCallback).toBeCalled()
  expect(mockCallback.mock.calls.length).toBe(1)
  expect(mockCallback.mock.calls[0][0]).toMatchObject({
    cmd: MspCmd.MSP_IDENT,
    buffer: []
  })
})

test('parseDataBuffer "Hello flying world"', () => {
  const mockCallback = jest.fn(identity)
  const parser = new MspParser()
  parser.on('data', mockCallback)
  parser.write(Buffer.from([0x24, 0x58, 0x3e, 0xa5, 0x42, 0x42, 0x12, 0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x66, 0x6c, 0x79, 0x69, 0x6e, 0x67, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x82]))
  expect(mockCallback).toBeCalled()
  expect(mockCallback.mock.calls.length).toBe(1)
  expect(mockCallback.mock.calls[0][0]).toMatchObject({
    cmd: 0x4242,
    buffer: [0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x66, 0x6c, 0x79, 0x69, 0x6e, 0x67, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64]
  })
})

test('parseDataBuffer MSP Error', () => {
  const mockCallback = jest.fn(identity)
  const parser = new MspParser()
  parser.on('data', mockCallback)
  parser.write(Buffer.from([0x24, 0x58, 0x21]))
  expect(mockCallback).toBeCalled()
  expect(mockCallback.mock.calls.length).toBe(1)
  expect(mockCallback.mock.calls[0][0]).toMatchObject(new Error())
})
