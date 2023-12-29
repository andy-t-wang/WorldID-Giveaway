import { decode } from '@/lib/wld'
import GiveawayAbi from '@/abi/Giveaway.abi'
import { keccak256, encodePacked } from 'viem'
import { useAccount, useContractWrite } from 'wagmi'
import { Suspense, useEffect, useState } from 'react'
import { ConnectKitButton, useIsMounted } from 'connectkit'
import { IDKitWidget, ISuccessResult, VerificationLevel, solidityEncode } from '@worldcoin/idkit'

export default function Home() {
	const isMounted = useIsMounted()

	const { address } = useAccount()
	const [proof, setProof] = useState<ISuccessResult | null>(null)
	const [action, setAction] = useState<any | null>(null)
	const [signal, setSignal] = useState<any | null>(null)
	const [week, setWeek] = useState<number>(1)
	const [multiplier, setMultiplier] = useState<any>(2)
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
		<main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
			<h1 className="text-3xl font-bold text-gray-700 mb-8">Welcome to our Giveaway!</h1>
			<div className="w-full max-w-md mx-auto bg-white shadow-md round-lg overflow-hidden rounded-md">
				<div className="flex items-start justify-between p-6 flex-col">
					<div className="flex items-center">
						<div className="mb-2">
							<h2 className="text-lg font-semibold text-gray-700">Giveaway: {giveawayName}</h2>
							<p className="text-sm text-gray-500"> User: {isMounted ? address : ''}</p>
						</div>
					</div>
					<div className="text-sm px-2 py-1 bg-gray-200 text-gray-800 rounded-full">Week: {week}</div>
				</div>
				<div className="p-6 pt-0">
					<p className="text-lg font-semibold text-gray-700">Earnings Multiplier: {multiplier}</p>
					<p className="text-sm text-gray-500 mt-4">
						This is a demo project that implements on chain verification where the signal and action must be
						reconstructed from variables with different types passed into the verify contract call.
					</p>
				</div>
				<div className="flex items-center justify-between p-6 border-t">
					<div className="flex items-center">
						<a className="text-sm text-gray-500 hover:underline" href="#">
							Terms & Conditions
						</a>
					</div>
					{isMounted && address && signal && action ? (
						proof ? (
							<button
								className="text-sm py-2 px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:bg-indigo-500"
								onClick={() => {
									logContractValues()
									write()
								}}
							>
								Submit Transaction
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
								{({ open }) => (
									<button
										className="text-sm py-2 px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:bg-indigo-500"
										onClick={open}
									>{`Claim with World Id`}</button>
								)}
							</IDKitWidget>
						)
					) : (
						<ConnectKitButton />
					)}
				</div>
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
