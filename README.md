<div align="center">
☁️ Kumo

A bouncy, AI-powered desktop companion that lives on your screen.
Drag it, throw it across your desktop, watch its eyes follow your cursor, and chat with a local LLM, all from a tiny cloud.


⬇️ Install (Windows)
Install Ollama and pull a model:
bash
   ollama pull YOUR_MODEL_NAME
Download kumo-1.0.0-setup.exe from the latest release.
Run it. Kumo installs silently and appears on your desktop.

Note: The installer isn't code-signed, so Windows SmartScreen may show "Windows protected your PC". Click More info, then Run anyway.

Quit Kumo from the system tray icon (right-click, Quit Kumo).



🛠️ Run from source
bash
git clone YOUR_REPO_URL
cd Kumo
npm install
npm run dev

Make sure Ollama is running and your model is pulled first.

To build the Windows installer:

bash
npm run build:win

The installer is written to the dist folder.


Project structure
src/
├── main/
│   ├── index.ts        # window, tray, cursor polling, IPC, auto-start
│   ├── physics.ts      # drag tracking + bounce physics
│   └── AI/ollama.ts    # streaming client for the local model
├── preload/
│   └── index.ts        # safe IPC bridge exposed as window.electron
└── renderer/src/
    ├── App.tsx         # Kumo, eyes, chat state, pointer handling
    ├── components/     # Chatbubble, Chatinput
    └── assets/         # body and eye artwork (designed in Figma)
    

🗺️ Roadmap
 Settings panel (model choice, bounce strength)
 macOS and Linux builds
 More moods and animations (sleepy, happy, thinking)
 Conversation memory
👩‍💻 Author

Faariah Waseem, B.Tech Computer Engineering, Aligarh Muslim University

GitHub · LinkedIn

<div align="center">Made with ☁️ and a lot of bouncing.</div>
