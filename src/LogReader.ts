// vim: ts=2:sts=2:sw=2:et:ai

import { statSync, openSync, readSync, closeSync } from 'fs';
import { EOL } from 'os';

// TODO make a lot of this private, maybe some readonly.

export class LogReader {
  // TODO config : LogReaderConfig
  fileName : string;
  fileSize : number;
  filePosition : number;
  fd : number;
  buffer : Buffer;
  bufferSize : number;
  bufferPosition : number;

  constructor() {
    // TODO get from config
    this.bufferSize = 16384;
    this.buffer = Buffer.alloc(this.bufferSize);
    this.bufferPosition = -1;

    // TODO get from request or config
    this.fileName = "/tmp/test_file";

    const fileStat = statSync(this.fileName);
    this.fileSize = fileStat.size;

    this.fd = openSync(this.fileName, 'r');
    this.filePosition = -1;
  }

  // TODO this is bogus, TS does not have destructors. So how/when can we call closeSync()?!
  //      maybe put the open and close in the iterator?
  destructor() {
    closeSync(this.fd);
  }

  loadBuffer(endingAt : number) {
    if (endingAt > this.fileSize) {
      throw new Error(`bad position ${endingAt} for file size ${this.fileSize}`);
    }
    const startingAt = Math.max(0, endingAt - this.bufferSize);
    const loadBytes = endingAt - startingAt;
    const bytesRead = readSync(this.fd, this.buffer, 0, loadBytes, startingAt);
    if (bytesRead !== loadBytes) {
      throw new Error(`readSync() requested ${loadBytes} from position ${startingAt} of ${this.fileSize}, but got ${bytesRead}`);
    }
    this.bufferPosition = loadBytes;
    this.filePosition = startingAt;
  }

  // TODO Needs unit tests.
  // TODO Maybe could be an interator that yields lines?
  getNextLine() {
    let lineEnd : number = 0;
    let lineStart : number = 0;

    if (this.filePosition === -1) {
      this.loadBuffer(this.fileSize);
    }

    if (this.filePosition === 0 && this.bufferPosition === 0) {
      return null;
    }

    lineEnd = this.buffer.lastIndexOf(EOL, this.bufferPosition);
    if (lineEnd === -1) {
      throw new Error("no line terminator found in buffer");
    }

    lineStart = this.buffer.lastIndexOf(EOL, lineEnd - 1);
    if (lineStart === -1) {
      if (this.filePosition === 0) {
        // first line in file
        lineStart = 0;
        this.bufferPosition = 0;
      } else {
        throw new Error("TODO load next buffer")
      }
    } else {
      this.bufferPosition = lineStart;
      lineStart += EOL.length;
    }

    console.log(`start: ${lineStart}, end: ${lineEnd}`);
    return this.buffer.toString('utf8', lineStart, lineEnd);
  }
}

