import {
    ColorResolvable,
    Embed, EmbedAuthorData, EmbedAuthorOptions,
    EmbedBuilder,
    EmbedFooterOptions,
    Message,
    RestOrArray,
    TextBasedChannel
} from 'discord.js';
import {EmbedFieldLocal} from "./types";

/**
 * Local wrapper for EmbedBuilder.
 */
export class EmbedBuilderLocal {
    _embed: EmbedBuilder;


    /**
     * Creates a new EmbedBuilderLocal. If an embed is provided, it will be applied to the new embed. If not, a new embed will be created.
     * Timestamps are not transferred from the provided embed.
     * @param embed
     */
    constructor(embed?: Embed | undefined) {
        this._embed = new EmbedBuilder();
        if (embed){
            // apply the embed to the new embed
            this.setAuthor(embed.author);
            this.setColor(embed.color);
            this.setDescription(embed.description);
            this.setFooter(embed.footer);
            embed.image?.url && this.setImage(embed.image.url);
            embed.thumbnail?.url && this.setThumbnail(embed.thumbnail.url);
            this.setTitle(embed.title);
            this.setURL(embed.url);
            this.addFields(embed.fields);
        }
    }

    setTitle(value: string | null) {
        this._embed.setTitle(value);
        return this;
    }

    setDescription(value: string | null) {
        this._embed.setDescription(value);
        return this;
    }

    setColor(value: ColorResolvable | null) {
        this._embed.setColor(value);
        return this;
    }

    setURL(value: string | null) {
        this._embed.setURL(value);
        return this;
    }

    setAuthor(value: EmbedAuthorOptions | null) {
        this._embed.setAuthor(value);
        return this;
    }

    setFooter(value: EmbedFooterOptions | string | null) {
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

    /**
     * Appends fields to the embed
     * @param value
     */
    addFields(...value: RestOrArray<EmbedFieldLocal>) {
        this._embed.addFields(...value);
        return this;
    }

    /**
     * Sets the embed's fields
     * @param value
     */
    setFields(...value: RestOrArray<EmbedFieldLocal>) {
        this._embed.setFields(...value);
        return this;
    }

    setThumbnail(value: string | null) {
        this._embed.setThumbnail(value);
        return this;
    }

    setTimestamp(value: number | Date | null | undefined) {
        this._embed.setTimestamp(value);
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
    async edit(message: Message, content = ''): Promise<Message> {
        return message.edit({ embeds: [this.build()], content });
    }
}
