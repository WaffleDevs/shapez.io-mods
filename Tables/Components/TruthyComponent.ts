import { Component } from "game/component";
import { types } from "savegame/serialization";

export class TruthyBuildingComponent extends Component {
    truthyTable: string;
    lastInputs: string = ""; // 010001001

    deleteMe: number = 0;
    static override getId() {
        return "TruthyBlock";
    }

    static override getSchema() {
        // Here you define which properties should be saved to the savegame
        // and get automatically restored
        return {
            truthyTable: types.string,
            lastInputs: types.array,
        };
    }

    constructor() {
        super();
        this.truthyTable = "";
        this.lastInputs = "";
        this.deleteMe = 0;
    }
}
