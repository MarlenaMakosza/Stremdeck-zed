import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";

@action({ UUID: "com.lenerystia.zed.terminal" })
export class TerminalAction extends SingletonAction<TerminalSettings> {
  override onWillAppear(
    ev: WillAppearEvent<TerminalSettings>,
  ): void | Promise<void> {
    return ev.action.setTitle("Terminal");
  }

  override async onKeyDown(ev: KeyDownEvent<TerminalSettings>): Promise<void> {
    try {
      const response = await fetch('http://localhost:21422/terminal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'terminal' })
      });
      
      if (response.ok) {
        console.log("Terminal toggle sent to Zed server");
        await ev.action.showOk();
      } else {
        console.error("Failed to send terminal toggle:", response.statusText);
        await ev.action.showAlert();
      }
      
    } catch (error) {
      console.error("Failed to connect to Zed server:", error);
      await ev.action.showAlert();
    }
  }
}

type TerminalSettings = {
  command?: string;
};