/**!
 * Name: WackyEvents
 * Description: Uses RandomEventsLib to add several WaCkY eVeNtS.
 * Version: 1.0.0
 * Author(s): WaffleDevs
 */
var m=function(e,t){"use strict";const a={name:"WackyEvents",description:"Uses RandomEventsLib to add several WaCkY eVeNtS.",version:"1.0.0",id:"WackyEvents",extra:{authors:[{name:"WaffleDevs",email:"",website:"https://skimnerphi.net/waffledevs",icon:"https://avatars.githubusercontent.com/u/77215539?s=64"}],updateURL:"https://skimnerphi.net/api/v1/latest/WackyEvents"},author:"WaffleDevs",doesNotAffectSavegame:!0,website:"https://skimnerphi.net/mods/WackyEvents"};a.extra.changelog={"1.0.0":["Release"]};class s extends t.Mod{init(){this.metadata.extra.readme="<h1>Wacky Events</h1><h2>Latest: 1.0.0</h2><p>WaffleDevs</p><p>Uses RandomEventsLib to add several WaCkY eVeNtS.</p>",this.signals.stateEntered.add((e=>{if("PreloadState"===e.key){window.REL.registerStateEnterEvent("CloseGame","MainMenuState",(()=>{this.app.platformWrapper.exitApp()}),"WackyEvents");const e={Roar:()=>{const e=new Audio("https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3");e.volume=.2,e.play()},AutosaveClose:e=>{e.automaticSave.doSave(),setTimeout((()=>{this.app.platformWrapper.exitApp()}),1e3)}};window.REL.registerBulkIngameRandomEvent(e,"WackyEvents")}}))}}return e.default=s,e.m=a,e}({},shapez);$shapez_registerMod(m.default,m.m);
