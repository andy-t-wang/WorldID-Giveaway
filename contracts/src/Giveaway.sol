pragma solidity ^0.8.13;

/// @dev This allows us to use our hashToField function on bytes
import { ByteHasher } from './helpers/ByteHasher.sol';
import { IWorldID } from './interfaces/IWorldID.sol';
import 'forge-std/console.sol';

// TODO: Add Ownable
contract Giveaway {
	error InvalidNullifier();
	using ByteHasher for bytes;
	IWorldID internal immutable worldId;
	string appID = '';
	uint256 action_id_counter;
	uint256 action_id_min;
	uint256 internal immutable groupId = 1;
	mapping(uint256 => bool) internal nullifierHashes;
	mapping(string => bool) internal valid_giveaways;

	event Received(address sender, uint amount);
	event Claimed(string giveawayName, uint week);

	// Fallback function is called when the contract receives Ether without any data
	fallback() external payable {
		emit Received(msg.sender, msg.value);
	}

	// Receive function is called when msg.data is empty
	receive() external payable {
		emit Received(msg.sender, msg.value);
	}

	constructor(IWorldID _worldId, string memory _appID) {
		worldId = _worldId;
		appID = _appID;
		action_id_counter = 1;
		action_id_min = 0;
		valid_giveaways['test'] = true;
	}

	// aAssuming prize is standardized per giveaway?
	// Need to find a way to enforce random giveaways
	function claimGiveaway(
		uint256 prize_multiplier,
		address recipient,
		uint256 identityTreeRoot,
		uint256[8] memory proof,
		uint256 nullifierHash,
		string memory giveawayName,
		uint256 week
	) public {
		if (nullifierHashes[nullifierHash]) revert InvalidNullifier();

		require(action_id_min < week, 'Giveaway is not open');
		require(week <= action_id_counter, 'Giveaway is not open');
		require(valid_giveaways[giveawayName], 'Giveaway name is invalid');

		uint256 externalNullifierHash = abi
			.encodePacked(abi.encodePacked(appID).hashToField(), abi.encodePacked(giveawayName, week).hashToField())
			.hashToField();
		uint256 signal = abi.encodePacked(prize_multiplier, recipient).hashToField();

		// Will revert if the proof has already been verified once
		// On chain sequencer will verify if the root is valid
		worldId.verifyProof(
			identityTreeRoot, // Passed in
			groupId, // fixed
			signal, // computed
			nullifierHash, // Passed in
			externalNullifierHash, // computed
			proof // passed in
		);

		nullifierHashes[nullifierHash] = true;
		// To Eth .001 * prize
		payable(recipient).transfer(prize_multiplier * 1e16);
	}

	function createGiveaway(string memory giveawayName) public {
		valid_giveaways[giveawayName] = true;
	}

	function newWeek() public {
		action_id_counter++;
	}

	function endWeek(uint256 min) public {
		require(min > action_id_min, 'New min must be greater than previous min');
		action_id_min = min;
	}
}
