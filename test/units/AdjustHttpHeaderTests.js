'use strict';

const net = require('net'),
      stream = require('stream');

const assert = require('assertthat'),
      freeport = require('freeport'),
      streamToString = require('stream-to-string'),
      stripIndent = require('common-tags/lib/stripIndent'),
      superagent = require('superagent');

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

    test('correctly deals with \\r\\n line-endings.', done => {
      const httpRequest = new stream.PassThrough();
      const adjustHttpHeader = new AdjustHttpHeader({ key: 'foo', value: 'bar' });

      streamToString(httpRequest.pipe(adjustHttpHeader), (err, request) => {
        assert.that(err).is.null();

        assert.that(request).is.equalTo(stripIndent`
          POST /index.html HTTP/1.1\r
          Host: www.example.com\r
          foo: bar\r
          \r
          Hello world!
        `);
        done();
      });

      httpRequest.write(stripIndent`
        POST /index.html HTTP/1.1\r
        Host: www.example.com\r
        foo: baz\r
        \r
        Hello world!
      `);
      httpRequest.end();
    });

    test('works with real HTTP requests.', done => {
      freeport((errPort, port) => {
        assert.that(errPort).is.null();

        const server = net.createServer(socket => {
          const adjustHttpHeader = new AdjustHttpHeader({ key: 'foo', value: 'bar' });

          streamToString(socket.pipe(adjustHttpHeader), (err, request) => {
            assert.that(err).is.null();

            assert.that(request).is.equalTo(stripIndent`
              POST / HTTP/1.1\r
              Host: localhost:${port}\r
              Accept-Encoding: gzip, deflate\r
              User-Agent: node-superagent/3.7.0\r
              content-type: application/json\r
              Content-Length: 13\r
              Connection: close\r
              foo: bar\r
              \r
              {"foo":"bar"}
            `);
            done();
          });

          socket.end();
        });

        server.listen(port, () => {
          superagent.
            post(`http://localhost:${port}`).
            set('content-type', 'application/json').
            send({ foo: 'bar' }).
            end(err => {
              assert.that(err.code).is.equalTo('ECONNRESET');
            });
        });
      });
    });
  });
});
