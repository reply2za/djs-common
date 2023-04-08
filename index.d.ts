import {ILogger} from "./dist/main/interfaces/ILogger";
import {EmbedBuilderLocal} from "./dist/main/utils/EmbedBuilderLocal";
import {MessageEventCore} from "./dist/main/utils/types";
import {CommandHandler} from "./dist/main/handlers/CommandHandler";

declare namespace djsCommon {
    export {ILogger, EmbedBuilderLocal, CommandHandler, MessageEventCore};
}


export = djsCommon;
