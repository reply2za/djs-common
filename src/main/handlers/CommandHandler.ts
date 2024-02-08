import path from "path";
import {Collection, TextChannel} from "discord.js";
import {CommandResponse, MessageEventCore} from "../utils/types";

export abstract class CommandHandler<T> {
    clientCommands = new Collection<string, { run: (event: MessageEventCore<T>) => Promise<void> }>();
    adminCommands = new Collection<string, { run: (event: MessageEventCore<T>) => Promise<void> }>();
    scheduledCommands = new Collection<string, { run: (event: MessageEventCore<T>) => Promise<void> }>();
    readonly #isAdmin: (id: string) => boolean;
    readonly #rootToCommands: string;
    readonly #localToCommands: string;

    /**
     *
     * @param isAdmin A function that returns true if the user is an admin.
     * @param rootToCommands The path to the commands folder from the project's root.
     * @param localToCommands The path to the commands folder from the concrete CommandHandler class file.
     * @protected
     */
    protected constructor(isAdmin: (id: string) => boolean, rootToCommands: string, localToCommands: string) {
        this.#isAdmin = isAdmin;
        this.#rootToCommands = rootToCommands;
        this.#localToCommands = localToCommands;
    }

    /**
     * Loads all the command sub-folders from the 'commands' folder.
     * Specifically looks for the 'client', 'admin', and 'scheduled' sub-folders.
     * The 'scheduled' folder is optional.
     */
    loadAllCommands() {
        try {
            this.#loadSpecificCommands('client', this.clientCommands);
        } catch (e) {
            console.log('[ERROR] expected at least one client command');
            throw e;
        }
        try {
            this.#loadSpecificCommands('admin', this.adminCommands);
        } catch (e: any) {
            if (e.message.includes(`no such file or directory, scandir '${this.#rootToCommands}/admin'`)) {
                console.log('[WARN] no admin commands found');
            } else {
                throw e;
            }
        }
        if (this.fsModule().existsSync(`${this.#rootToCommands}/scheduled`)) {
            this.#loadSpecificCommands('scheduled', this.scheduledCommands);
        }
        console.log('-loaded commands-');
    }

    /**
     * Executes an event based on the event statement. Uses getCommand to get the command to run.
     * All commands should have a run method that takes a MessageEventCore<T> as a parameter.
     * @param event
     */
    async execute(event: MessageEventCore<T>) {
        const commandObj = this.getCommand(event.statement, event.message.author.id);
        if (!commandObj.command) {
            this.commandNotFoundDuringExecution(event);
            return;
        } else {
            await commandObj.command.run(event);
            this.postCommandExecution(event, commandObj.isAdminCommand)
        }
    }

    /**
     * Returns either a user or admin command.
     * Only if the user is an admin will admin commands be retrievable.
     * @param statement The command name.
     * @param authorId The id of the author who sent the command.
     * @return Whether the comma
     */
    getCommand(statement: string, authorId: string): CommandResponse<T> {
        if (this.#isAdmin(authorId)) {
            const adminCommand = this.adminCommands.get(statement);
            return adminCommand ? {command: adminCommand, isAdminCommand: true} : this.getClientCommand(statement);
        } else {
            return this.getClientCommand(statement);
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
        const dirPath = `${this.#rootToCommands}/${cmdDirName}`;
        // maps a filename to the correct relative path
        let rootFiles = this.#parseRootDirectory(dirPath);
        rootFiles.jsFiles.forEach((fileName) => {
            this.#addCommandFileToMap(commandsMap, fileName, `${this.#localToCommands}/${cmdDirName}/${fileName}`);
        });
        for (const subDirName of rootFiles.subDirs) {
            const subDirPath = `${dirPath}/${subDirName}`;
            const subRootFiles = this.#parseRootDirectory(subDirPath);
            if (subRootFiles.subDirs.length > 0) throw new Error('unsupported file structure');
            subRootFiles.jsFiles.forEach((fileName) =>
                this.#addCommandFileToMap(commandsMap, fileName, `${this.#localToCommands}/${cmdDirName}/${subDirName}/${subDirName}.js`)
            );
        }
    }

    /**
     * Adds a command file to the commands map. The name of the command is the file name up to the first '.'.
     * @param commandsMap The map to add the command to.
     * @param fileName The name of the file.
     * @param path The relative path to the file.
     * @private
     */
    #addCommandFileToMap(commandsMap: Map<string, any>, fileName: string, path: string) {
        commandsMap.set(this.#formatFileName(fileName), this.requireModule()(path));
    }

    #formatFileName(fileName: string) {
        return fileName.split('.')[0];
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

    private getClientCommand(statement: string): CommandResponse<T> {
        return {command: this.clientCommands.get(statement), isAdminCommand: false};
    }

    /**
     * Upon successful command execution, this method is called.
     * @param event
     * @protected
     */
    protected postCommandExecution(event: MessageEventCore<T>, isAdminCommand: boolean) {
        // implement in subclass
    }

    /**
     * If the command is not found during execution, this method is called.
     * @param event
     * @protected
     */
    protected commandNotFoundDuringExecution(event: MessageEventCore<T>) {
        // implement in subclass
    }

    protected abstract fsModule(): typeof import("fs");

    protected abstract requireModule(): NodeJS.Require;

}
