// vim: ts=2:sts=2:sw=2:et:ai

import { openSync, readSync, closeSync } from 'fs';
import { EOL } from 'os';

export class LogReader {
  // TODO config : LogReaderConfig
  fileName : string;
  buffer : Buffer;

  constructor() {
    this.fileName = "/tmp/test_file";
    this.buffer = Buffer.alloc(16384);
  }

  // NOTE This gets the last *complete* line, a partial line will be ignored.
  // TODO Needs sanity checking to make sure we found lineEnd, lineStart.
  // TODO Needs to return just the line, or some EOF indicator.
  // TODO Needs unit tests.
  // TODO Needs to become getNextLine() so we can go through the whole file.
  // TODO Maybe could be an interator that yields lines?
  getLastLine() {
    const fd = openSync(this.fileName, 'r');
    const bytesRead = readSync(fd, this.buffer, 0 /* buffer offet */, 16384, 0 /* file offset */);
    closeSync(fd);
    const lineEnd = this.buffer.lastIndexOf(EOL);
    const lineStart = this.buffer.lastIndexOf(EOL, lineEnd - 1);
    const lineStr = this.buffer.toString('utf8', lineStart + EOL.length, lineEnd);
    return {file_name: this.fileName, bytes_read: bytesRead, start: lineStart, end: lineEnd, line: lineStr};
  }
}

