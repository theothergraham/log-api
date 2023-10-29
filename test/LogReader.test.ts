// vim: ts=2:sts=2:sw=2:et:ai

import dotenv from "dotenv";
dotenv.config({ path: 'test/files/test.env' });

import { LogReader } from "../src/LogReader";

describe("LogReader", () => {
  test("one line", () => {
    const lr = new LogReader("one_line.log");
    const line1 = lr.getNextLine();
    expect(line1).toBe("Just one line.");
    const line2 = lr.getNextLine();
    expect(line2).toBeNull();
  });

  test("incomplete last line", () => {
    const lr = new LogReader("incomplete.log");
    const line1 = lr.getNextLine();
    expect(line1).toBe("Full line.");
  });

  test("two lines", () => {
    const lr = new LogReader("two_lines.log");
    const line1 = lr.getNextLine();
    expect(line1).toBe("Just one line.");
    const line2 = lr.getNextLine();
    expect(line2).toBe("Actually two.");
    const line3 = lr.getNextLine();
    expect(line3).toBeNull();
  });
});

