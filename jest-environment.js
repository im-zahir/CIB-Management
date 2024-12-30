const Environment = require('jest-environment-jsdom').default;

class CustomEnvironment extends Environment {
  constructor(config, context) {
    super(config, context);
    this.global.TextEncoder = require('util').TextEncoder;
    this.global.TextDecoder = require('util').TextDecoder;
  }

  async setup() {
    await super.setup();
    if (typeof this.global.TextEncoder === 'undefined') {
      const { TextEncoder, TextDecoder } = require('util');
      this.global.TextEncoder = TextEncoder;
      this.global.TextDecoder = TextDecoder;
      this.global.ArrayBuffer = ArrayBuffer;
      this.global.Uint8Array = Uint8Array;
    }
  }
}

module.exports = CustomEnvironment;
