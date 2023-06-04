
import { DockerCliUseCase } from "../core/docker-cli-usecase";

type DockerContainer = {
  ID: string;
  Image: string;
  State: string;
  Status: string;
};

export class ListDockerContainersUseCase extends DockerCliUseCase {
  public async handle(): Promise<void> {
    const dockerContainers = this.listDockerDockerContainers();

    const containerId = await this.getDockerForLog(dockerContainers);

    await this.createLoggerForContainer(containerId);

    process.abort();
  }

  private async createLoggerForContainer(containerId: string) {
    this.shellCommander.exec(`docker logs -f ${containerId}`);
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
    dockerContainers: DockerContainer[]
  ): Promise<string> {
    const { containerId } = await this.shellInputs.prompt<{
      containerId: string;
    }>({
      type: "list",
      name: "containerId",
      message: "Select a container to show logs",
      choices: dockerContainers.map((dockerContainer) => {
        const containerIsRunning = dockerContainer.State === "running";

        return {
          name: ` ${containerIsRunning ? "✅" : "❌"} ${dockerContainer.ID} - ${
            dockerContainer.Image
          } - ${dockerContainer.State} - ${dockerContainer.Status}`,
          value: dockerContainer.ID,
          disabled: !containerIsRunning,
          checked: containerIsRunning,
        };
      }),
    });

    return containerId;
  }
}
