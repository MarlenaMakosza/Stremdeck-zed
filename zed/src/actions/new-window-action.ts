import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";

@action({ UUID: "com.lenerystia.zed.newwindow" })
export class NewWindowAction extends SingletonAction<NewWindowSettings> {
  override onWillAppear(
    ev: WillAppearEvent<NewWindowSettings>,
  ): void | Promise<void> {
    return ev.action.setTitle("New Window");
  }

  override async onKeyDown(ev: KeyDownEvent<NewWindowSettings>): Promise<void> {
    try {
      const response = await fetch('http://localhost:21422/new-window', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'new-window' })
      });
      
      if (response.ok) {
        console.log("New window request sent to Zed server");
        await ev.action.showOk();
      } else {
        console.error("Failed to open new window:", response.statusText);
        await ev.action.showAlert();
      }
      
    } catch (error) {
      console.error("Failed to connect to Zed server:", error);
      await ev.action.showAlert();
    }
  }
}

type NewWindowSettings = {
  path?: string;
};