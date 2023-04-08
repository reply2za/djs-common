import path from "path";
import {Collection, TextChannel} from "discord.js";
import {MessageEventCore} from "../utils/types";

export abstract class CommandHandler<T> {
    clientCommands = new Collection<string, { run: (event: MessageEventCore<T>) => Promise<void> }>();
    adminCommands = new Collection<string, { run: (event: MessageEventCore<T>) => Promise<void> }>();
    scheduledCommands = new Collection<string, { run: (event: MessageEventCore<T>) => Promise<void> }>();
    readonly #isAdmin: (id: string) => boolean;
    readonly #sourcePath: string;

    protected constructor(isAdmin: (id: string) => boolean, sourcePath: string) {
        this.#isAdmin = isAdmin;
        this.#sourcePath = sourcePath;
    }

    /**
     * Loads all the command sub-folders from the 'commands' folder.
     * Specifically looks for the 'client', 'admin', and 'scheduled' sub-folders.
     * The 'scheduled' folder is optional.
     */
    loadAllCommands() {
        this.#loadSpecificCommands('client', this.clientCommands);
        this.#loadSpecificCommands('admin', this.adminCommands);
        try {
            this.#loadSpecificCommands('scheduled', this.scheduledCommands);
        } catch (e) {
            console.log('notice: no scheduled commands found');
        }
        console.log('-loaded commands-');
    }

    /**
     * Executes an event based on the event statement.
     * @param event
     */
    async execute(event: MessageEventCore<T>) {
        await this.getCommand(event.statement, event.message.author.id)?.run(event);
    }

    /**
     * Returns the command method for the given command name.
     * @param statement The command name.
     * @param authorId The id of the author who sent the command.
     */
    getCommand(statement: string, authorId: string): { run: (event: MessageEventCore<T>) => Promise<void> } | undefined {
        if (this.#isAdmin(authorId)) {
            return this.adminCommands.get(statement) || this.clientCommands.get(statement);
        } else {
            return this.clientCommands.get(statement);
        }
    }

    /**
     * Executes all commands in the 'scheduled' folder.
     */
    async runScheduledCommands(textChannel: TextChannel) {
        if (this.scheduledCommands.size < 1) return;
        const SCHEDULE_CMD_TEXT = 'running scheduled commands....';
        const message = await textChannel.send(SCHEDULE_CMD_TEXT);
        console.log(SCHEDULE_CMD_TEXT);
        const event: MessageEventCore<T> = {
            statement: 'general',
            message,
            args: [],
            prefix: '',
            data: new Map(),
        };
        for (const [, command] of this.scheduledCommands) {
            await command.run(event);
        }
    }


    #loadSpecificCommands(cmdDirName: string, commandsMap: Map<string, any>) {
        const innerPath = `commands/${cmdDirName}`;
        const dirPath = `./${this.#sourcePath}/${innerPath}`;
        // maps a filename to the correct relative path
        const cmdFileReference = new Map();
        let rootFiles = this.#parseRootDirectory(dirPath);
        rootFiles.jsFiles.forEach((fileName) => cmdFileReference.set(fileName, `../${innerPath}/${fileName}`));
        for (const subDirName of rootFiles.subDirs) {
            const subDirPath = `${dirPath}/${subDirName}`;
            const subRootFiles = this.#parseRootDirectory(subDirPath);
            if (subRootFiles.subDirs.length > 0) throw new Error('unsupported file structure');
            subRootFiles.jsFiles.forEach((fileName) =>
                cmdFileReference.set(fileName, `../${innerPath}/${subDirName}/${subDirName}.js`)
            );
        }
        cmdFileReference.forEach((relativePath, fileName) => {
            const commandName = fileName.split('.')[0];
            const command = this.requireModule()(relativePath);
            commandsMap.set(commandName, command);
        });
    }

    /**
     * Parses the provided directory and returns an object containing two lists.
     * One being all the immediate js files in the directory and the other being names of subdirectories.
     * @param dirPath From the project's root, the path to the directory to parse.
     * @private
     */
    #parseRootDirectory(dirPath: string) {
        const subDirs: string[] = [];
        const jsFiles = this.fsModule().readdirSync(dirPath).filter((fName) => {
            const extName = path.extname(fName);
            if (extName) {
                return extName === '.js';
            } else {
                subDirs.push(fName);
            }
            return false;
        });
        return {
            // the root js files in the directory
            jsFiles,
            // list of subdirectories
            subDirs,
        };
    }

    protected abstract fsModule(): typeof import("fs");

    protected abstract requireModule(): NodeJS.Require;

}
