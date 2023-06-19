declare module "shapez-env" {
    export function getMod(): Mod;
}

declare module "*.scss" {
    const content: string;
    export default content;
}

type STOP_PROPAGATION = "stop_propagation";
type SignalReceiver<T, S> = (this: S, ...arguments: T) => void | STOP_PROPAGATION;

interface TypedSignal<T extends Array> {
    add<S>(receiver: SignalReceiver<T, S>, scope?: S = null): void;
    addToTop<S>(receiver: SignalReceiver<T, S>, scope?: S = null): void;
    dispatch(...arguments: T): void | STOP_PROPAGATION;
    remove<S>(receiver: SignalReceiver<T, S>);
    removeAll(): void;
}

type LevelDefinition = "TODO"; // TODO
type UpgradeDefinition = "TODO"; // TODO

declare module "mods/mod" {
    import type { GameState } from "core/game_state";
    import type { BaseHUDPart } from "game/hud/base_hud_part";
    import type { GameRoot } from "game/root";
    import type { SerializedGame } from "savegame/savegame_typedefs";
    import type { InGameState } from "states/ingame";

    type GameLoadingStage = "TODO"; // TODO

    export interface Mod {
        signals: {
            appBooted: TypedSignal<[]>;
            modifyLevelDefinitions: TypedSignal<[LevelDefinition[]]>;
            modifyUpgrades: TypedSignal<[UpgradeDefinition[]]>;
            hudElementInitialized: TypedSignal<[BaseHUDPart]>;
            hudElementFinalized: TypedSignal<[BaseHUDPart]>;
            hudInitializer: TypedSignal<[GameRoot]>;
            gameInitialized: TypedSignal<[GameRoot]>;
            gameLoadingStageEntered: TypedSignal<[InGameState, GameLoadingStage]>;
            gameStarted: TypedSignal<[GameRoot]>;
            stateEntered: TypedSignal<[GameState]>;
            gameSerialized: TypedSignal<[GameRoot, SerializedGame]>;
            gameDeserialized: TypedSignal<[GameRoot, SerializedGame]>;
        };
    }
}

declare module "game/map_chunk" {
    interface MapChunk {
        containedEntitiesByLayer: {
            regular: Entity[];
            wires: Entity[];
        };
    }
}
