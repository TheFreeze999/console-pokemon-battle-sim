var Types;
(function (Types) {
    let Type;
    (function (Type) {
        Type["???"] = "???";
        Type["NORMAL"] = "NORMAL";
        Type["FIRE"] = "FIRE";
        Type["WATER"] = "WATER";
        Type["ELECTRIC"] = "ELECTRIC";
        Type["GRASS"] = "GRASS";
        Type["ICE"] = "ICE";
        Type["FIGHTING"] = "FIGHTING";
        Type["POISON"] = "POISON";
        Type["GROUND"] = "GROUND";
        Type["FLYING"] = "FLYING";
        Type["PSYCHIC"] = "PSYCHIC";
        Type["BUG"] = "BUG";
        Type["ROCK"] = "ROCK";
        Type["GHOST"] = "GHOST";
        Type["DRAGON"] = "DRAGON";
        Type["DARK"] = "DARK";
        Type["STEEL"] = "STEEL";
        Type["FAIRY"] = "FAIRY";
    })(Type = Types.Type || (Types.Type = {}));
    Types.MATCHUP_TABLE = {
        [Type["???"]]: {
            weaknesses: [],
            resistances: [],
            immunities: []
        },
        [Type.NORMAL]: {
            weaknesses: [Type.FIGHTING],
            resistances: [],
            immunities: [Type.GHOST],
        },
        [Type.FIRE]: {
            weaknesses: [Type.WATER, Type.GROUND, Type.ROCK],
            resistances: [Type.FIRE, Type.GRASS, Type.ICE, Type.BUG, Type.STEEL, Type.FAIRY],
            immunities: [],
        },
        [Type.WATER]: {
            weaknesses: [Type.ELECTRIC, Type.GRASS],
            resistances: [Type.FIRE, Type.WATER, Type.ICE, Type.STEEL],
            immunities: [],
        },
        [Type.ELECTRIC]: {
            weaknesses: [Type.GROUND],
            resistances: [Type.ELECTRIC, Type.FLYING, Type.STEEL],
            immunities: [],
        },
        [Type.GRASS]: {
            weaknesses: [Type.FIRE, Type.ICE, Type.POISON, Type.FLYING, Type.BUG],
            resistances: [Type.WATER, Type.ELECTRIC, Type.GRASS, Type.GROUND],
            immunities: [],
        },
        [Type.ICE]: {
            weaknesses: [Type.FIRE, Type.FIGHTING, Type.ROCK, Type.STEEL],
            resistances: [Type.ICE],
            immunities: [],
        },
        [Type.FIGHTING]: {
            weaknesses: [Type.FLYING, Type.PSYCHIC, Type.FAIRY],
            resistances: [Type.BUG, Type.ROCK, Type.DARK],
            immunities: [],
        },
        [Type.POISON]: {
            weaknesses: [Type.GROUND, Type.PSYCHIC],
            resistances: [Type.GRASS, Type.FIGHTING, Type.BUG, Type.POISON, Type.FAIRY],
            immunities: [],
        },
        [Type.GROUND]: {
            weaknesses: [Type.WATER, Type.GRASS, Type.ICE],
            resistances: [Type.POISON, Type.ROCK],
            immunities: [Type.ELECTRIC],
        },
        [Type.FLYING]: {
            weaknesses: [Type.ELECTRIC, Type.ICE, Type.ROCK],
            resistances: [Type.GRASS, Type.FIGHTING, Type.BUG],
            immunities: [Type.GROUND],
        },
        [Type.PSYCHIC]: {
            weaknesses: [Type.BUG, Type.GHOST, Type.DARK],
            resistances: [Type.FIGHTING, Type.PSYCHIC],
            immunities: [],
        },
        [Type.BUG]: {
            weaknesses: [Type.FIRE, Type.FLYING, Type.ROCK],
            resistances: [Type.GRASS, Type.FIGHTING, Type.GROUND],
            immunities: [],
        },
        [Type.ROCK]: {
            weaknesses: [Type.WATER, Type.GRASS, Type.FIGHTING, Type.GROUND, Type.STEEL],
            resistances: [Type.NORMAL, Type.FIRE, Type.POISON, Type.FLYING],
            immunities: [],
        },
        [Type.GHOST]: {
            weaknesses: [Type.GHOST, Type.DARK],
            resistances: [Type.POISON, Type.BUG],
            immunities: [Type.NORMAL, Type.FIGHTING],
        },
        [Type.DRAGON]: {
            weaknesses: [Type.ICE, Type.DRAGON, Type.FAIRY],
            resistances: [Type.FIRE, Type.WATER, Type.ELECTRIC, Type.GRASS],
            immunities: [],
        },
        [Type.DARK]: {
            weaknesses: [Type.FIGHTING, Type.BUG, Type.FAIRY],
            resistances: [Type.GHOST, Type.DARK],
            immunities: [Type.PSYCHIC],
        },
        [Type.STEEL]: {
            weaknesses: [Type.FIRE, Type.FIGHTING, Type.GROUND],
            resistances: [Type.NORMAL, Type.GRASS, Type.ICE, Type.FLYING, Type.PSYCHIC, Type.BUG, Type.ROCK, Type.DRAGON, Type.STEEL, Type.FAIRY],
            immunities: [Type.POISON],
        },
        [Type.FAIRY]: {
            weaknesses: [Type.POISON, Type.STEEL],
            resistances: [Type.BUG, Type.FIGHTING, Type.DARK],
            immunities: [Type.DRAGON],
        },
    };
    function calcEffectiveness(attackingTypes, defendingTypes, _MATCHUP_TABLE = Types.MATCHUP_TABLE) {
        const calcSingleInteraction = (att, def) => {
            const tableRow = _MATCHUP_TABLE[def];
            if (tableRow.weaknesses.includes(att))
                return 2;
            if (tableRow.resistances.includes(att))
                return 0.5;
            if (tableRow.immunities.includes(att))
                return 0;
            return 1;
        };
        let result = 1;
        for (const attackingType of attackingTypes) {
            for (const defendingType of defendingTypes) {
                result *= calcSingleInteraction(attackingType, defendingType);
            }
        }
        return result;
    }
    Types.calcEffectiveness = calcEffectiveness;
    function getEffectivenessText(effectiveness, defenderName) {
        if (effectiveness === 0)
            return `It does't affect ${defenderName}...`;
        if (effectiveness >= 2)
            return "It's super effective!";
        if (effectiveness <= 0.5)
            return "It's not very effective...";
        return "";
    }
    Types.getEffectivenessText = getEffectivenessText;
})(Types || (Types = {}));
export default Types;
