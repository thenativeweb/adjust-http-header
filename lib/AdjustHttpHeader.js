'use strict';

const stream = require('stream');

class AdjustHttpHeader extends stream.Transform {
  constructor (options) {
    if (!options) {
      throw new Error('Options are missing.');
    }
    if (!options.key) {
      throw new Error('Key is missing.');
    }
    if (!options.value) {
      throw new Error('Value is missing.');
    }

    const { key, value } = options;

    super();

    this.key = key;
    this.value = value;

    this.inHeader = true;
    this.header = Buffer.alloc(0);
  }

  _transform (chunk, encoding, callback) {
    if (!this.inHeader) {
      this.push(chunk);

      return callback(null);
    }

    this.header = Buffer.concat([ this.header, chunk ]);

    let lineBreak = '\n';
    let offset = 1;

    let endOfHeader = this.header.indexOf(Buffer.from(`${lineBreak}${lineBreak}`));

    if (endOfHeader === -1) {
      lineBreak = '\r\n';
      offset = 2;

      endOfHeader = this.header.indexOf(Buffer.from(`${lineBreak}${lineBreak}`));

      if (endOfHeader === -1) {
        return callback(null);
      }
    }

    let header = this.header.slice(0, endOfHeader + offset);
    const body = this.header.slice(endOfHeader + offset);

    const startOfHeaderToRemove = header.indexOf(Buffer.from(`${lineBreak}${this.key}:`));

    if (startOfHeaderToRemove !== -1) {
      const endOfHeaderToRemove = header.indexOf(Buffer.from(lineBreak), startOfHeaderToRemove + offset);

      header = Buffer.concat([
        header.slice(0, startOfHeaderToRemove + offset),
        header.slice(endOfHeaderToRemove + offset)
      ]);
    }

    this.push(header);
    this.push(Buffer.from(`${this.key}: ${this.value}${lineBreak}`));

    this.push(body);
    callback(null);
  }
}

module.exports = AdjustHttpHeader;
