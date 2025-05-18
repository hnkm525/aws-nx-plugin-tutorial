import { Construct } from 'constructs';
import * as url from 'url';
import {
  Code,
  Runtime,
  Function,
  FunctionProps,
  Tracing,
} from 'aws-cdk-lib/aws-lambda';
import {
  AuthorizationType,
  Cors,
  LambdaIntegration,
} from 'aws-cdk-lib/aws-apigateway';
import { Duration, Stack } from 'aws-cdk-lib';
import {
  PolicyDocument,
  PolicyStatement,
  Effect,
  AccountPrincipal,
  AnyPrincipal,
} from 'aws-cdk-lib/aws-iam';
import {
  IntegrationBuilder,
  RestApiIntegration,
} from '../../core/api/utils.js';
import { RestApi } from '../../core/api/rest-api.js';
import { Procedures, routerToOperations } from '../../core/api/trpc-utils.js';
import { AppRouter, appRouter } from ':dungeon-adventure/game-api-backend';

// String union type for all API operation names
type Operations = Procedures<AppRouter>;

/**
 * Properties for creating a GameApi construct
 *
 * @template TIntegrations - Map of operation names to their integrations
 */
export interface GameApiProps<
  TIntegrations extends Record<Operations, RestApiIntegration>,
> {
  /**
   * Map of operation names to their API Gateway integrations
   */
  integrations: TIntegrations;
}

/**
 * A CDK construct that creates and configures an AWS API Gateway REST API
 * specifically for GameApi.
 * @template TIntegrations - Map of operation names to their integrations
 */
export class GameApi<
  TIntegrations extends Record<Operations, RestApiIntegration>,
> extends RestApi<Operations, TIntegrations> {
  /**
   * Creates default integrations for all operations, which implement each operation as
   * its own individual lambda function.
   *
   * @param scope - The CDK construct scope
   * @returns An IntegrationBuilder with default lambda integrations
   */
  public static defaultIntegrations = (scope: Construct) => {
    return IntegrationBuilder.rest({
      operations: routerToOperations(appRouter),
      defaultIntegrationOptions: {
        runtime: Runtime.NODEJS_LATEST,
        handler: 'index.handler',
        code: Code.fromAsset(
          url.fileURLToPath(
            new URL(
              '../../../../../../dist/packages/game-api/backend/bundle',
              import.meta.url,
            ),
          ),
        ),
        timeout: Duration.seconds(30),
        tracing: Tracing.ACTIVE,
        environment: {
          AWS_CONNECTION_REUSE_ENABLED: '1',
        },
      } satisfies FunctionProps,
      buildDefaultIntegration: (op, props: FunctionProps) => {
        const handler = new Function(scope, `GameApi${op}Handler`, props);
        return { handler, integration: new LambdaIntegration(handler) };
      },
    });
  };

  constructor(
    scope: Construct,
    id: string,
    props: GameApiProps<TIntegrations>,
  ) {
    super(scope, id, {
      apiName: 'GameApi',
      defaultMethodOptions: {
        authorizationType: AuthorizationType.IAM,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      policy: new PolicyDocument({
        statements: [
          // Here we grant any AWS credentials from the account that the project is deployed in to call the api.
          // Machine to machine fine-grained access can be defined here using more specific principals (eg roles or
          // users) and resources (eg which api paths may be invoked by which principal) if required.
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AccountPrincipal(Stack.of(scope).account)],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*'],
          }),
          // Open up OPTIONS to allow browsers to make unauthenticated preflight requests
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*/OPTIONS/*'],
          }),
        ],
      }),
      operations: routerToOperations(appRouter),
      ...props,
    });
  }
}
