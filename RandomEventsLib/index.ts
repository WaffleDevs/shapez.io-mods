import { createLogger } from "core/logging";
import { RandomNumberGenerator } from "core/rng";
import { Mod } from "mods/mod";
import { requireModExtras } from "../modUtils/me_utils";
import { MODS } from "mods/modloader";
import type { GameRoot } from "game/root";
import { RELModExtrasSettingsState } from "./RELModExtrasSettingsState";

// Todo: Some form of way to disable certain events
// Maybe custom state that allows editing a settings file with events listed like modId_eventName

// Todo: ModExtras way to change settings ingame.

const logger = createLogger("random_event_lib");

declare global {
    interface Window {
        REL: any;
    }
}

export default class extends Mod {
    stateEnterEvents: { [key: string]: any } = {};
    ingameRandomEvents: { [key: string]: any } = {};
    randomInterval: any;

    seed = 0;
    RNG = new RandomNumberGenerator();

    stateEnterEventChance = this.settings.stateEnterEventChance;
    randomEventInterval = this.settings.randomEventInterval;

    override init() {
        this.modInterface.registerCss(settingsCss);
        console.log(this.modLoader.mods);
        if (!requireModExtras(this, true)) {
            return;
        }
        if (this.settings.seed == 0) {
            this.settings.seed = Date.now();
            this.saveSettings();
        }
        this.seed = Math.floor(
            (Date.now() * this.settings.seed) / (Math.random() * 100001000010000)
        );
        this.RNG.choiceDict = function (obj: Object) {
            const keys = Object.keys(obj);
            return this.choice(keys);
        };
        this.RNG.chance = (chance: number) => {
            if (Number.isNaN(chance - 1)) return new Error("Argument 0 is Not A Number.");
            if (this.RNG.nextIntRange(1, 100) <= chance) return true;
            else return false;
        };

        this.RNG.reseed(this.seed);

        let initFinished = false;
        this.signals.stateEntered.add((state) => {
            if (state.key === "PreloadState") {
                window.REL = MODS.mods.find(
                    (mod) => mod.metadata.id === this.metadata.id
                );
                this.modInterface.registerGameState(RELModExtrasSettingsState);
            }
            if (state.key === "MainMenuState") {
                if (initFinished) return;
                this.initStateEnterEvents();
                this.initIngameRandomEvents();
                initFinished = true;
            }
        });
    }

    setConfig() {
        // ToDo: Add config updates here.
    }

    registerStateEnterEvent(
        eventName: string,
        state: string,
        func: Function,
        modPrefix: string = ""
    ) {
        eventName = `${modPrefix != "" ? `${modPrefix}:` : ""}${eventName}`;

        if (!Object.keys(this.stateEnterEvents).includes(state))
            this.stateEnterEvents[state] = {};

        if (this.stateEnterEvents[state][eventName] != undefined)
            return new Error(
                `There is already an SEE with name ${eventName} for the state ${state}`
            );

        logger.log(`Registering SEE: ${eventName} in ${state}.`);

        this.stateEnterEvents[state][eventName] = func;
        return;
    }

    registerBulkStateEnterEvent(events: { [key: string]: any }, modPrefix: string = "") {
        for (const event in events) {
            const eventName: string = `${modPrefix != "" ? `${modPrefix}:` : ""}${event}`;
            const state: string = events[event].state;
            const func: Function = events[event].function;

            if (!Object.keys(this.stateEnterEvents).includes(state))
                this.stateEnterEvents[state] = {};

            if (this.stateEnterEvents[state][eventName] != undefined)
                return new Error(
                    `There is already an SEE with name ${eventName} for the state ${state}`
                );

            logger.log(`Registering SEE: ${eventName} in ${state}.`);

            this.stateEnterEvents[state][eventName] = func;
        }
        return;
    }

