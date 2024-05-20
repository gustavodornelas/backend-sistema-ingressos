class NoContentError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NoContentError';
      }
}

module.exports = NoContentError