import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, Location } from '../core/Constants';
import type Player from '../core/Player';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';

export interface IRandomDiscardProperties extends IPlayerTargetSystemProperties {
    amount?: number;
}

// TODO: this system has not been used or tested
export class RandomDiscardSystem extends PlayerTargetSystem {
    override defaultProperties: IRandomDiscardProperties = { amount: 1 };

    override name = 'discard';
    override eventName = EventName.OnCardsDiscardedFromHand;
    public constructor(propertyFactory: IRandomDiscardProperties | ((context: AbilityContext) => IRandomDiscardProperties)) {
        super(propertyFactory);
    }

    override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties: IRandomDiscardProperties = this.generatePropertiesFromContext(context);
        return [
            'make {0} discard {1} {2} at random',
            [properties.target, properties.amount, properties.amount > 1 ? 'cards' : 'card']
        ];
    }

    override canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        const properties: IRandomDiscardProperties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.amount > 0 && player.hand.size() > 0 && super.canAffect(player, context);
    }

    override addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties) as IRandomDiscardProperties;
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
        event.discardedAtRandom = true;
    }

    eventHandler(event): void {
        const player = event.player;
        const amount = Math.min(event.amount, player.hand.size());
        if (amount === 0) {
            return;
        }
        const cardsToDiscard = player.hand.shuffle().slice(0, amount);
        event.cards = cardsToDiscard;
        event.discardedCards = cardsToDiscard;
        player.game.addMessage('{0} discards {1} at random', player, cardsToDiscard);

        for (const card of cardsToDiscard) {
            player.moveCard(card, Location.Discard);
        }
    }
}