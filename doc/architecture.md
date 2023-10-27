# Assumptions
- Lines longer than buffer size are not supported.
- Log file encoding is ASCII and/or UTF-8.
- EOL can be LF or CRLF.
- Path + Query param input.
- JSON output.

# Request
_all fields are optional_
- filename : string
- match : string (regex)
- start\_time : string
- end\_time : string
- max\_results : integer

# Response
- line\_count : integer
- lines : string[]
- warnings : string[]
- errors : string[]

# Potential Enhancements
- Auto-detect time format of each file
- Configurable buffer size
- Configurable base dir
- Field parser/matcher
- Request option to include Request in Response
- Also allow JSON input

# Design
- LogReaderConfig
  - base\_dir : string (default "/var/log")
  - filename : string (default "syslog") _do not allow `--`_
  - buffer\_length : integer (default 16384)
  - ???
- LogReader
  - LogReaderConfig
  - file\_size
  - buffer
  - start\_pos
  - current\_eol
  - current\_sol
  - getNextLine()
  - endOfFile()
- LogFilterConfig
  - max\_matches : integer (default 0 unlimited)
  - match\_regex : string (defaut "")
  - start\_time : string (default "")
  - end\_time : string (default "")
  - time\_format : string (default "Mon DD HH:MM:SS")
- LogFilter
  - LogFilterConfig
  - match\_count : integer
  - last\_time : string (is there a native timestamp type?)
  - passes(line)
  - complete() `{ return match_count >= max_matches || current_time < start_time; }`
