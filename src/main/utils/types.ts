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

