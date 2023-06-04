
import { DockerCliUseCase } from '@core/docker-cli-usecase';

type DockerContainer = {
	ID: string;
	Image: string;
	State: string;
	Status: string;
};

export class ListDockerContainersUseCase extends DockerCliUseCase {
	public async handle(): Promise<void> {
		const dockerContainers = this.listDockerDockerContainers();

		console.log('dockerContainers', dockerContainers);
	}

	private listDockerDockerContainers(): DockerContainer[] {
		const dockerContainers = this.shellCommander.exec('docker ps -a --format "json"', {silent: true}) as unknown as DockerContainer[];

		return dockerContainers as unknown as DockerContainer[];
	}
}
