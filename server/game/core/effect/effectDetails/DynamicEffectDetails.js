const StaticEffectDetails = require('./StaticEffectDetails');

class DynamicEffectDetails extends StaticEffectDetails {
    constructor(type, calculate) {
        super(type);
        this.values = {};
        this.calculate = calculate;
    }

    /** @override */
    apply(target) {
        super.apply(target);
        this.recalculate(target);
    }

    /** @override */
    recalculate(target) {
        let oldValue = this.getValue(target);
        let newValue = this.setValue(target, this.calculate(target, this.context));
        if (typeof oldValue === 'function' && typeof newValue === 'function') {
            return oldValue.toString() !== newValue.toString();
        }
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        }
        return oldValue !== newValue;
    }

    /** @override */
    getValue(target) {
        if (target) {
            return this.values[target.uuid];
        }
    }

    setValue(target, value) {
        this.values[target.uuid] = value;
        return value;
    }
}

module.exports = DynamicEffectDetails;
