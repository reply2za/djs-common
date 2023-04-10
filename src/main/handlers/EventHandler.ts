import {Awaitable} from "discord.js";

export abstract class EventHandler {
    rootToEvents: string;
    localToEvents: string;

    /**
     * Creates a new EventHandler.
     * @param rootToEvents The path to the events folder from the root of the project.
     * @param localToEvents The path to the events folder from the current file.
     */
    protected constructor(rootToEvents: string, localToEvents: string) {
        this.rootToEvents = rootToEvents;
        this.localToEvents = localToEvents;
    }

    /**
     * Loads all the events from the 'events' folder. The events should be in the form of 'eventName.js'.
     * @param addListenerCallback A callback that adds the event listener to the bot. (i.e. bot.on(eventName, event))
     */
    loadAllEvents(addListenerCallback: (eventName: string, listener: (...args: any[]) => Awaitable<void>) => void) {
        const files = this.fsModule().readdirSync(`${this.rootToEvents}`).filter((file) => file.endsWith('.js'));
        for (const file of files) {
            const eventName = file.split('.')[0];
            const event = this.requireModule()(`${this.localToEvents}/${file}`);
            addListenerCallback(eventName, event);
        }
        console.log('-loaded events-');
    }

    /**
     * Return the fs module.
     * @protected
     */
    protected abstract fsModule(): typeof import('fs');

    /**
     * Return the require module.
     * @protected
     */
    protected abstract requireModule(): NodeJS.Require;
}

