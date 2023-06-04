#!/usr/bin/env node

import { Command } from 'commander';

import { ListDockerContainersUseCase } from './use-cases/list-docker-containers';

export class DockerCli {
  private readonly shellCommander: Command;

  constructor() {
    this.shellCommander = new Command();
  }

  async run() {
    this.shellCommander
      .command("list")
      .description("List all docker containers")
      .alias("l")
      .action(async () => {
        const listDockerContainers = new ListDockerContainersUseCase();
        await listDockerContainers.handle();
      });

    this.shellCommander
      .parse(process.argv)
      .description("Docker CLI")
      .version("0.0.1");
  }
}

const dockerCli = new DockerCli();

dockerCli.run();