    registerIngameRandomEvent(eventName: string, func: Function, modPrefix: string = "") {
        eventName = `${modPrefix != "" ? `${modPrefix}:` : ""}${eventName}`;
        if (this.ingameRandomEvents[eventName] != undefined)
            return new Error(`There is already an IRE with name ${eventName}`);

        logger.log(`Registering IRE: ${eventName}.`);
        this.ingameRandomEvents[eventName] = func;
        return;
    }

    registerBulkIngameRandomEvent(
        events: { [key: string]: any },
        modPrefix: string = ""
    ) {
        for (const event in events) {
            const eventName: string = `${modPrefix != "" ? `${modPrefix}:` : ""}${event}`;
            const func: Function = events[event];

            if (this.ingameRandomEvents[eventName] != undefined)
                return new Error(`There is already an IRE with name ${eventName}`);

            logger.log(`Registering IRE: ${eventName}.`);
            this.ingameRandomEvents[eventName] = func;
        }
        return;
    }

    initStateEnterEvents() {
        logger.log(
            `Initializing State Enter Events with chance ${this.stateEnterEventChance}`
        );

        this.signals.stateEntered.add((state) => {
            if (this.stateEnterEvents[state.key] == undefined) return;
            this.runStateEnterEvent(state.key);
        });

        if (this.stateEnterEvents["MainMenuState"] == undefined) return;
        this.runStateEnterEvent("MainMenuState");
    }

    runStateEnterEvent(state: string) {
        if (!this.RNG.chance(this.stateEnterEventChance)) return;

        const choice = this.RNG.choiceDict(this.stateEnterEvents[state]); //Pick the event

        //If disabled, do it again.
        if (this.settings.disabledEvents.includes(choice)) {
            logger.log(`${choice} disabled. Rerunning.`);
            this.runStateEnterEvent(state);
            return;
        }

        logger.log(`Running SEE: ${choice}. State: ${state}`);
        this.stateEnterEvents[state][choice]();
    }

    initIngameRandomEvents() {
        logger.log(
            `Initializing Ingame Random Events with timer ${this.randomEventInterval}`
        );

        this.signals.gameStarted.add((root: GameRoot) => {
            console.log(root);

            clearInterval(this.randomInterval);
            this.randomInterval = undefined;

            if (Object.keys(this.ingameRandomEvents).length == 0) return;

            this.randomInterval = setInterval(() => {
                this.runIngameRandomEvent(root);
            }, this.randomEventInterval);
        });
    }

    runIngameRandomEvent(root: GameRoot) {
        const choice = this.RNG.choiceDict(this.ingameRandomEvents); //Pick the event

        //If disabled, do it again.
        if (this.settings.disabledEvents.includes(choice)) {
            logger.log(`${choice} disabled. Rerunning.`);
            this.runIngameRandomEvent(root);
            return;
        }

        logger.log(`Running IRE: ${choice}.`);
        this.ingameRandomEvents[choice](root);
    }
}

const settingsCss = `#state_RELModExtrasSettingsState  .mainContent {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
  }
  
  #state_RELModExtrasSettingsState  label {
    pointer-events: all;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    width: 10em;
    height: 2em;
  
    border-radius: 0.3em;
    padding: 0 0.4em;
    transition: 0.15s background-color linear;
  
    &:hover {
      background-color: #00000015;
    }
  }
  
  
  #state_RELModExtrasSettingsState  input{
    cursor: default;
  
    &:hover:not(::-webkit-color-swatch) {
      filter: brightness(120%);
    }
  
    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }
  
    &::-webkit-color-swatch {
      border: none;
      border-radius: 0.2em;
      width: 3em;
      height: 1.5em;
  
      &:hover {
        outline: 0.05em solid #ffffff40;
      }
    }
  
    background-color: #9b3333;
    border-radius: 0.2em;
    width: 1.5em;
    height: 1.5em;
  
    &:checked {
      content: "×" !important;
      background-color: #398330;
      position: relative;
    }
  
    &:checked::after {
      content: "×" !important;
      text-align: center;
      position: absolute;
      font-size: 180%;
      color: white;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
  }
`;
