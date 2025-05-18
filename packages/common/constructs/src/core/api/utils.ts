import { Integration, MethodOptions } from 'aws-cdk-lib/aws-apigateway';
import {
  HttpRouteIntegration,
  AddRoutesOptions,
} from 'aws-cdk-lib/aws-apigatewayv2';

/**
 * Type representing applicable HTTP Methods in API Gateway
 */
export type HttpMethod =
  | 'ANY'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT';

/**
 * Defines the details of an API operation.
 */
export interface OperationDetails {
  /**
   * The URL path for the operation
   */
  path: string;

  /**
   * The HTTP method for the operation
   */
  method: HttpMethod;
}

/**
 * Represents an API Gateway REST API integration that can be attached to API methods.
 */
export interface RestApiIntegration {
  integration: Integration;
  options?: MethodOptions;
}

/**
 * Represents an API Gateway HTTP API that can be attached to API methods.
 */
export interface HttpApiIntegration {
  integration: HttpRouteIntegration;
  options?: Omit<AddRoutesOptions, 'path' | 'methods' | 'integration'>;
}

/**
 * Options for constructing an IntegrationBuilder
 */
export interface IntegrationBuilderProps<
  TOperation extends string,
  TBaseIntegration,
  TDefaultIntegrationProps extends object,
  TDefaultIntegration extends TBaseIntegration,
> {
  /** Map of operation names to their API path and HTTP method details */
  operations: Record<TOperation, OperationDetails>;

  /** Default configuration options for integrations */
  defaultIntegrationOptions: TDefaultIntegrationProps;

  /** Function to create a default integration for an operation */
  buildDefaultIntegration: (
    op: TOperation,
    props: TDefaultIntegrationProps,
  ) => TDefaultIntegration;
}

/**
 * A builder class for creating API integrations with flexible configuration options.
 *
 * This class implements the builder pattern to create a set of API integrations
 * with support for default configurations and selective overrides.
 *
 * @template TOperation - String literal type representing operation names
 * @template TBaseIntegration - Base type for all integrations
 * @template TIntegrations - Record mapping operation names to their integrations
 * @template TDefaultIntegrationProps - Type for default integration properties
 * @template TDefaultIntegration - Type for default integration implementation
 */
export class IntegrationBuilder<
  TOperation extends string,
  TBaseIntegration,
  TIntegrations extends Record<TOperation, TBaseIntegration>,
  TDefaultIntegrationProps extends object,
  TDefaultIntegration extends TBaseIntegration,
> {
  /** Options for the integration builder */
  private options: IntegrationBuilderProps<
    TOperation,
    TBaseIntegration,
    TDefaultIntegrationProps,
    TDefaultIntegration
  >;

  /** Map of operation names to their custom integrations */
  private integrations: Partial<TIntegrations> = {};

  /**
   * Create an Integration Builder for an HTTP API
   */
  public static http = <
    TOperation extends string,
    TIntegrations extends Record<TOperation, TDefaultIntegration>,
    TDefaultIntegrationProps extends object,
    TDefaultIntegration extends HttpApiIntegration,
  >(
    options: IntegrationBuilderProps<
      TOperation,
      HttpApiIntegration,
      TDefaultIntegrationProps,
      TDefaultIntegration
    >,
  ) => {
    return new IntegrationBuilder<
      TOperation,
      HttpApiIntegration,
      TIntegrations,
      TDefaultIntegrationProps,
      TDefaultIntegration
    >(options);
  };

  /**
   * Create an Integration Builder for a REST API
   */
  public static rest = <
    TOperation extends string,
    TIntegrations extends Record<TOperation, TDefaultIntegration>,
    TDefaultIntegrationProps extends object,
    TDefaultIntegration extends RestApiIntegration,
  >(
    options: IntegrationBuilderProps<
      TOperation,
      RestApiIntegration,
      TDefaultIntegrationProps,
      TDefaultIntegration
    >,
  ) => {
    return new IntegrationBuilder<
      TOperation,
      RestApiIntegration,
      TIntegrations,
      TDefaultIntegrationProps,
      TDefaultIntegration
    >(options);
  };

  private constructor(
    options: IntegrationBuilderProps<
      TOperation,
      TBaseIntegration,
      TDefaultIntegrationProps,
      TDefaultIntegration
    >,
  ) {
    this.options = options;
  }

  /**
   * Overrides default integrations with custom implementations for specific operations.
   *
   * @param overrides - Map of operation names to their custom integration implementations
   * @returns The builder instance with updated type information reflecting the overrides
   */
  public withOverrides<
    TOverrideIntegrations extends Partial<Record<TOperation, TBaseIntegration>>,
  >(overrides: TOverrideIntegrations) {
    this.integrations = { ...this.integrations, ...overrides };
    // Re-type to include the overridden integration types
    return this as unknown as IntegrationBuilder<
      TOperation,
      TBaseIntegration,
      Omit<TIntegrations, keyof TOverrideIntegrations> & TOverrideIntegrations,
      TDefaultIntegrationProps,
      TDefaultIntegration
    >;
  }

  /**
   * Updates the default integration options that will be used for operations
   * without custom overrides.
   *
   * @param options - Partial default integration options to merge with existing defaults
   * @returns The builder instance
   */
  public withDefaultOptions(options: Partial<TDefaultIntegrationProps>) {
    this.options.defaultIntegrationOptions = {
      ...this.options.defaultIntegrationOptions,
      ...options,
    };
    return this;
  }

  /**
   * Builds and returns the complete set of integrations.
   *
   * This method creates the final integration map by:
   * 1. Including all custom overrides provided via withOverrides()
   * 2. Creating default integrations for any operations without custom overrides
   *
   * @returns A complete map of operation names to their integrations
   */
  public build(): TIntegrations {
    return {
      ...this.integrations,
      ...Object.fromEntries(
        (Object.keys(this.options.operations) as TOperation[])
          .filter(
            (op) => !this.integrations[op as keyof typeof this.integrations],
          )
          .map((op) => [
            op,
            this.options.buildDefaultIntegration(
              op,
              this.options.defaultIntegrationOptions,
            ),
          ]),
      ),
    } as unknown as TIntegrations;
  }
}
