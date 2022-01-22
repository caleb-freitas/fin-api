/* eslint-disable max-classes-per-file */

import { AppError } from "../../../../shared/errors/AppError";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GetStatementOperationError {
  export class UserNotFound extends AppError {
    constructor() {
      super("User not found", 404);
    }
  }

  export class StatementNotFound extends AppError {
    constructor() {
      super("Statement not found", 404);
    }
  }
}
