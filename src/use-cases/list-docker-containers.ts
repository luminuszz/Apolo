import { DockerCliUseCase } from "../core/docker-cli-usecase";
import { type DockerContainer } from "../dto/docker-container";
import { autoComplete } from "../utils/auto-complate";

export class ListDockerContainersUseCase extends DockerCliUseCase {
	public async handle(): Promise<void> {
		const dockerContainers = this.listDockerDockerContainers();

		const containerId = await this.getDockerForLog(dockerContainers);

		if (!containerId) {
			this.shellCommander.echo("No container selected");
			process.exit();
		}

		await this.createLoggerForContainer(containerId);

		process.exit();
	}

	private async createLoggerForContainer(containerId: string) {
		this.shellCommander.exec(`docker logs --tail 2000 -f  ${containerId}`);
	}

	private listDockerDockerContainers(): DockerContainer[] {
		const string = this.shellCommander.exec('docker ps -a --format "json"', {
			silent: true,
		});

		const dockerContainers = string.stdout
			.split("\n")
			.filter((item) => item)
			.map((item) => JSON.parse(item));

		return dockerContainers as unknown as DockerContainer[];
	}

	private async getDockerForLog(
		dockerContainers: DockerContainer[],
	): Promise<string | null> {
		const choices = dockerContainers.map((dockerContainer) => {
			const containerIsRunning = dockerContainer.State === "running";

			return {
				name: ` ${containerIsRunning ? "✅" : "❌"} - ${
					dockerContainer.Image
				} - ${dockerContainer.State} - ${dockerContainer.Status} - ${
					dockerContainer.Ports || "No ports mapping"
				}`,
				value: dockerContainer.ID,
				disabled: !containerIsRunning,
				checked: containerIsRunning,
			};
		});

		const { containerName } = await this.shellInputs.prompt<{
			containerName: string;
		}>([
			{
				type: "autocomplete" as any,
				name: "containerName",
				message: "Select a container to show logs",
				source: (_: any, value = "") =>
					autoComplete(
						value,
						choices.map((choice) => choice.name),
					),
				choices,
			},
		]);

		const container = choices.find((choice) => choice.name === containerName);

		return container?.value ?? null;
	}
}
