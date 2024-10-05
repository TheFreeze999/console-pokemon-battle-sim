# Move Event Execution
1. Perform necessary checks
	Make sure of correct target selection
	Make sure user has not fainted
	Make sure at least one target is unfainted
2. Display usage text: BATTLER used MOVE!
3. For every target:
	If target has fainted, skip
	If move.isStandardDamagingAttack():
		Obtain type effectiveness from GetTypeEffectiveness event
		Check for immunity provided by ability/item etc. using CheckEffectBasedImmuntity event
		If either GetTypeEffectiveness or CheckEffectBasedImmuntity say that the target is immune:
			Display immune text
			Skip damage and secondary effects of move.
		Calculate inital damage value
		Obtain damage multiplier from GetDamageMultiplier event
		Apply Damage, (set isDirect to true)
		If damage event returns falsy, skip OnDamagingHit
		Run event OnDamagingHit
		Run event ApplyMoveSecondaries
		If damage event AND ApplyMoveSecondaries both return null, data.failed = true;
	Else:
		Run event ApplyMoveSecondaries
		If ApplyMoveSecondaries returns null, data.failed = true;
		




# Types of Moves
Waterfall
Thunderbolt
Quick Attack
Fake Out
Rock Slide
Earthquake
Power up punch
Swords dance
Screech
Relic Song
Thunder Wave
Rest
Recover
Aromatherapy
U-Turn
Parting Shot
Rain Dance
Aurora Veil
Reflect