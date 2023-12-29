export default [
	{
		inputs: [
			{ internalType: 'contract IWorldID', name: '_worldId', type: 'address' },
			{ internalType: 'string', name: '_appID', type: 'string' },
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{ inputs: [], name: 'InvalidNullifier', type: 'error' },
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'string', name: 'giveawayName', type: 'string' },
			{ indexed: false, internalType: 'uint256', name: 'week', type: 'uint256' },
		],
		name: 'Claimed',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'address', name: 'sender', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
		],
		name: 'Received',
		type: 'event',
	},
	{ stateMutability: 'payable', type: 'fallback' },
	{
		inputs: [
			{ internalType: 'uint256', name: 'prize_multiplier', type: 'uint256' },
			{ internalType: 'address', name: 'recipient', type: 'address' },
			{ internalType: 'uint256', name: 'identityTreeRoot', type: 'uint256' },
			{ internalType: 'uint256[8]', name: 'proof', type: 'uint256[8]' },
			{ internalType: 'uint256', name: 'nullifierHash', type: 'uint256' },
			{ internalType: 'string', name: 'giveawayName', type: 'string' },
			{ internalType: 'uint256', name: 'week', type: 'uint256' },
		],
		name: 'claimGiveaway',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'string', name: 'giveawayName', type: 'string' }],
		name: 'createGiveaway',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: 'min', type: 'uint256' }],
		name: 'endWeek',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{ inputs: [], name: 'newWeek', outputs: [], stateMutability: 'nonpayable', type: 'function' },
	{ stateMutability: 'payable', type: 'receive' },
] as const
