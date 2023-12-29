import { decode } from '@/lib/wld'
import { useEffect, useState } from 'react'
import GiveawayAbi from '@/abi/Giveaway.abi'
import { ConnectKitButton } from 'connectkit'
import { keccak256, encodePacked } from 'viem'
import { useAccount, useContractWrite } from 'wagmi'
import { IDKitWidget, ISuccessResult, VerificationLevel, solidityEncode } from '@worldcoin/idkit'

export default function Home() {
	const { address } = useAccount()
	const [proof, setProof] = useState<ISuccessResult | null>(null)
	const [action, setAction] = useState<any | null>(null)
	const [signal, setSignal] = useState<any | null>(null)
	const [week, setWeek] = useState<number>(1)
	const [multiplier, setMultiplier] = useState<any>(1)
	const giveawayName = 'test'

	const { write } = useContractWrite({
		address: process.env.NEXT_PUBLIC_CONTRACT_ADDR as `0x${string}`,
		abi: GiveawayAbi,
		functionName: 'claimGiveaway',
		args: [
			BigInt(multiplier),
			address!,
			decode<bigint>('merkle_root', 'uint256', proof?.merkle_root as `0x${string}`),
			decode<[bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]>(
				'proof',
				'uint256[8]',
				proof?.proof as `0x${string}`
			),
			decode<bigint>('nullifier_hash', 'uint256', proof?.nullifier_hash as `0x${string}`),
			giveawayName,
			BigInt(week),
		],
	})
	useEffect(() => {
		setSignal(solidityEncode(['uint256', 'address'], [BigInt(multiplier), address!]))
		// Get the hex string value of the encoded then we parse this when we calculate the external nullifier
		setAction(hashEncodedBytes(encodePacked(['string', 'uint256'], [giveawayName, BigInt(week)])).digest)
	}, [proof, address, multiplier, week])

	const logContractValues = () => {
		console.log({
			args: [
				BigInt(multiplier),
				address!,
				decode<bigint>('merkle_root', 'uint256', proof?.merkle_root as `0x${string}`),
				decode<[bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]>(
					'proof',
					'uint256[8]',
					proof?.proof as `0x${string}`
				),
				decode<bigint>('nullifier_hash', 'uint256', proof?.nullifier_hash as `0x${string}`),
				giveawayName,
				BigInt(week),
			],
			signal: signal,
			action: action,
		})
	}

	return (
		<main>
			<div className="flex flex-col align-middle">
				<p>Giveaway Name: {giveawayName}</p>
				<p>address: {address}</p>
				<p>week: {week}</p>
				<p>multiplier: {multiplier}</p>
				{/* {action ? (
					<button
						onClick={() => {
							calculateExternalNullifierHash()
						}}
						className="w-20 bg-red-300 h-7"
					>
						Calculate
					</button>
				) : (
					''
				)} */}
				{address && signal && action ? (
					proof ? (
						<button
							onClick={() => {
								logContractValues()
								write()
							}}
						>
							submit tx
						</button>
					) : (
						<IDKitWidget
							signal={signal} // prize and address
							action={action} // Giveaway number
							onError={error => console.log(error)}
							onSuccess={setProof}
							verification_level={VerificationLevel.Device}
							app_id={process.env.NEXT_PUBLIC_APP_ID as `app_${string}`}
						>
							{({ open }) => <button onClick={open}>{`Claim ${giveawayName} with world id`}</button>}
						</IDKitWidget>
					)
				) : (
					<ConnectKitButton />
				)}
			</div>
		</main>
	)
}

const hashEncodedBytes = (input: `0x${string}` | Uint8Array) => {
	const hash = BigInt(keccak256(input)) >> 8n
	console.log(hash)
	const rawDigest = hash.toString(16)

	return { hash, digest: `0x${rawDigest.padStart(64, '0')}` }
}
// const hashString = (input: string) => {
// 	const bytesInput = Buffer.from(input)

// 	return hashEncodedBytes(bytesInput)
// }

// const packAndEncode = (input: [string, unknown][]) => {
// 	const [types, values] = input.reduce<[string[], unknown[]]>(
// 		([types, values], [type, value]) => {
// 			types.push(type)
// 			values.push(value)

// 			return [types, values]
// 		},
// 		[[], []]
// 	)
// 	console.log(types, values, input)
// 	// this type safes the values and so the calculation
// 	return hashEncodedBytes(encodePacked(types, values))
// }

// const calculateExternalNullifierHash = () => {
// 	console.log(
// 		// @ts-ignore
// 		packAndEncode([
// 			['uint256', hashString(process.env.NEXT_PUBLIC_APP_ID!).hash],
// 			...action.types.map((type: any, index: any) => [type, action.values[index]] as [string, unknown]),
// 		])
// 	)
// }
