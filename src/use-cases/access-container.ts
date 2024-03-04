import { DockerCliUseCase } from "../core/docker-cli-usecase";
import { DockerContainer } from "../dto/docker-container";
import { autoComplete } from "../utils/auto-complate";



export class AccessContainer extends DockerCliUseCase {
   public async handle(): Promise<void> {
    const containersRunning = this.listDockerContainers();

		const choices = containersRunning
			.filter((item) => item.State === 'running')
			.map((container) => ({
				name: ` '✅' ${container.Image} - ${container.State} - ${container.Status}`,
				value: container.ID,
			}));

		const response = await this.shellInputs.prompt<{ containerName: string }>([
			{
				type: 'autocomplete' as any,
				name: 'containerName',
				message: 'Select container to access using sh terminal',
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

      const {command} =  await this.shellInputs.prompt<{command:string}>({
          message: "Enter the command to run in the container:",
          type: "input",
          name: "command",
        })

				this.accessContainerHandle(command, selectedContainer.value);
			}
  }
}

  private listDockerContainers(): DockerContainer[] {
		const string = this.shellCommander.exec('docker ps -a --format "json"');

		const dockerContainers = string.stdout
			.split('\n')
			.filter((item) => item)
			.map((item) => JSON.parse(item));

		return dockerContainers as unknown as DockerContainer[];
	}


  private async  accessContainerHandle(commandRaw:string, containerId:string) {
     this.shellCommander.exec(`docker exec ${containerId} ${commandRaw}`)
      
  
  }

}