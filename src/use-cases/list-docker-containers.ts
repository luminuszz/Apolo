import { DockerCliUseCase } from '../core/docker-cli-usecase';
import { type DockerContainer } from '../dto/docker-container';

export class ListDockerContainersUseCase extends DockerCliUseCase {
	public async handle(): Promise<void> {
		const dockerContainers = this.listDockerDockerContainers();

		const containerId = await this.getDockerForLog(dockerContainers);

		await this.createLoggerForContainer(containerId);

		process.exit();
	}

	private async createLoggerForContainer(containerId: string) {
		this.shellCommander.exec(`docker logs -f ${containerId}`);
	}

	private listDockerDockerContainers(): DockerContainer[] {
		const string = this.shellCommander.exec('docker ps -a --format "json"', {
			silent: true,
		});

		const dockerContainers = string.stdout
			.split('\n')
			.filter((item) => item)
			.map((item) => JSON.parse(item));

		return dockerContainers as unknown as DockerContainer[];
	}

	private async getDockerForLog(
		dockerContainers: DockerContainer[],
	): Promise<string> {
		const { containerId } = await this.shellInputs.prompt<{
			containerId: string;
		}>({
			type: 'autocomplete' as any,
			name: 'containerId',
			message: 'Select a container to show logs',
			choices: dockerContainers.map((dockerContainer) => {
				const containerIsRunning = dockerContainer.State === 'running';

				return {
					name: ` ${containerIsRunning ? '✅' : '❌'} - ${
						dockerContainer.Image
					} - ${dockerContainer.State} - ${dockerContainer.Status} - ${
						dockerContainer.Ports || 'No ports mapping'
					}`,
					value: dockerContainer.ID,
					disabled: !containerIsRunning,
					checked: containerIsRunning,
				};
			}),
		});

		return containerId;
	}
}
