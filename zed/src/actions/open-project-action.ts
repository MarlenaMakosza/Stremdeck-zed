import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  DidReceiveSettingsEvent,
} from "@elgato/streamdeck";

// Ustawienia dla akcji Open Project
type ProjectSettings = {
  projectPath?: string;
  projectName?: string;
  serverUrl?: string;
};

@action({ UUID: "com.lenerystia.zed.openproject" })
export class OpenProjectAction extends SingletonAction<ProjectSettings> {
  
  // Domyślny URL serwera
  private serverUrl = "http://localhost:21422";

  // Gdy przycisk pojawia się na Stream Deck
  override async onWillAppear(ev: WillAppearEvent<ProjectSettings>): Promise<void> {
    const settings = ev.payload.settings;
    
    // Ustaw tytuł przycisku na nazwę projektu lub domyślną
    const title = settings.projectName || "Open Project";
    await ev.action.setTitle(title);
    
    // Użyj własnego URL jeśli podany
    if (settings.serverUrl) {
      this.serverUrl = settings.serverUrl;
    }
    
    console.log(`Project button appeared: "${title}" -> ${settings.projectPath || 'No path set'}`);
  }

  // Gdy przycisk jest wciśnięty
  override async onKeyDown(ev: KeyDownEvent<ProjectSettings>): Promise<void> {
    const settings = ev.payload.settings;
    
    // Sprawdź czy ścieżka projektu jest ustawiona
    if (!settings.projectPath) {
      console.error("No project path configured!");
      await ev.action.showAlert();
      return;
    }

    try {
      console.log(`Opening project: ${settings.projectPath}`);
      
      // Normalizuj ścieżkę - zamień \ na / dla JSON
      const normalizedPath = settings.projectPath.replace(/\\/g, '/');
      console.log(`Normalized path for JSON: ${normalizedPath}`);
      
      // Wyślij żądanie do serwera z ścieżką projektu
      const response = await fetch(`${this.serverUrl}/project/open`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: normalizedPath
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Project opened successfully:", data);
        
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
  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ProjectSettings>): Promise<void> {
    const settings = ev.payload.settings;
    
    // Zaktualizuj tytuł jeśli zmieniono nazwę projektu
    if (settings.projectName) {
      await ev.action.setTitle(settings.projectName);
    }
    
    // Zaktualizuj URL serwera
    if (settings.serverUrl) {
      this.serverUrl = settings.serverUrl;
    }
    
    console.log("Project settings updated:", settings);
  }
}