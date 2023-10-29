// vim: ts=2:sts=2:sw=2:et:ai

export class LogReaderConfig {
  baseDir : string;
  bufferSize : number;

  constructor() {
    this.baseDir = process.env.BASE_DIR;
    this.baseDir ??= "/var/log"

    this.bufferSize = parseInt(process.env.BUFFER_SIZE, 10);
    this.bufferSize ??= 16384;
  }
}
