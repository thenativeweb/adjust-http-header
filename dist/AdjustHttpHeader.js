'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var stream = require('stream');

var AdjustHttpHeader = function (_stream$Transform) {
  _inherits(AdjustHttpHeader, _stream$Transform);

  function AdjustHttpHeader(options) {
    _classCallCheck(this, AdjustHttpHeader);

    if (!options) {
      throw new Error('Options are missing.');
    }
    if (!options.key) {
      throw new Error('Key is missing.');
    }
    if (!options.value) {
      throw new Error('Value is missing.');
    }

    var key = options.key,
        value = options.value;

    var _this = _possibleConstructorReturn(this, (AdjustHttpHeader.__proto__ || Object.getPrototypeOf(AdjustHttpHeader)).call(this));

    _this.key = key;
    _this.value = value;

    _this.inHeader = true;
    _this.header = Buffer.alloc(0);
    return _this;
  }

  _createClass(AdjustHttpHeader, [{
    key: '_transform',
    value: function _transform(chunk, encoding, callback) {
      if (!this.inHeader) {
        this.push(chunk);

        return callback(null);
      }

      this.header = Buffer.concat([this.header, chunk]);

      var endOfHeader = this.header.indexOf(Buffer.from('\n\n'));

      if (endOfHeader === -1) {
        return callback(null);
      }

      var header = this.header.slice(0, endOfHeader + 1);
      var body = this.header.slice(endOfHeader + 1);

      var startOfHeaderToRemove = header.indexOf(Buffer.from('\n' + this.key + ':'));

      if (startOfHeaderToRemove !== -1) {
        var endOfHeaderToRemove = header.indexOf(Buffer.from('\n'), startOfHeaderToRemove + 1);

        header = Buffer.concat([header.slice(0, startOfHeaderToRemove + 1), header.slice(endOfHeaderToRemove + 1)]);
      }

      this.push(header);
      this.push(Buffer.from(this.key + ': ' + this.value + '\n'));

      this.push(body);
      callback(null);
    }
  }]);

  return AdjustHttpHeader;
}(stream.Transform);

module.exports = AdjustHttpHeader;