import { DockerCliUseCase } from '../core/docker-cli-usecase';
import { type DockerContainer } from '../dto/docker-container';
import { autoComplete } from '../utils/auto-complate';

export class StopContainerUseCase extends DockerCliUseCase {
	async handle(): Promise<void> {
		const containersRunning = this.listDockerDockerContainers();

		const choices = containersRunning.map((container) => ({
			name: `✅ ${container.Image} - ${container.State} - ${container.Status}`,
			value: container.ID,
		}));

		const response = await this.shellInputs.prompt<{ containerName: string }>([
			{
				type: 'autocomplete' as any,
				name: 'containerName',
				message: 'Select container to stop',
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
				this.stopContainer(selectedContainer.value);
				this.shellCommander.echo(`Container ${selectedContainer.name} stopped`);
			}
		}

		process.exit();
	}

	private stopContainer(containerId: string): void {
		this.shellCommander.exec(`docker stop ${containerId}`, { silent: false });
	}

	private listDockerDockerContainers(): DockerContainer[] {
		const string = this.shellCommander.exec('docker ps --format "json"', {
			silent: true,
		});

		const dockerContainers = string.stdout
			.split('\n')
			.filter((item) => item)
			.map((item) => JSON.parse(item));

		return dockerContainers as unknown as DockerContainer[];
	}
}
