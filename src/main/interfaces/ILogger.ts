import {Message} from "discord.js";

export interface ILogger {

    errorLog(error: Error | string, additionalInfo: string): Promise<Message | undefined>;

    infoLog(info: string): Promise<Message | undefined>;

    debugLog(error: Error): Promise<Message | undefined>;

}

