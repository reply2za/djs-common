import {ILogger} from "./dist/main/interfaces/ILogger";
import {EmbedBuilderLocal} from "./dist/main/utils/EmbedBuilderLocal";

declare namespace djsCommon {
    export {ILogger, EmbedBuilderLocal};
}


export = djsCommon;
