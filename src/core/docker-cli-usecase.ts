import inquirer from 'inquirer';
import shellJs from 'shelljs';

export abstract class DockerCliUseCase {
	protected readonly shellCommander: typeof shellJs;

	protected readonly shellInputs: typeof inquirer;

	public constructor() {
		this.shellCommander = shellJs;
		this.shellInputs = inquirer;
	}

	public	abstract handle(): Promise<void>;
}
