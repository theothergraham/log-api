// vim: ts=2:sts=2:sw=2:et:ai

import dotenv from "dotenv";
dotenv.config({ path: 'test/files/test.env' });

import { LogReader } from "../src/LogReader";

// Gather the outputs of an AsyncGenerator into an array.
const accumulator = async (ag: AsyncGenerator) => {
  const result = [];
  for await (const value of ag) {
    result.push(value);
  }
  return result;
}

describe("LogReader", () => {
  test("one line", async () => {
    const result = await accumulator(LogReader("one_line.log"));
    expect(result).toEqual([
      "Just one line."
    ]);
  });

  test("incomplete last line", async () => {
    const result = await accumulator(LogReader("incomplete.log"));
    expect(result).toEqual([
      "Full line."
    ]);
  });

  test("two lines", async () => {
    const result = await accumulator(LogReader("two_lines.log"));
    expect(result).toEqual([
      "Just one line.",
      "Actually two."
    ]);
  });

  test("cross buffer boundary", async () => {
    const result = await accumulator(LogReader("cross_buffers.log"));
    expect(result).toEqual([
      "This is in the first buffer.",
      "This crosses boundary.",
      "This does not."
    ]);
  });

  test("longest line allowed", async () => {
    const result = await accumulator(LogReader("longest_line.log"));
    expect(result).toEqual([
      "Because EOL must be found on each end.",
      "Each line is the longest that fits ok.",
      "12345678901234567890123456789012345678"
    ]);
  });

  test("line too long", async () => {
    const lr = LogReader("line_too_long.log");
    expect(lr.next()).rejects.toThrow(/line too long/);
  });

  test("second line too long", async () => {
    const lr = LogReader("line_too_long_2.log");
    expect(lr.next()).resolves.toHaveProperty('value', 'Short line.');
    expect(lr.next()).rejects.toThrow(/line too long/);
  });

});

