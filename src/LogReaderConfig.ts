// vim: ts=2:sts=2:sw=2:et:ai

export class LogReaderConfig {
  baseDir : string;
  bufferSize : number;

  constructor() {
    this.baseDir = 'BASE_DIR' in process.env ? process.env.BASE_DIR : "/var/log";
    this.bufferSize = 'BUFFER_SIZE' in process.env ? parseInt(process.env.BUFFER_SIZE, 10) : 16384;
  }
}
