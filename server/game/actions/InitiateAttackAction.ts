import type { AbilityContext } from '../core/ability/AbilityContext.js';
import PlayerAction from '../core/ability/PlayerAction.js';
import { AbilityRestriction, PhaseName, WildcardLocation } from '../core/Constants.js';
import * as EnumHelpers from '../core/utils/EnumHelpers.js';
import { exhaustSelf } from '../costs/CostLibrary.js';
import * as GameSystemLibrary from '../gameSystems/GameSystemLibrary.js';
import { Card } from '../core/card/Card';
import { AttackStepsSystem, IAttackProperties } from '../gameSystems/AttackStepsSystem.js';

/**
 * Implements the action for a player to initiate an attack from a unit.
 * Calls {@link AttackStepsSystem} to resolve the attack.
 *
 * Default behaviors can be overridden by passing in an {@link IAttackProperties} object.
 * See {@link GameSystemLibrary.attack} for using it in abilities.
 */
export class InitiateAttackAction extends PlayerAction {
    public constructor(card: Card, private attackProperties?: IAttackProperties) {
        super(card, 'Attack', [exhaustSelf()], {
            immediateEffect: new AttackStepsSystem({ attacker: card }),
            locationFilter: WildcardLocation.AnyAttackable,
            activePromptTitle: 'Choose a target for attack'
        });
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            context.game.currentPhase !== PhaseName.Action &&
            !ignoredRequirements.includes('phase')
        ) {
            return 'phase';
        }
        if (context.player !== context.source.controller) {
            return 'player';
        }
        if (
            !EnumHelpers.isArena(context.source.location) &&
            !ignoredRequirements.includes('location')
        ) {
            return 'location';
        }
        if (context.player.hasRestriction(AbilityRestriction.Attack, context)) {
            return 'restriction';
        }
        return super.meetsRequirements(context);
    }

    public override executeHandler(context: AbilityContext): void {
        const attackSystemProperties = Object.assign(this.attackProperties ?? {}, {
            attacker: context.source
        });

        new AttackStepsSystem(attackSystemProperties).resolve(context.target, context);
    }
}
