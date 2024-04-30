import { listen } from "@tauri-apps/api/event"
import { appWindow } from "@tauri-apps/api/window"

import { Fs } from "./fs.js"
import { Ws } from "./ws.js"
import { DisplayStack } from "./display.js"
import type { Payload, KeyboardEventPackage, Config } from "./types.d.js"

const fs = new Fs()
let isAlwaysOnTop = () =>
	JSON.parse(localStorage.getItem("isAlwaysOnTop") || "false")
let isLogOpening = () =>
	JSON.parse(localStorage.getItem("isLogOpening") || "false")

async function setAlwaysOnTop() {
	await appWindow.setAlwaysOnTop(!isAlwaysOnTop())
	localStorage.setItem("isAlwaysOnTop", JSON.stringify(!isAlwaysOnTop()))
}

const unlistenLogOpeningOpen = async () => {
	return await listen<string>("open-log", (_event) => {
		localStorage.setItem("isLogOpening", "true")
		window.location.reload()
	})
}
const unlistenLogOpeningClose = async () => {
	return await listen<string>("close-log", (_event) => {
		localStorage.setItem("isLogOpening", "false")
		window.location.reload()
	})
}

window.onload = async () => {
	setTimeout(async () => {
		const cfg: Config = await fs.getConfig()
		const { websocket: wsConfig } = cfg
		const WS_URL = `${wsConfig.protocol}://${wsConfig.scope}:${wsConfig.port}`
		const ws = new Ws(WS_URL)

		const displayStack = new DisplayStack()

		if (isLogOpening()) {
			ws.onMessage = async (...args) => {
				await fs.log(`Ws Message ${[...args]}`, "INFO")
			}
			ws.onConnect = async () => {
				await fs.log(`Ws Connected`, "DEBUG")
			}
			ws.onClose = async () => {
				await fs.log(`Ws Closed`, "DEBUG")
			}
		}

		const unlisten = async () => {
			return await listen<Payload>("key", (event) => {
				const payload: Payload = event.payload
				const keyboardPackage: KeyboardEventPackage = {
					...payload,
					t: Date.now(),
				}

				setTimeout(() => {
					ws.send(JSON.stringify(keyboardPackage))
					displayStack.apply(payload)
					;(document.querySelector(".app") as HTMLDivElement) &&
						((document.querySelector(".app") as HTMLDivElement).innerText =
							displayStack.isEmpty()
								? "Keyboard Monitor"
								: displayStack.toString("+"))
				}, 0)
			})
		}

		setTimeout(async () => {
			await fs.log("KM Listening...", "INFO")

			if (!isLogOpening()) fs.log("Logger Disabled", "INFO")

			window.onerror = async (e) => {
				await fs.log(`${JSON.stringify(e)}`, "ERROR")
			}
		}, 1000)

		unlistenLogOpeningOpen()
		unlistenLogOpeningClose()

		unlisten()
	}, 500)
	;(document.querySelector(".app") as HTMLDivElement).addEventListener(
		"dblclick",
		() => {
			setAlwaysOnTop()
		}
	)
}
