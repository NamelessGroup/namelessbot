import { Client, Guild, GuildDefaultMessageNotifications, GuildExplicitContentFilter, GuildHubType, GuildMFALevel, GuildNSFWLevel, GuildPremiumTier, GuildVerificationLevel, Locale, SystemChannelFlagsBitField } from "discord.js"
import { RawGuildData } from "discord.js/typings/rawDataTypes";

export class MockGuildBuilder {
    private readonly client: Client;
    private name: string;
    private id: string;

    constructor(client: Client) {
        this.client = client;
        this.name = "Test Guild";
        this.id = "1234";
    }

    private buildData(): RawGuildData {
        return {
            name: this.name,
            id: this.id,
            afk_channel_id: null,
            afk_timeout: 60,
            application_id: null,
            banner: null,
            default_message_notifications: GuildDefaultMessageNotifications.AllMessages,
            description: null,
            discovery_splash: null,
            emojis: [],
            explicit_content_filter: GuildExplicitContentFilter.Disabled,
            features: [],
            hub_type: GuildHubType.Default,
            icon: null,
            incidents_data: null,
            mfa_level: GuildMFALevel.None,
            nsfw_level: GuildNSFWLevel.Safe,
            owner_id: "guildOwner",
            preferred_locale: Locale.EnglishUS,
            premium_progress_bar_enabled: false,
            premium_tier: GuildPremiumTier.None,
            public_updates_channel_id: null,
            roles: [],
            rules_channel_id: null,
            safety_alerts_channel_id: null,
            splash: null,
            stickers: [],
            system_channel_flags: new SystemChannelFlagsBitField().toJSON(),
            system_channel_id: null,
            vanity_url_code: null,
            verification_level: GuildVerificationLevel.None,
            region: ""
        }
    }

    public build(): Guild {
        const guild =  Reflect.construct(Guild, [
            this.client,
            this.buildData()
        ]) as Guild;

        this.client.guilds.cache.set(guild.id, guild);

        return guild;
    }
}