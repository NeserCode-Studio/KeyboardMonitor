import { Payload } from "./types.d"

export class DisplayStack {
	public stack: Payload[] = []

	constructor(stack: Payload[] = []) {
		stack.forEach((item) => this.apply(item))
	}

	public apply(payload: Payload) {
		let former = this.stack.findIndex((item) => item.key === payload.key)
		if (former === -1) this.stack.push(payload)
		else if (this.stack[former].action === payload.action) return
		else this.stack.splice(former, 1)

		if (this.stack.length === 3) {
			let counter = 0
			const spPayloadCtrlLeft = {
				key: "ControlLeft",
				action: "release",
			}
			const spPayloadCtrlRight = {
				key: "ControlRight",
				action: "release",
			}
			const spPayloadDelete = {
				key: "Delete",
				action: "release",
			}
			const spPayloadAlt = {
				key: "Alt",
				action: "release",
			}
			const spArr = [
				spPayloadCtrlLeft,
				spPayloadCtrlRight,
				spPayloadDelete,
				spPayloadAlt,
			]

			spArr.forEach((p) => {
				const index = this.stack.findIndex(
					(item) => String(item.key) == String(p.key)
				)
				if (index !== -1) counter++
			})

			if (counter === 3) this.stack = []

			console.log(this.stack, counter)
		}

		console.log(this.stack)
	}

	public toString(separator: string = " ") {
		return this.stack.map((item) => item.key).join(separator)
	}

	public isEmpty() {
		return this.stack.length === 0
	}
}
