import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { IncrementCounter } from "./actions/increment-counter";
import { TerminalAction } from "./actions/terminal-action";
import { BuildAction } from "./actions/build-action";
import { NewWindowAction } from "./actions/new-window-action";

streamDeck.logger.setLevel(LogLevel.TRACE);

streamDeck.actions.registerAction(new IncrementCounter());

streamDeck.connect();
