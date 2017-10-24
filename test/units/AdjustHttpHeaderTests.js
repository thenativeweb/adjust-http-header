'use strict';

const stream = require('stream');

const assert = require('assertthat'),
      streamToString = require('stream-to-string'),
      stripIndent = require('common-tags/lib/stripIndent');

const AdjustHttpHeader = require('../../lib/AdjustHttpHeader');

suite('AdjustHttpHeader', () => {
  test('is a function.', done => {
    assert.that(AdjustHttpHeader).is.ofType('function');
    done();
  });

  test('throws an exception when options are missing.', done => {
    assert.that(() => {
      /* eslint-disable no-new */
      new AdjustHttpHeader();
      /* eslint-enable no-new */
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws an exception when key is missing.', done => {
    assert.that(() => {
      /* eslint-disable no-new */
      new AdjustHttpHeader({});
      /* eslint-enable no-new */
    }).is.throwing('Key is missing.');
    done();
  });

  test('throws an exception when value is missing.', done => {
    assert.that(() => {
      /* eslint-disable no-new */
      new AdjustHttpHeader({ key: 'foo' });
      /* eslint-enable no-new */
    }).is.throwing('Value is missing.');
    done();
  });

  suite('instance', () => {
    test('adds the header if it is not present.', done => {
      const httpRequest = new stream.PassThrough();
      const adjustHttpHeader = new AdjustHttpHeader({ key: 'foo', value: 'bar' });

      streamToString(httpRequest.pipe(adjustHttpHeader), (err, request) => {
        assert.that(err).is.null();
        assert.that(request).is.equalTo(stripIndent`
          POST /index.html HTTP/1.1
          Host: www.example.com
          foo: bar

          Hello world!
        `);
        done();
      });

      httpRequest.write(stripIndent`
        POST /index.html HTTP/1.1
        Host: www.example.com

        Hello world!
      `);
      httpRequest.end();
    });

    test('replaces the header if it is present.', done => {
      const httpRequest = new stream.PassThrough();
      const adjustHttpHeader = new AdjustHttpHeader({ key: 'foo', value: 'bar' });

      streamToString(httpRequest.pipe(adjustHttpHeader), (err, request) => {
        assert.that(err).is.null();
        assert.that(request).is.equalTo(stripIndent`
          POST /index.html HTTP/1.1
          Host: www.example.com
          foo: bar

          Hello world!
        `);
        done();
      });

      httpRequest.write(stripIndent`
        POST /index.html HTTP/1.1
        Host: www.example.com
        foo: baz

        Hello world!
      `);
      httpRequest.end();
    });

    test('replaces the header if it is present, even if it is not the last one.', done => {
      const httpRequest = new stream.PassThrough();
      const adjustHttpHeader = new AdjustHttpHeader({ key: 'foo', value: 'bar' });

      streamToString(httpRequest.pipe(adjustHttpHeader), (err, request) => {
        assert.that(err).is.null();
        assert.that(request).is.equalTo(stripIndent`
          POST /index.html HTTP/1.1
          Host: www.example.com
          foo: bar

          Hello world!
        `);
        done();
      });

      httpRequest.write(stripIndent`
        POST /index.html HTTP/1.1
        foo: baz
        Host: www.example.com

        Hello world!
      `);
      httpRequest.end();
    });

    test('replaces the header if it is present, even if the header spans multiple chunks.', done => {
      const httpRequest = new stream.PassThrough();
      const adjustHttpHeader = new AdjustHttpHeader({ key: 'foo', value: 'bar' });

      streamToString(httpRequest.pipe(adjustHttpHeader), (err, request) => {
        assert.that(err).is.null();
        assert.that(request).is.equalTo(stripIndent`
          POST /index.html HTTP/1.1
          Host: www.example.com
          foo: bar

          Hello world!
        `);
        done();
      });

      httpRequest.write(stripIndent`
        POST /index.html HTTP/1.1
        Host: www.example.com
        fo
      `);
      httpRequest.write(stripIndent`
        o: baz

        Hello world!
      `);
      httpRequest.end();
    });
  });
});
