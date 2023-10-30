// vim: ts=2:sts=2:sw=2:et:ai

import { statSync, openSync, readSync, closeSync } from 'fs';
import { EOL } from 'os';

import { LogReaderConfig } from "./LogReaderConfig";

// TODO make a lot of this private, maybe some readonly.

export class LogReader {
  config : LogReaderConfig;
  fileName : string;
  fileSize : number;
  filePosition : number;
  fd : number;
  buffer : Buffer;
  bufferPosition : number;

  constructor(fileName? : string) {
    this.config = new LogReaderConfig();

    this.buffer = Buffer.alloc(this.config.bufferSize);
    this.bufferPosition = -1;

    this.fileName = fileName;
    this.fileName ??= "test_file";
    if (this.isBadFileName(this.fileName)) {
      throw new Error(`bad filename '${this.fileName}'`);
    }

    const fileNameWithPath = this.config.baseDir + '/' + this.fileName;

    const fileStat = statSync(fileNameWithPath);
    this.fileSize = fileStat.size;

    this.fd = openSync(fileNameWithPath, 'r');
    this.filePosition = -1;
  }

  // TODO this is bogus, TS does not have destructors. So how/when can we call closeSync()?!
  //      maybe put the open and close in the iterator?
  destructor() {
    closeSync(this.fd);
  }

  isBadFileName(fileName : string) : boolean {
    const regex = new RegExp('(^|/)\.\.(/|$)');
    return regex.test(fileName);
  }

  loadBuffer(endingAt : number) {
    if (endingAt > this.fileSize) {
      throw new Error(`bad position ${endingAt} for file size ${this.fileSize}`);
    }
    const startingAt = Math.max(0, endingAt - this.config.bufferSize);
    const loadBytes = endingAt - startingAt;
    const bytesRead = readSync(this.fd, this.buffer, 0, loadBytes, startingAt);
    if (bytesRead !== loadBytes) {
      throw new Error(`readSync() requested ${loadBytes} from position ${startingAt} of ${this.fileSize}, but got ${bytesRead}`);
    }
    this.bufferPosition = loadBytes;
    this.filePosition = startingAt;
  }

  // Might be able to simplify by using string.split(), but not sure about
  // what happens when UTF-8 multi-byte char crosses a buffer boundary and
  // we try to convert the buffer to a string.

  // TODO Maybe could be an interator that yields lines?
  getNextLine() : string | null {
    let lineEnd : number = 0;
    let lineStart : number = 0;

    if (this.filePosition === -1) {
      this.loadBuffer(this.fileSize);
    }

    if (this.filePosition === 0 && this.bufferPosition === 0) {
      // We hit the beginning of the file, there are no more lines.
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
        // re-load buffer so it ends at the first EOL
        this.loadBuffer(this.filePosition + this.bufferPosition + EOL.length);
        return this.getNextLine();
      }
    } else {
      this.bufferPosition = lineStart;
      lineStart += EOL.length;
    }

    return this.buffer.toString('utf8', lineStart, lineEnd);
  }
}

