import {DockerCliUseCase} from '../core/docker-cli-usecase';
import type {DockerContainer} from '../dto/docker-container';
import {autoComplete} from '../utils/auto-complate';

export class RestartContainerUseCase extends DockerCliUseCase {
	public async handle(): Promise<void> {
		const containersRunning = this.listUpContainers();

		const choices = containersRunning
			.filter((item) => item.State === 'running')
			.map((container) => ({
				name: `🔄 ${container.Image} - ${container.State} - ${container.Status}`,
				value: container.ID,
			}));

		const response = await this.shellInputs.prompt<{containerName: string}>([
			{
				type: 'autocomplete' as any,
				name: 'containerName',
				message: 'Select container to restart',
				choices,
				source: (_: any, value = '') =>
					autoComplete(
						value,
						choices.map((choice) => choice.name),
					),
			},
		]);

		if (response?.containerName) {
			const selectedContainer = choices.find(
				(choice) => choice.name === response.containerName,
			);

			if (selectedContainer) {
				this.restartContainer(selectedContainer.value);
				this.shellCommander.echo(
					`Container ${selectedContainer.value} started`,
				);
			}
		}

		process.exit();
	}

	private restartContainer(containerId: string): void {
		this.shellCommander.exec(`docker restart ${containerId}`, {silent: false});
	}

	private listUpContainers(): DockerContainer[] {
		const string = this.shellCommander.exec('docker ps -a --format "json"', {
			silent: true,
		});

		const dockerContainers = string.stdout
			.split('\n')
			.filter((item) => item)
			.map((item) => JSON.parse(item));

		return dockerContainers as unknown as DockerContainer[];
	}
}
