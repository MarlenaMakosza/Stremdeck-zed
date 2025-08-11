import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { ZedAction } from "./actions/zed-action";

streamDeck.logger.setLevel(LogLevel.TRACE);

streamDeck.actions.registerAction(new ZedAction());

streamDeck.connect();

console.log("Zed Stream Deck plugin loaded!");
