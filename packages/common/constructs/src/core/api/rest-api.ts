import { Construct } from 'constructs';
import {
  RestApi as _RestApi,
  RestApiProps as _RestApiProps,
  IResource,
} from 'aws-cdk-lib/aws-apigateway';
import { RuntimeConfig } from '../runtime-config.js';
import { Grant, IGrantable } from 'aws-cdk-lib/aws-iam';
import { OperationDetails, RestApiIntegration } from './utils.js';

/**
 * Properties for creating a RestApi construct.
 *
 * @template TIntegrations - Record mapping operation names to their integrations
 * @template TOperation - String literal type representing operation names
 */
export interface RestApiProps<
  TIntegrations extends Record<TOperation, RestApiIntegration>,
  TOperation extends string,
> extends _RestApiProps {
  /**
   * Unique name for the API, used in runtime configuration
   */
  readonly apiName: string;
  /**
   * Map of operation names to their API path and HTTP method details
   */
  readonly operations: Record<TOperation, OperationDetails>;
  /**
   * Map of operation names to their API Gateway integrations
   */
  readonly integrations: TIntegrations;
}

/**
 * A CDK construct that creates and configures an AWS API Gateway REST API.
 *
 * This class extends the base CDK RestApi with additional functionality:
 * - Type-safe operation and integration management
 * - Automatic resource creation based on path patterns
 * - Integration with runtime configuration for client discovery
 *
 * @template TOperation - String literal type representing operation names
 * @template TIntegrations - Record mapping operation names to their integrations
 */
export class RestApi<
  TOperation extends string,
  TIntegrations extends Record<TOperation, RestApiIntegration>,
> extends Construct {
  /** The underlying CDK RestApi instance */
  public readonly api: _RestApi;

  /** Map of operation names to their API Gateway integrations */
  public readonly integrations: TIntegrations;

  constructor(
    scope: Construct,
    id: string,
    {
      apiName,
      operations,
      integrations,
      ...props
    }: RestApiProps<TIntegrations, TOperation>,
  ) {
    super(scope, id);
    this.integrations = integrations;

    // Create the API Gateway REST API
    this.api = new _RestApi(this, 'Api', props);

    // Create API resources and methods for each operation
    (Object.entries(operations) as [TOperation, OperationDetails][]).map(
      ([op, details]) => {
        const resource = this.getOrCreateResource(
          this.api.root,
          (details.path.startsWith('/')
            ? details.path.slice(1)
            : details.path
          ).split('/'),
        );
        resource.addMethod(
          details.method,
          integrations[op].integration,
          integrations[op].options,
        );
      },
    );

    // Register the API URL in runtime configuration for client discovery
    RuntimeConfig.ensure(this).config.apis = {
      ...RuntimeConfig.ensure(this).config.apis!,
      [apiName]: this.api.url!,
    };
  }

  /**
   * Recursively creates or retrieves API Gateway resources based on a path pattern.
   *
   * @param resource - The parent API Gateway resource
   * @param pathParts - Array of path segments to create or retrieve
   * @returns The API Gateway resource at the end of the path
   */
  private getOrCreateResource(
    resource: IResource,
    [nextPathPart, ...pathParts]: string[],
  ): IResource {
    if (!nextPathPart) {
      return resource;
    }
    const childResource =
      resource.getResource(nextPathPart) ?? resource.addResource(nextPathPart);
    return this.getOrCreateResource(childResource, pathParts);
  }

  /**
   * Grants IAM permissions to invoke any method on this API.
   *
   * @param grantee - The IAM principal to grant permissions to
   */
  public grantInvokeAccess(grantee: IGrantable) {
    Grant.addToPrincipal({
      grantee,
      actions: ['execute-api:Invoke'],
      resourceArns: [this.api.arnForExecuteApi('*', '/*', '*')],
    });
  }
}
