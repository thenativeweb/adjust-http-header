# adjust-http-header

adjust-http-header adjusts HTTP headers in streams.

## Installation

```shell
$ npm install adjust-http-header
```

## Quick start

First you need to integrate adjust-http-header into your application:

```javascript
const AdjustHttpHeader = require('adjust-http-header');
```

Then you need to create an instance of the `AdjustHttpHeader` class and provide the key and value of the HTTP header you want to adjust.

```javascript
const httpStream = // ...

httpStream.
  pipe(new AdjustHttpHeader({ key: 'X-Additional-Data', 'foo' })).
  pipe(/* ... */);
```

*Please note: If the header is already present, it will be replaced; otherwise it will be added.*

## Running the build

To build this module use [roboter](https://www.npmjs.com/package/roboter).

```shell
$ npx roboter
```

## License

The MIT License (MIT)
Copyright (c) 2017-2018 the native web.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
