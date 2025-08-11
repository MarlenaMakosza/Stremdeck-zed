// use zed_extension_api::{self as zed, Command, LanguageServerId, Extension, Result, Worktree};

// struct StreamDeckExtension;

// impl Extension for StreamDeckExtension {
//     fn language_server_command(
//         &mut self,
//         _language_server_id: &LanguageServerId,
//         _worktree: &Worktree,
//     ) -> Result<Command> {
//         Ok(Command {
//             command: "node".to_string(),
//             args: vec![
//                 "-e".to_string(),
//                 r#"
//                 const http = require('http');
//                 const server = http.createServer((req, res) => {
//                 server.listen(21421, () => console.log('Stream Deck server running on port 21421'));
//                 "#.to_string(),
//             ],
//             env: Default::default(),
//         })
//     }
// }

// zed::register_extension!(StreamDeckExtension);
//


use zed_extension_api::{self as zed, Extension, Result};

 struct StreamDeckExtension {
     server_port: u16,
 }

 impl Extension for StreamDeckExtension {
     fn new() -> Self {
         Self { server_port: 21422 }
     }

     // 🔹 Obsługa slash commands
     fn run_slash_command(
         &self,
         command: SlashCommand,
         _args: Vec<String>,
         worktree: &Worktree,
     ) -> Result<SlashCommandOutput> {
         match command.name.as_str() {
             "sd_new" => {
                 // Wyślij żądanie do serwera Stream Deck
                 self.notify_streamdeck("new_window");
                 Ok(SlashCommandOutput {
                     sections: vec![
                         SlashCommandOutputSection {
                             range: (0..1),
                             label: "Opening new window...".to_string(),
                         }
                     ],
                     text: "✓ Command sent to Stream Deck".to_string(),
                 })
             }
             "sd_terminal" => {
                 self.notify_streamdeck("toggle_terminal");
                 Ok(SlashCommandOutput {
                     text: "✓ Terminal toggled".to_string(),
                     ..Default::default()
                 })
             }
             _ => Err("Unknown command".into())
         }
     }

     // 🔹 Language Server jako serwer HTTP
     fn language_server_command(
         &mut self,
         _language_server_id: &LanguageServerId,
         worktree: &Worktree,
     ) -> Result<Command> {
         // Uruchom serwer Node.js
         Ok(Command {
             command: "node".to_string(),
             args: vec![
                 worktree.path().join("streamdeck-server.js").to_str()?.to_string()
             ],
             env: vec![
                 ("PORT".to_string(), self.server_port.to_string())
             ].into_iter().collect(),
         })
     }
 }

 impl StreamDeckExtension {
     fn notify_streamdeck(&self, action: &str) {
         // WebAssembly nie może bezpośrednio robić HTTP
         // ale możemy użyć zed API do komunikacji
         zed::set_language_server_installation_status(
             &LanguageServerId::from("streamdeck"),
             &LanguageServerInstallationStatus::CheckingForUpdate
         );
     }
 }

 zed::register_extension!(StreamDeckExtension);