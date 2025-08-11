import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";

@action({ UUID: "com.lenerystia.zed.build" })
export class BuildAction extends SingletonAction<BuildSettings> {
  override onWillAppear(
    ev: WillAppearEvent<BuildSettings>,
  ): void | Promise<void> {
    return ev.action.setTitle("Build");
  }

  override async onKeyDown(ev: KeyDownEvent<BuildSettings>): Promise<void> {
    try {
      const response = await fetch('http://localhost:21422/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'build' })
      });
      
      if (response.ok) {
        console.log("Build command sent to Zed server");
        await ev.action.showOk();
      } else {
        console.error("Failed to send build command:", response.statusText);
        await ev.action.showAlert();
      }
      
    } catch (error) {
      console.error("Failed to connect to Zed server:", error);
      await ev.action.showAlert();
    }
  }
}

type BuildSettings = {
  // No settings needed for now
};