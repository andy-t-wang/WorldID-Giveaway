import { decodeAbiParameters } from 'viem'

export const decode = <T>(name: string, type: string, encodedString: `0x${string}` | undefined): T => {
	if (!encodedString) return undefined as unknown as T
	return decodeAbiParameters([{ name: name, type }], encodedString)[0] as T
}
