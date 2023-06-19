# Random Events Lib

Author: WaffleDevs
Version: 0.0.0
Mod Id: wah

### Description 
Allows mods to add Random Events that can happen upon entering a state (Ex. Going to the main menu, Opening the settings.) or can happen randomly during gameplay.
**Note: This mod doesn't do anything on it's own. You will need to download a mod using this library for it to do anything.**


### For Modders
There is an API that allows easily adding new State Enter Events (SEE) and Ingame Random Events (IRE).

To access it, get `window.REL` during the Preloader state.

>`window.REL.registerStateEnterEvent(eventName: string, state: string, func: Function)`
>
>Registers an SEE with name `eventName` that has a `X` chance to run `func` when `signals.stateEntered` runs for state `state`.`X` is determined by the mod's config entry, `stateEnterEventChance`. 

>`window.REL.registerIngameRandomEvent(eventName: string, func: Function)`
>
>Registers an IRE with name `eventName` that has a chance to run `func` every `X` seconds. `X` is determined by the mod's config entry, `randomEventInterval`.

There is also a modified version <a href="https://github.com/tobspr-games/shapez.io/blob/master/src/js/core/rng.js">`src/js/core/rng.js`</a> with the following methods:

>`window.REL.RNG.chance(chance: number)`
>
>Returns true every `chance`% of times.

>`window.REL.RNG.choiceDict(obj: Object)`
>
>The Object version of `RandomNumberGenerator.choice(array: Array)`. Returns a random key from the given Object.

The lib also allows for editing the `stateEnterEventChance` and `randomEventInterval` in case you want to mello out the experience or turn it to full hell.