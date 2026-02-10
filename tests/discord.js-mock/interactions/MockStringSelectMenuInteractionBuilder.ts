import {
    type Client,
    ComponentType,
    InteractionType,
    StringSelectMenuInteraction,
} from "discord.js";
import { BaseMockInteractionBuilder } from "./BaseMockInteractionBuilder";
import { vi } from "vitest";

export class MockStringSelectMenuInteractionBuilder extends BaseMockInteractionBuilder {
    private stringSelectMenuId: string;
    private stringSelectMenuValues: string[];

    constructor(client?: Client) {
        super(client);
        this.stringSelectMenuId = "";
        this.stringSelectMenuValues = [];
    }

    public setCustomId(customId: string): this {
        this.stringSelectMenuId = customId;
        return this;
    }

    public addValue(value: string): this {
        this.stringSelectMenuValues.push(value);
        return this;
    }

    public build(): StringSelectMenuInteraction {
        const interaction = Reflect.construct(StringSelectMenuInteraction, [
            this.client,
            {
                ...this.buildBaseInteraction(InteractionType.MessageComponent),
                data: {
                    component_type: ComponentType.StringSelect,
                    custom_id: this.stringSelectMenuId,
                    values: this.stringSelectMenuValues,
                },
                channel_id: this.getTextChannel().id,
            },
        ]) as StringSelectMenuInteraction;

        interaction.deferReply = vi.fn();
        interaction.followUp = vi.fn();

        return interaction;
    }
}
