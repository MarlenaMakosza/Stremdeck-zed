import {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";

// Typ dla ustawień akcji
type ZedSettings = {
  endpoint?: string;
  title?: string;
  serverUrl?: string;
};

@action({ UUID: "com.lenerystia.zed.newwindow" })
export class ZedAction extends SingletonAction<ZedSettings> {
  // Domyślny URL serwera
  private serverUrl = "http://localhost:21422";

  // Gdy przycisk pojawia się na Stream Deck
  override async onWillAppear(ev: WillAppearEvent<ZedSettings>): Promise<void> {
    const settings = ev.payload.settings;

    // Ustaw tytuł przycisku
    const title = settings.title || "Zed";
    await ev.action.setTitle(title);

    // Użyj własnego URL jeśli podany
    if (settings.serverUrl) {
      this.serverUrl = settings.serverUrl;
    }

    console.log(
      `Button appeared: ${title} -> ${settings.endpoint || "/window/new"}`,
    );
  }

  // Gdy przycisk jest wciśnięty
  override async onKeyDown(ev: KeyDownEvent<ZedSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const endpoint = settings.endpoint || "/window/new";

    try {
      console.log(`Sending request to: ${this.serverUrl}${endpoint}`);

      // Wyślij żądanie do serwera
      const response = await fetch(`${this.serverUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Success:", data);

        // Pokaż zielony checkmark
        await ev.action.showOk();
      } else {
        console.error("Server error:", response.status);

        // Pokaż czerwony X
        await ev.action.showAlert();
      }
    } catch (error) {
      console.error("Connection error:", error);

      // Pokaż alert
      await ev.action.showAlert();
    }
  }

  // Gdy ustawienia się zmieniają
  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<ZedSettings>,
  ): Promise<void> {
    const settings = ev.payload.settings;

    // Zaktualizuj tytuł
    if (settings.title) {
      await ev.action.setTitle(settings.title);
    }

    // Zaktualizuj URL serwera
    if (settings.serverUrl) {
      this.serverUrl = settings.serverUrl;
    }
  }
}
