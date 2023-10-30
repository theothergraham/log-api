// vim: ts=2:sts=2:sw=2:et:ai

import { statSync, openSync, readSync, closeSync } from 'fs';
import { EOL } from 'os';

import { LogReaderConfig } from "./LogReaderConfig";
import { logger } from "./AppLogger";

// TODO make a lot of this private, maybe some readonly.

export class LogReader implements IterableIterator<string> {
  config : LogReaderConfig;
  fileName : string;
  fileNameWithPath : string;
  fileSize : number;
  filePosition : number;
  buffer : Buffer;
  bufferPosition : number;

  [Symbol.iterator]() {
    return this;
  }

  constructor(fileName? : string) {
    this.config = new LogReaderConfig();

    this.buffer = Buffer.alloc(this.config.bufferSize);
    this.bufferPosition = -1;

    this.fileName = fileName;
    this.fileName ??= "test_file";
    if (this.isBadFileName(this.fileName)) {
      throw new Error(`bad filename '${this.fileName}'`);
    }

    this.fileNameWithPath = this.config.baseDir + '/' + this.fileName;

    const fileStat = statSync(this.fileNameWithPath);
    this.fileSize = fileStat.size;

    this.filePosition = -1;
  }

  isBadFileName(fileName : string) : boolean {
    const regex = new RegExp('(^|/)\.\.(/|$)');
    return regex.test(fileName);
  }

  loadBuffer(endingAt : number) {
    // TODO inefficient to keep opening and closing the file, but the only way to reliably close
    // the file without a destructor is to keep it contained here.
    const fd = openSync(this.fileNameWithPath, 'r');
    if (endingAt > this.fileSize) {
      throw new Error(`bad position ${endingAt} for file size ${this.fileSize}`);
    }
    const startingAt = Math.max(0, endingAt - this.config.bufferSize);
    const loadBytes = endingAt - startingAt;
    const bytesRead = readSync(fd, this.buffer, 0, loadBytes, startingAt);
    if (bytesRead !== loadBytes) {
      throw new Error(`readSync() requested ${loadBytes} from position ${startingAt} of ${this.fileSize}, but got ${bytesRead}`);
    }
    this.bufferPosition = loadBytes - 1;
    this.filePosition = startingAt;
    closeSync(fd);

    logger.debug(`loaded ${loadBytes} from ${startingAt} to ${endingAt}:\n${this.buffer.toString()}`);
  }

  // Might be able to simplify by using string.split(), but not sure about
  // what happens when UTF-8 multi-byte char crosses a buffer boundary and
  // we try to convert the buffer to a string.

  next() : IteratorResult<string, number | undefined> {
    let lineEnd : number = 0;
    let lineStart : number = 0;

    if (this.filePosition === -1) {
      this.loadBuffer(this.fileSize);
    }

    if (this.bufferPosition === 0) {
      if (this.filePosition === 0) {
        // We hit the beginning of the file, there are no more lines.
        return { value: undefined, done: true };
      } else {
        // We need to load the next buffer.
        this.loadBuffer(this.filePosition + this.bufferPosition + EOL.length);
      }
    }

    lineEnd = this.buffer.lastIndexOf(EOL, this.bufferPosition);
    if (lineEnd === -1) {
      throw new Error("no line terminator found in buffer");
    }

    lineStart = this.buffer.lastIndexOf(EOL, lineEnd - 1);
    logger.debug(`got lineEnd ${lineEnd} and lineStart ${lineStart}`);
    if (lineStart === -1) {
      if (this.filePosition === 0) {
        // first line in file
        lineStart = 0;
        this.bufferPosition = 0;
      } else {
        // re-load buffer so it ends at the first EOL
        this.loadBuffer(this.filePosition + this.bufferPosition + EOL.length);
        return this.next();
      }
    } else {
      this.bufferPosition = lineStart;
      lineStart += EOL.length;
    }

    return { value: this.buffer.toString('utf8', lineStart, lineEnd) };
  }
}

