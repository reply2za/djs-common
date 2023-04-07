import {
    ColorResolvable,
    EmbedAuthorOptions,
    EmbedBuilder,
    EmbedField,
    EmbedFooterOptions,
    Message,
    RestOrArray,
    TextBasedChannel
} from 'discord.js';

/**
 * Local wrapper for EmbedBuilder.
 */
export class EmbedBuilderLocal {
    _embed;

    constructor() {
        this._embed = new EmbedBuilder();
    }

    setTitle(value: string) {
        this._embed.setTitle(value);
        return this;
    }

    setDescription(value: string) {
        this._embed.setDescription(value);
        return this;
    }

    setColor(value: ColorResolvable) {
        this._embed.setColor(value);
        return this;
    }

    setURL(value: string) {
        this._embed.setURL(value);
        return this;
    }

    setAuthor(value: EmbedAuthorOptions) {
        this._embed.setAuthor(value);
        return this;
    }

    setFooter(value: EmbedFooterOptions | string) {
        if (typeof value === 'string') {
            this._embed.setFooter({ text: value });
        } else {
            this._embed.setFooter(value);
        }
        return this;
    }

    setImage(value: string) {
        this._embed.setImage(value);
        return this;
    }

    addFields(...value: RestOrArray<EmbedField>) {
        this._embed.addFields(...value);
        return this;
    }

    setFields(...value: RestOrArray<EmbedField>) {
        this._embed.setFields(...value);
        return this;
    }

    setThumbnail(value: string) {
        this._embed.setThumbnail(value);
        return this;
    }

    get data() {
        return this._embed.data;
    }

    /**
     * Returns an EmbedBuilder.
     * @return {EmbedBuilder} The EmbedBuilder.
     */
    build() {
        return this._embed;
    }

    /**
     * Sends the embed to the channel.
     * @param channel The text channel to send the embed to.
     * @return {Message} The new message.
     */
    async send(channel: TextBasedChannel): Promise<Message> {
        return channel.send({ embeds: [this.build()] });
    }

    /**
     * Sends the embed in place of an existing message.
     * @param message The message to edit.
     * @param content The content to send with the message.
     * @return {Message} The edited message.
     */
    async edit(message: Message, content = '') {
        return message.edit({ embeds: [this.build()], content });
    }
}
