#!/usr/bin/env node

import {Command} from 'commander';

import {ListDockerContainersUseCase} from './use-cases/list-docker-containers';
import {StopContainerUseCase} from './use-cases/stop-container';
import {UpContainerUseCase} from './use-cases/up-container';
import {AccessContainer} from './use-cases/access-container';
import {RestartContainerUseCase} from './use-cases/restart-container';

export class DockerCli {
	private readonly shellCommander: Command;

	constructor() {
		this.shellCommander = new Command();
	}

	async run() {
		this.shellCommander

			.command('list')
			.description('List all docker containers')
			.alias('l')
			.action(async () => {
				const listDockerContainers = new ListDockerContainersUseCase();
				await listDockerContainers.handle();
			});

		this.shellCommander
			.command('up-container')
			.description('Run a container')
			.alias('up')
			.action(async () => {
				const upContainerUseCase = new UpContainerUseCase();
				await upContainerUseCase.handle();
			});

		this.shellCommander
			.command('stop')
			.description('Stop a container')
			.alias('st')
			.action(async () => {
				const stopContainer = new StopContainerUseCase();
				await stopContainer.handle();
			});

		this.shellCommander
			.command('restart-container')
			.description('Restart a container')
			.alias('r')
			.action(async () => {
				const restartContainer = new RestartContainerUseCase();
				await restartContainer.handle();
			});

		this.shellCommander
			.command('access-container')
			.description('access a container using sh terminal')
			.alias('sh')
			.action(async () => {
				const accessContainer = new AccessContainer();
				await accessContainer.handle();
			});

		this.shellCommander
			.parse(process.argv)
			.description('Docker CLI')
			.version('0.0.1');
	}
}

const dockerCli = new DockerCli();

dockerCli.run();
