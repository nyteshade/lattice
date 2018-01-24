"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @module Core
 * 
 */

/**
 * The base error class used in GraphQL Lattice Core. All Lattice Error
 * classes extend from this class. They allow a shared interface for
 * working with and defining new errors. Lattice Errors deviate from
 * the base JavaScript Error class in that a LatticeError can wrap an
 * existing Error and assume its properties.
 */
class LatticeBaseError extends Error {

  /**
   * Creates a new Error object instance. If the supplied message value is
   * another `Error` instance, its data and values are used to prepopulate
   * the new instance.
   *
   * @constructor
   * @instance
   * @since 3.0.0
   *
   * @param {string|Class<Error>|void} messageOrError if an Error class rather
   * than a string or undefined, the supplied Error class is used to provide
   * the fileName and lineNumber.
   * @param {?string} fileName Optional. The value for the `fileName` property
   * on the created `Error` object. Defaults to the name of the file containing
   * the code that called the `Error()` constructor.
   * @param {?string|?number} lineNumber Optional. The value for the
   * `lineNumber` property on the created `Error` object. Defaults to the line
   * number containing the `Error()` constructor invocation.
   */
  constructor(messageOrError, fileName, lineNumber) {
    super(messageOrError && messageOrError.message || messageOrError, messageOrError && messageOrError.fileName || fileName, messageOrError && messageOrError.lineNumber || lineNumber);

    if (messageOrError instanceof Error) {
      this.error = messageOrError;
    }
  }
  /**
   * The optionally wrapped `Error` instance supplied to the constructor
   * upon creation.
   *
   * @type Class<Error>
   * @since 3.0.0
   */
}

exports.LatticeBaseError = LatticeBaseError;
exports.default = LatticeBaseError;
//# sourceMappingURL=LatticeBaseError.js.map