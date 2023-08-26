import { TextualGameState } from "core/textual_game_state";
import { makeDiv } from "core/utils";
import { MODS } from "mods/modloader";
import { T } from "translations";

function labelWrap(text: string, element: any) {
    const label = document.createElement("label");
    label.innerText = text;
    label.appendChild(element);

    return label;
}

function makeNumberInput(number: string) {
    const input = document.createElement("input");
    input.type = "number";
    input.value = number;

    return input;
}

function makeCheckboxInput(checked: boolean) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;

    return input;
}

function createHeader(tier: any, text: string) {
    if (tier < 1 || tier > 6) tier = 6;
    const header = document.createElement(`H${tier}`);
    header.textContent = text;

    return header;
}

export class RELModExtrasSettingsState extends TextualGameState {
    mod: import("mods/mod").Mod | undefined;

    constructor() {
        super("RELModExtrasSettingsState");

        this.mod = MODS.mods.find((mod) => mod.metadata.id == "RandomEventsLib");
    }

    override getStateHeaderTitle() {
        return T.about.title;
    }

    override onEnter() {
        const content = document.querySelector(".mainContent");
        makeDiv(content!, undefined, [], "Settings");

        // @ts-ignore
        if (
            // @ts-ignore
            Object.keys(this.mod.stateEnterEvents).length == 0 || // @ts-ignore
            Object.keys(this.mod.ingameRandomEvents).length == 0
        )
            return;

        // @ts-ignore
        console.log(this.mod.stateEnterEvents);
        // @ts-ignore

        content!.appendChild(createHeader(2, "Events"));
        content!.appendChild(createHeader(3, "State Enter Events"));

        let SEEfoundModPrefixes: string[] = [];
        // @ts-ignore
        for (const eventState in this.mod.stateEnterEvents) {
            // @ts-ignore
            for (const event in this.mod.stateEnterEvents[eventState]) {
                if (event.split(":").length == 2) {
                    const prefix = event.split(":")[0];
                    if (!SEEfoundModPrefixes.includes(prefix!)) {
                        SEEfoundModPrefixes.push(prefix!);
                        content!.appendChild(createHeader(4, prefix!));
                    }
                    let input = makeCheckboxInput(true);
                    if (this.mod!.settings.disabledEvents.includes(event))
                        input = makeCheckboxInput(false);
                    input.addEventListener("change", () => {
                        if (
                            this.mod!.settings.disabledEvents.includes(event) &&
                            !input.checked
                        )
                            // If it is disabled and it just got set disabled
                            return;
                        if (
                            this.mod!.settings.disabledEvents.includes(event) &&
                            input.checked
                        ) {
                            // If it is disabled and it just got set enabled
                            const index =
                                this.mod!.settings.disabledEvents.indexOf(event);
                            if (index > -1) {
                                this.mod!.settings.disabledEvents.splice(index, 1);
                            }
                        }
                        if (
                            !this.mod!.settings.disabledEvents.includes(event) &&
                            !input.checked
                        )
                            // If it is enabled and it just got set disabled
                            this.mod!.settings.disabledEvents.push(event);
                    });
                    content!.appendChild(labelWrap(event.split(":")[1]!, input));
                    continue;
                }

                const input = makeCheckboxInput(true);
                input.addEventListener("change", () => {
                    if (
                        this.mod!.settings.disabledEvents.includes(event) &&
                        !input.checked
                    )
                        // If it is disabled and it just got set disabled
                        return;
                    if (
                        this.mod!.settings.disabledEvents.includes(event) &&
                        input.checked
                    ) {
                        // If it is disabled and it just got set enabled
                        const index = this.mod!.settings.disabledEvents.indexOf(event);
                        if (index > -1) {
                            this.mod!.settings.disabledEvents.splice(index, 1);
                        }
                    }
                    if (
                        !this.mod!.settings.disabledEvents.includes(event) &&
                        !input.checked
                    )
                        // If it is enabled and it just got set disabled
                        this.mod!.settings.disabledEvents.push(event);
                });
                content!.appendChild(labelWrap(event, input));
            }
        }

        content!.appendChild(createHeader(3, "Ingame Random Events"));

        let IREfoundModPrefixes: string[] = [];

        // @ts-ignore
        for (const event in this.mod.ingameRandomEvents) {
            if (event.split(":").length == 2) {
                const prefix = event.split(":")[0];
                if (!IREfoundModPrefixes.includes(prefix!)) {
                    IREfoundModPrefixes.push(prefix!);
                    content!.appendChild(createHeader(4, prefix!));
                }
                let input = makeCheckboxInput(true);
                if (this.mod!.settings.disabledEvents.includes(event))
                    input = makeCheckboxInput(false);

                input.addEventListener("change", () => {
                    if (
                        this.mod!.settings.disabledEvents.includes(event) &&
                        !input.checked
                    )
                        // If it is disabled and it just got set disabled
                        return;
                    if (
                        this.mod!.settings.disabledEvents.includes(event) &&
                        input.checked
                    ) {
                        // If it is disabled and it just got set enabled
                        const index = this.mod!.settings.disabledEvents.indexOf(event);
                        if (index > -1) {
                            this.mod!.settings.disabledEvents.splice(index, 1);
                        }
                    }
                    if (
                        !this.mod!.settings.disabledEvents.includes(event) &&
                        !input.checked
                    )
                        // If it is enabled and it just got set disabled
                        this.mod!.settings.disabledEvents.push(event);
                });
                content!.appendChild(labelWrap(event.split(":")[1]!, input));
                continue;
            }
            const input = makeCheckboxInput(true);
            input.addEventListener("change", () => {
                if (this.mod!.settings.disabledEvents.includes(event) && !input.checked)
                    // If it is disabled and it just got set disabled
                    return;
                if (this.mod!.settings.disabledEvents.includes(event) && input.checked) {
                    // If it is disabled and it just got set enabled
                    const index = this.mod!.settings.disabledEvents.indexOf(event);
                    if (index > -1) {
                        this.mod!.settings.disabledEvents.splice(index, 1);
                    }
                }
                if (!this.mod!.settings.disabledEvents.includes(event) && !input.checked)
                    // If it is enabled and it just got set disabled
                    this.mod!.settings.disabledEvents.push(event);
            });
            content!.appendChild(labelWrap(event, input));
        }
    }

    override onLeave() {
        this.mod!.saveSettings();
        //this.mod!.setConfig();
    }

    override getDefaultPreviousState() {
        return "SettingsState";
    }
}
