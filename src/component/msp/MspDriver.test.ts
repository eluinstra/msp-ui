import { toInt16 } from "@/component/msp/MspDriver"

test("Dummy unit test", () => {
  const actual = toInt16("10");
  expect(actual).toBe(10);
});