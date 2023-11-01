// vim: ts=2:sts=2:sw=2:et:ai

import dotenv from "dotenv";
dotenv.config({ path: 'test/files/test.env' });

import { LogFilter } from "../src/LogFilter";

const testInput = [
  "This is in the first buffer.",
  "This crosses boundary.",
  "This does not."
];

export const TestGenerator = async function*() : AsyncGenerator<string> {
  // Cannot delegate iteration to value because the 'next' method of its iterator expects type 'undefined', but the containing generator will always send 'unknown'.
  // yield* testInput;
  for (const line of testInput) {
    yield line;
  }
}

// Gather the outputs of an AsyncGenerator into an array.
const accumulator = async (lf: LogFilter) => {
  const result = [];
  for await (const value of lf) {
    result.push(value);
  }
  return result;
}

describe("LogFilter", () => {
  test("catch them all", async () => {
    const result = await accumulator(new LogFilter(TestGenerator(), {}));
    expect(result).toEqual(testInput);
  });

  test("limit 2", async () => {
    const result = await accumulator(new LogFilter(TestGenerator(), {maxCount: 2}));
    expect(result).toEqual(testInput.slice(0,2));
  });

  test("limit 5", async () => {
    const result = await accumulator(new LogFilter(TestGenerator(), {maxCount: 5}));
    expect(result).toEqual(testInput);
  });

  test("match them all", async () => {
    const result = await accumulator(new LogFilter(TestGenerator(), {regex: '.'}));
    expect(result).toEqual(testInput);
  });

  test("match 1", async () => {
    const result = await accumulator(new LogFilter(TestGenerator(), {regex: 'not'}));
    expect(result).toEqual(testInput.slice(2,3));
  });

  test("match 2", async () => {
    const result = await accumulator(new LogFilter(TestGenerator(), {regex: 'o'}));
    expect(result).toEqual(testInput.slice(1,3));
  });

  test("match 2, limit 1", async () => {
    const result = await accumulator(new LogFilter(TestGenerator(), {regex: 'o', maxCount: 1}));
    expect(result).toEqual(testInput.slice(1,2));
  });

  test("match none", async () => {
    const result = await accumulator(new LogFilter(TestGenerator(), {regex: 'miss'}));
    expect(result).toEqual([]);
  });
});
