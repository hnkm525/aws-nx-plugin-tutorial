# dungeon-adventure

✨ Your new, shiny [Nx workspace](https://nx.dev) has been successfully created! ✨.

[Learn more about this workspace setup and the @aws/nx-plugin](https://awslabs.github.io/nx-plugin-for-aws). Now, let's get you up to speed!

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Available generators

The following list of generators are what is currently available in the `@aws/nx-plugin`:

- **ts#project**: Generates a TypeScript project

- **py#project**: Generates a Python project

- **py#fast-api**: Generates a FastAPI Python project

- **ts#cloudscape-website**: Generates a React static website based on Cloudscape

- **ts#cloudscape-website#auth**: Adds auth to an existing cloudscape website

- **ts#infra**: Generates a cdk application

- **ts#trpc-api**: creates a trpc backend

- **api-connection**: Integrates a source project with a target API project

- **license**: Add LICENSE files and configure source code licence headers

- **py#lambda-function**: Adds a lambda function to a python project

- **ts#nx-generator**: Generator for adding an Nx Generator to an existing TypeScript project

- **ts#mcp-server**: Generate a TypeScript Model Context Protocol (MCP) server for providing context to Large Language Models

You also have the option of using additional [commmunity plugins](https://nx.dev/plugin-registry) as needed.

## Invoking a generator

```sh
pnpm exec nx g @aws/nx-plugin:<generator-name>
```

Alternatively you can use the NX IDE plugin to invoke your generators.

Refer to the [full documentation](https://awslabs.github.io/nx-plugin-for-aws) for additional guidance for each generator.

## Common tasks

### Build a single project

```sh
pnpm exec nx build <project-name>
```

### Build all projects

```sh
pnpm exec nx run-many --target build --all
# or
pnpm exec build:all
```

### Run arbitrary task

```sh
pnpm exec nx <target> <project-name>
```

### Lint (and fix) all projects

```sh
pnpm exec nx run-many --target lint --configuration=fix --all
```

## Test all projects (and update snapshots)

```sh
pnpm exec nx run-many --target test --all --update
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the Nx docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Keep TypeScript project references up to date

Nx automatically updates TypeScript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in `tsconfig.json` files to ensure they remain accurate based on your project dependencies (`import` statements). This sync is automatically done when running tasks such as `build`, which require updated references to function correctly.

To manually trigger the process to sync the project graph dependencies information to the TypeScript project references, run the following command:

```sh
pnpm exec nx sync
```

You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

```sh
pnpm exec nx sync:check
```

[Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)

## Set up CI!

Use the following command to configure a CI workflow for your workspace:

```sh
pnpm exec nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [@aws/nx-plugin quick-start](https://awslabs.github.io/nx-plugin-for-aws/en/get_started/quick-start/)
- [@aws/nx-plugin AI dungeon game](https://awslabs.github.io/nx-plugin-for-aws/en/get_started/tutorials/dungeon-game/overview/)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
