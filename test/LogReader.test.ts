// vim: ts=2:sts=2:sw=2:et:ai

import dotenv from "dotenv";
dotenv.config({ path: 'test/files/test.env' });

import { LogReader } from "../src/LogReader";

describe("LogReader", () => {
  test("one line", () => {
    const lr = new LogReader("one_line.log");
    expect([...lr]).toEqual([
      "Just one line."
    ]);
  });

  test("incomplete last line", () => {
    const lr = new LogReader("incomplete.log");
    expect([...lr]).toEqual([
      "Full line."
    ]);
  });

  test("two lines", () => {
    const lr = new LogReader("two_lines.log");
    expect([...lr]).toEqual([
      "Just one line.",
      "Actually two."
    ]);
  });

  test("cross buffer boundary", () => {
    const lr = new LogReader("cross_buffers.log");
    expect([...lr]).toEqual([
      "This is in the first buffer.",
      "This crosses boundary.",
      "This does not."
    ]);
  });

  test("longest line allowed", () => {
    const lr = new LogReader("longest_line.log");
    expect([...lr]).toEqual([
      "Because EOL must be found on each end.",
      "Each line is the longest that fits ok.",
      "12345678901234567890123456789012345678"
    ]);
  });

  test("line too long", () => {
    const lr = new LogReader("line_too_long.log");
    expect(() => { lr.next(); }).toThrow();
  });

  test("second line too long", () => {
    const lr = new LogReader("line_too_long_2.log");
    expect(lr.next()).toEqual({ value: "Short line." });
    expect(() => { lr.next(); }).toThrow();
  });
});

