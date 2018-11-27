'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var stream = require('stream');

var AdjustHttpHeader =
/*#__PURE__*/
function (_stream$Transform) {
  (0, _inherits2.default)(AdjustHttpHeader, _stream$Transform);

  function AdjustHttpHeader(options) {
    var _this;

    (0, _classCallCheck2.default)(this, AdjustHttpHeader);

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
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(AdjustHttpHeader).call(this));
    _this.key = key;
    _this.value = value;
    _this.inHeader = true;
    _this.header = Buffer.alloc(0);
    return _this;
  }

  (0, _createClass2.default)(AdjustHttpHeader, [{
    key: "_transform",
    value: function _transform(chunk, encoding, callback) {
      if (!this.inHeader) {
        this.push(chunk);
        return callback(null);
      }

      this.header = Buffer.concat([this.header, chunk]);
      var lineBreak = '\r\n';
      var offset = 2;
      var endOfHeader = this.header.indexOf(Buffer.from("".concat(lineBreak).concat(lineBreak)));

      if (endOfHeader === -1) {
        return callback(null);
      }

      var header = this.header.slice(0, endOfHeader + offset);
      var body = this.header.slice(endOfHeader + offset);
      var startOfHeaderToRemove = header.indexOf(Buffer.from("".concat(lineBreak).concat(this.key, ":")));

      if (startOfHeaderToRemove !== -1) {
        var endOfHeaderToRemove = header.indexOf(Buffer.from(lineBreak), startOfHeaderToRemove + offset);
        header = Buffer.concat([header.slice(0, startOfHeaderToRemove + offset), header.slice(endOfHeaderToRemove + offset)]);
      }

      this.push(header);
      this.push(Buffer.from("".concat(this.key, ": ").concat(this.value).concat(lineBreak)));
      this.inHeader = false;
      this.push(body);
      callback(null);
    }
  }]);
  return AdjustHttpHeader;
}(stream.Transform);

module.exports = AdjustHttpHeader;