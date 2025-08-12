import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { ZedAction } from "./actions/zed-action";
import { OpenProjectAction } from "./actions/open-project-action";

streamDeck.logger.setLevel(LogLevel.TRACE);

// Rejestrujemy nasze akcje - każda to osobny przycisk!
streamDeck.actions.registerAction(new ZedAction());         // New Window
streamDeck.actions.registerAction(new OpenProjectAction()); // Open Project

streamDeck.connect();

console.log("Zed Stream Deck plugin loaded!");
