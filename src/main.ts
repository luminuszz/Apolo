#!/usr/bin/env node

import { Command } from 'commander';

import { ListDockerContainersUseCase } from './use-cases/list-docker-containers';

export class DockerCli {
	private readonly shellCommander: Command;

	constructor() {
		this.shellCommander = new Command();
	}

	async run() {
		this.shellCommander.version('0.0.1')
			.description('Docker CLI')
			.command('list', 'List docker containers').alias('l')
			.parse(process.argv).action(async () => {
				const listDockerContainers = new ListDockerContainersUseCase();
				await listDockerContainers.handle();
			});
	}
}

const dockerCli = new DockerCli();
