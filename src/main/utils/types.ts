import {Message} from "discord.js";

export type MessageEventCore<T> = {
    // the command name
    statement: Readonly<string>;
    // the message object
    message: Message;
    // the message parameters in an array
    args: string[];
    // the prefix used
    prefix: string;
    // additional data that can be added to the event
    data: Map<T, any>;
};

export type EmbedFieldLocal = {
    name: string;
    value: string;
    inline?: boolean;
}

export type CommandResponse<T> = {
    command: { run: (event: MessageEventCore<T>) => Promise<void> } | undefined
    isAdminCommand: boolean
}
