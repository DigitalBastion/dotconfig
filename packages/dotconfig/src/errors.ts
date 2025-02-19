import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * The base class for all configuration errors.
 */
export class ConfigurationError extends Error { }
/**
 * The base class for all configuration aggregate errors.
 */
export class ConfigurationAggregateError extends AggregateError { }

export class ParseError extends ConfigurationError implements StandardSchemaV1.Issue {
  constructor(
    message: string,
    public path?: ReadonlyArray<PropertyKey | StandardSchemaV1.PathSegment>,
  ) {
    super(message);
  }
}

export interface ParseErrorsData {
  configurationPath: string;
}

export class ParseErrors extends ConfigurationAggregateError {
  constructor(issues: StandardSchemaV1.FailureResult["issues"], data: ParseErrorsData) {
    super(issues.map((issue) => new ParseError(issue.message, issue.path)));
    this.message = `Configuration parse errors at "${data.configurationPath}" path.`;
  }
}

export class ProviderRegistryEmptyError extends ConfigurationError {
  constructor() {
    super("No providers are available.");
  }
}

export class SectionNotFoundError extends ConfigurationError {
  constructor(path: string) {
    super(`No configuration section found with the key "${path}".`);
  }
}
