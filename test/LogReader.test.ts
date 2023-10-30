// vim: ts=2:sts=2:sw=2:et:ai

import dotenv from "dotenv";
dotenv.config({ path: 'test/files/test.env' });

import { LogReader } from "../src/LogReader";

describe("LogReader", () => {
  test("one line", () => {
    const lr = new LogReader("one_line.log");
    expect(lr.getNextLine()).toBe("Just one line.");
    expect(lr.getNextLine()).toBeNull();
  });

  test("incomplete last line", () => {
    const lr = new LogReader("incomplete.log");
    expect(lr.getNextLine()).toBe("Full line.");
  });

  test("two lines", () => {
    const lr = new LogReader("two_lines.log");
    expect(lr.getNextLine()).toBe("Just one line.");
    expect(lr.getNextLine()).toBe("Actually two.");
    expect(lr.getNextLine()).toBeNull();
  });

  test("cross buffer boundary", () => {
    const lr = new LogReader("cross_buffers.log");
    expect(lr.getNextLine()).toBe("This is in the first buffer.");
    expect(lr.getNextLine()).toBe("This crosses boundary.");
    expect(lr.getNextLine()).toBe("This does not.");
  });

  test("longest line allowed", () => {
    const lr = new LogReader("longest_line.log");
    expect(lr.getNextLine()).toBe("Because EOL must be found on each end.");
    expect(lr.getNextLine()).toBe("Each line is the longest that fits ok.");
    expect(lr.getNextLine()).toBe("12345678901234567890123456789012345678");
  });

  test("line too long", () => {
    const lr = new LogReader("line_too_long.log");
    expect(() => { lr.getNextLine(); }).toThrow();
  });

  test("second line too long", () => {
    const lr = new LogReader("line_too_long_2.log");
    expect(lr.getNextLine()).toBe("Short line.");
    expect(() => { lr.getNextLine(); }).toThrow();
  });
});

