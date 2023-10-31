// vim: ts=2:sts=2:sw=2:et:ai

import { open, stat } from 'fs/promises';
import { EOL } from 'os';

import { LogReaderConfig } from "./LogReaderConfig";
import { logger } from "./AppLogger";

// TODO distinguish internal state sanity checks from external errors (e.g. line too long)
const assert = (condition: boolean, msg?: string) => {
  if (condition === false) throw new Error(msg);
}

const isBadFileName = (fileName : string) : boolean => {
  const regex = new RegExp('(^|/)\.\.(/|$)');
  return regex.test(fileName);
}

export const LogReader = async function*(fileName: string) : AsyncGenerator<string> {
  // init
  const config = new LogReaderConfig();

  if (isBadFileName(fileName)) {
    throw new Error(`bad filename '${fileName}'`);
  }
  const fileNameWithPath = config.baseDir + '/' + fileName;

  const buffer = Buffer.alloc(config.bufferSize);
  let bufferPosition = -1;

  const fileStat = await stat(fileNameWithPath);
  const fileSize = fileStat.size;

  const fh = await open(fileNameWithPath, 'r');
  let filePosition = 0;

  // Loads the buffer with the block of bytes ending at the supplied position.
  // If there are too few bytes left in the file to fill the buffer, the bytes
  // loaded will be at the beginning of the buffer and the remainder will be
  // cleared for safety.
  const loadBuffer = async (endingAt: number) => {
    assert(endingAt <= fileSize, `bad position ${endingAt} for file size ${fileSize}`);

    const startingAt = Math.max(0, endingAt - config.bufferSize);
    const loadBytes = endingAt - startingAt;

    const { bytesRead  } = await fh.read(buffer, 0, loadBytes, startingAt);
    assert(bytesRead === loadBytes, `fh.read() requested ${loadBytes} from position ${startingAt} of ${fileSize}, but got ${bytesRead}`);

    bufferPosition = loadBytes - 1;
    filePosition = startingAt;

    if (loadBytes < config.bufferSize) {
      buffer.fill(0, loadBytes);
    }

    logger.debug(`loaded ${loadBytes} from ${startingAt} to ${endingAt}:\n${buffer.toString()}`);
  }

  try {
    await loadBuffer(fileSize);

    while (filePosition > 0 || bufferPosition > 0) {
      const lineEnd = buffer.lastIndexOf(EOL, bufferPosition);
      assert(lineEnd >= 0, "no line terminator found in buffer");
      if (lineEnd === 0) {
        // we cannot scan backwards from 0, so load the next buffer
        const endingAt = filePosition + bufferPosition + EOL.length;
        await loadBuffer(endingAt);
        continue;
      }

      let lineStart = buffer.lastIndexOf(EOL, lineEnd - 1);
      logger.debug(`found lineEnd ${lineEnd} and lineStart ${lineStart}`);

      if (lineStart < 0) {
        if (filePosition === 0) {
          // first line in file
          lineStart = 0;
          bufferPosition = 0;
        } else if (lineEnd === config.bufferSize - 1) {
          // the line is longer than the buffer
          throw new Error('line too long');
        } else {
          const endingAt = filePosition + bufferPosition + EOL.length;
          await loadBuffer(endingAt);
          continue;
        }
      } else {
        bufferPosition = lineStart;
        lineStart += EOL.length;
      }

      const result = buffer.toString('utf8', lineStart, lineEnd);
      logger.debug(`after adjustments, found lineEnd ${lineEnd} and lineStart ${lineStart}: ${result}`);
      yield result;
    }
  } finally {
    await fh.close();
  }
}

