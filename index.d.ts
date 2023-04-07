import {ILogger as iLogger} from "./dist/main/interfaces/ILogger";
import {EmbedBuilderLocal as embedBuilderLocal} from "./dist/main/utils/EmbedBuilderLocal";

declare namespace djsCommon {
    export import ILogger = iLogger;
    export import EmbedBuilderLocal = embedBuilderLocal;
}


export = djsCommon;
