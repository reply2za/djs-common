# djs-common

**djs-common** focuses on providing a simple framework for discord bots using discord.js. 
This includes a command handler, event handler, and a utility class for attaching reactions.

## Features
- **Command Handler:** Easily manage and organize your Discord bot commands.
- **Event Handler:** Streamline the handling of Discord events with a simple event system.
- **Utilities:** Various utility functions to simplify common tasks.

## Installation

```bash
npm install djs-common
```

## Handlers
Once a command and event directory is set up, the handlers will automatically load all commands and events. The command or event name should be the same as the file name.
Invoking the command can be done as such:
```javascript
client.on('message', (message) => {
  commandHandler.handleCommand(message);
});
```
Initializing all the events in the provided events directory can be done as such:
```javascript
eventHandler.loadAllEvents((eventName, listener) => bot.on(eventName, listener));
```



## Example Usage

#### The commandHandler class should be overridden as such: 
```javascript
class CommandHandlerLocal extends CommandHandler<Message> {
    constructor() {
        // method to check if the user is an admin, root of the project to the commands dir, local to commands dir
        super(isAdmin, `./${config.sourceDirPath}/commands`, '../commands');
    }

    requireModule(): NodeJS.Require {
        return require;
    }

    fsModule(): typeof import('fs') {
        return fs;
    }
}

const commandHandler = new CommandHandlerLocal();
export { commandHandler };
```
Invoke in the main file as such:
```javascript
commandHandler.loadAllCommands();
```


#### The eventHandler class should be overridden as such: 
```javascript
class EventHandlerLocal extends EventHandler {
    constructor() {
        // root of the project to the events dir, local to events dir
        super(`./${config.sourceDirPath}/events`, '../events');
    }

    requireModule(): NodeJS.Require {
        return require;
    }

    fsModule(): typeof import('fs') {
        return fs;
    }
}
const eventHandler = new EventHandlerLocal();
export { eventHandler };
```
Invoke in the main file as such:
```javascript
eventHandler.loadAllEvents((eventName, listener) => bot.on(eventName, listener));
```

### Command/Event Files
Command and event classes should be created in the commands and events directory respectively.

myCommand.js
```javascript
exports.run = async(message) => {
    // code here
}
```

myEvent.js
```javascript
module.exports = async (eventObject) => {
    // code here
}
```

View usage [here](https://github.com/reply2za/db-bank/tree/main)

