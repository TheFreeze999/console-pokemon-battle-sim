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

# Event Code
battle.runEvent('Foo', data: any, target: Battler, source: Battler, cause: Effect)
	- Calls onFoo on all of target's wielded effects' handlers.
		- Calls onAllyFoo on all of target's allies' wielded effects' handlers.
		- Calls onFoeFoo on all of target's foes' wielded effects' handlers.
	- Calls onSourceFoo on all of source's wielded effects' handlers.
		- Calls onAllySourceFoo on all of target's allies' wielded effects' handlers.
		- Calls onSourceFoeFoo on all of target's foes' wielded effects' handlers.
	
	- Calls onCauseFoo on cause's handlers.
	
	- Calls onFoo on Global event handlers.

	- Calls onAnyFoo on every effect from all Dexes.

