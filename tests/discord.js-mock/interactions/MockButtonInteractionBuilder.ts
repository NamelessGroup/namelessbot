import {
    ButtonInteraction,
    type Client,
    ComponentType,
    InteractionType,
} from "discord.js";
import { BaseMockInteractionBuilder } from "./BaseMockInteractionBuilder";
import { vi } from "vitest";

export class MockButtonInteractionBuilder extends BaseMockInteractionBuilder {
    private customButtonId: string;

    constructor(client?: Client) {
        super(client);
        this.customButtonId = "";
    }

    public setButtonId(buttonId: string): this {
        this.customButtonId = buttonId;
        return this;
    }

    public build(): ButtonInteraction {
        const interaction = Reflect.construct(ButtonInteraction, [
            this.client,
            {
                ...this.buildBaseInteraction(InteractionType.MessageComponent),
                data: {
                    component_type: ComponentType.Button,
                    custom_id: this.customButtonId,
                },
                channel_id: this.getTextChannel().id,
            },
        ]) as ButtonInteraction;

        interaction.deferReply = vi.fn();
        interaction.followUp = vi.fn();

        interaction.message.edit = vi.fn();

        return interaction;
    }
}
