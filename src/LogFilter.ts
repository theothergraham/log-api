// vim: ts=2:sts=2:sw=2:et:ai

export class LogFilter {
  private reader: AsyncGenerator<string> = undefined;
  private re: RegExp = undefined;
  private maxCount: number = 0;
  private count: number = 0;

  constructor(reader: AsyncGenerator<string>, params : object) {
    this.reader = reader;
    if ('regex' in params) {
      this.re = new RegExp(params.regex as string);
    }
    if ('maxCount' in params) {
      this.maxCount = parseInt(params.maxCount as string, 10);
    }
  }

  async *[Symbol.asyncIterator]() : AsyncIterator<string> {
    for await (const line of this.reader) {
      if (!this.re || this.re.test(line)) {
        this.count += 1;
        yield line;
        if (this.maxCount && this.count >= this.maxCount) {
          break;
        }
      }
    }
  }
}
