var $6bcaed30d64ae01e$exports = {};
"use strict";
Object.defineProperty($6bcaed30d64ae01e$exports, "__esModule", {
    value: true
});
$6bcaed30d64ae01e$exports.NumberLine = void 0;
$6bcaed30d64ae01e$exports.rangeMapper = $6bcaed30d64ae01e$var$rangeMapper;
/** Configurational description of the number line */ /** 
 * A stretchable, zoomable number line view model that can
 * be used to construct functional rulers and graphs 
 */ class $6bcaed30d64ae01e$var$NumberLine {
    _displacement = 0;
    _magnification = 1;
    _unitLength = -1;
    _unitValue = -1;
    constructor(_options){
        this._options = _options;
        this.initialize();
    }
    initialize() {
        this.options.initialDisplacement = this.options.initialDisplacement == undefined ? 0 : this.options.initialDisplacement;
        this.options.initialMagnification = this.options.initialMagnification == undefined ? 1 : this.options.initialMagnification;
        if (this.options.initialMagnification == undefined) this.options.initialMagnification = 1;
        else if (this.options.initialMagnification < 0) throw new Error("Initial Magnfication can never be negative. Try a number between 0 and 1 if you want to zoom out");
        if (this.options.stretchModulo == undefined) this.options.stretchModulo = 1.3;
        else if (this.options.stretchModulo <= 1) throw new Error("Stretch modulo cannot be <=1");
        this.options.stretchToFit = this.options.stretchToFit == undefined ? false : this.options.stretchToFit;
        this._magnification = this.options.initialMagnification;
        this._displacement = this.options.initialDisplacement;
        this.computeScale();
        if (this.options.stretchToFit && this.options.finiteEnd != undefined) this.stretchToFit(this.options.finiteEnd);
    }
    /**
   * Stretches the entire number line such that the first
   * value is the starting value(0) and the last value is the
   * {@link finalValue}
   * @param finalValue The last value on the number line
   */ stretchToFit(finalValue) {
        if (finalValue <= 0) throw new Error("Final value has to be positive. Consider using rangeFit instead");
        this._displacement = 0;
        this._magnification = this.baseCoverage / finalValue;
        this.computeScale();
    }
    /**
   * Fits a range within the base length
   * @param startValue Smaller value
   * @param endValue Bigger value
   */ rangeFit(startValue, endValue) {
        if (endValue <= startValue) throw new Error("Ending value has to be greater than starting value");
        const difference = endValue - startValue;
        this.stretchToFit(difference);
        this.moveBy(startValue * this.magnification);
    }
    /** 
   * Internal method that must be called everytime there is a change in magnification,
   * so as to recompute unit length and unit value. Computes in O(1) time
   * */ computeScale() {
        const repeater = 1 + this.magnification % this.options.stretchModulo;
        this._unitLength = $6bcaed30d64ae01e$var$rangeMapper(repeater, 1, this.options.stretchModulo + 1, this.options.breakpointLowerbound, this.options.breakpointUpperBound);
        const unitCount = this.baseLength / this._unitLength; // last value is unitCount * unit value
        // therefore, as magnification inversely divides last value
        this._unitValue = this.baseCoverage / (this.magnification * unitCount);
    }
    /**
   * Computes the value at specified distance from origin in O(1) time
   * @param location Position along the number line
   * @param wrtOrigin True implies location is with respect to origin.
   * False gives location with respect to the assumed start.
   * @returns the value on the number line on that distance
   */ valueAt(location, wrtOrigin) {
        this.computeScale();
        if (wrtOrigin) return location / this.unitLength * this.unitValue;
        else {
            // find out value since left most point (origin)
            const unitCount = location / this.unitLength;
            const valueSinceOrigin = unitCount * this.unitValue; // find out the value of displacement
            const valueOfDisplacement = this.displacement / this.unitLength * this.unitValue;
            return valueOfDisplacement + valueSinceOrigin;
        }
    }
    /**
   * Computes and returns the location of the 
   * given value along the number line
   * @param value value that rests at the number line
   * @param wrtOrigin True implies location is with respect to origin.
   * False gives location with respect to the assumed start.
   * @returns The location of this value w.r.t origin
   */ locationOf(value, wrtOrigin) {
        this.computeScale();
        if (wrtOrigin) return value / this.unitValue * this.unitLength;
        else return value / this.unitValue * this.unitLength - this.displacement;
    }
    /** 
   * Builds a view model describing this number line 
   * @returns A view model useful for rendering this number line
   * through any rendering technology or format
   */ buildViewModel(length) {
        this.computeScale();
        const tickGap = this.tickGap;
        const unitLength = this.unitLength;
        const unitValue = this.unitValue;
        const tickValue = unitValue / this.tickCount;
        let firstTickMarkValue;
        let firstTickMarkIndex;
        let firstTickMarkPosition;
        let totalNegativeTicks;
        if (this.displacement >= 0) {
            const tickCountsTillFirstTick = Math.ceil(this.displacement / unitLength * this.tickCount);
            firstTickMarkValue = tickCountsTillFirstTick * tickValue;
            firstTickMarkIndex = tickCountsTillFirstTick % this.tickCount;
            firstTickMarkPosition = tickCountsTillFirstTick * tickGap - this.displacement;
            totalNegativeTicks = 0;
        } else {
            const tickCountsTillFirstTick = Math.floor(-this.displacement / unitLength * this.tickCount);
            totalNegativeTicks = tickCountsTillFirstTick;
            firstTickMarkValue = -tickCountsTillFirstTick * tickValue;
            firstTickMarkIndex = this.tickCount - tickCountsTillFirstTick % this.tickCount - 1;
            firstTickMarkPosition = tickCountsTillFirstTick * tickGap - this.displacement;
        }
        const totalTicks = Math.floor((length - firstTickMarkPosition) / tickGap);
        const leftoverSpace = length - totalTicks * tickGap;
        const numberLineViewModel = {
            offset: firstTickMarkPosition,
            leftoverSpace: leftoverSpace,
            startingValue: this.firstValue,
            endingValue: this.valueAt(length, false),
            length: length,
            numberLine: this,
            tickMarks: [],
            gap: tickGap
        };
        for(let i = 0, currentTickValue = firstTickMarkValue, currentTickPosition = firstTickMarkPosition, currentTickIndex = firstTickMarkIndex, negativeTicksLeft = totalNegativeTicks; i < totalTicks; i++, currentTickValue += tickValue, currentTickPosition += tickGap, negativeTicksLeft--){
            const tickMarkViewModel = {
                value: currentTickValue,
                position: currentTickPosition,
                height: this.options.pattern[currentTickIndex],
                label: this.options.labelStrategy != null ? this.options.labelStrategy.labelFor(currentTickValue, currentTickIndex, currentTickPosition, this) : null
            };
            numberLineViewModel.tickMarks.push(tickMarkViewModel);
            const indexIncrementer = negativeTicksLeft > 0 ? -1 : 1;
            currentTickIndex += indexIncrementer;
            if (currentTickIndex < 0) currentTickIndex = this.tickCount - 1;
            else if (currentTickIndex >= this.tickCount) currentTickIndex = 0;
        }
        return numberLineViewModel;
    }
    /** 
   * Moves the ruler by a specified amount
   * @param delta The amount to move by. Value can be either positive or negative
   */ moveBy(delta) {
        this._displacement += delta;
    }
    /**
   * Magnifies the entire ruler either in or out
   * @param delta The amount to magnify by (+ve or -ve)
   * @param positionFromStart The position on the number line which
   * should not move because thats whats being zoomed around.
   * This position is relative to the start of the number line
   * @returns True if zoom was successful, false if zoom was out of range
   */ zoomAround(delta, positionFromStart) {
        if (this._magnification + delta <= 0) return false;
        const fixedValue = this.valueAt(positionFromStart, false); // const beforeZoom = this.locationOf(fixedValue);
        this._magnification += delta;
        this.computeScale();
        const afterZoom = this.locationOf(fixedValue, false);
        const cancelDifference = afterZoom - positionFromStart;
        this.moveBy(cancelDifference);
        return true;
    }
    get options() {
        return this._options;
    }
    /**
   * A factor that governs the scale of the number line.
   * When magnification==1, you are in the base case.
   * When magnification>1, you aer zooming out.
   * When magnification is b/w 0 and 1, you are zooming in. 
   */ get magnification() {
        return this._magnification;
    }
    /** 
   * The displacement of origin w.r.t the assumed
   * starting point of the number line. This can also
   * be thought of as offset. 
   */ get displacement() {
        return this._displacement;
    }
    /** The first value on the number line based on length, displacement and magnification */ get firstValue() {
        return this.valueAt(0, false);
    }
    /** The last value on the number line based on {@link baseLength}, displacement and magnification */ get lastValue() {
        return this.valueAt(this.baseLength, false);
    }
    /** Base final value for magnificaiton = 1, displacement=0 for base length */ get baseCoverage() {
        return this.options.baseCoverage;
    }
    /** Length of each unit based on current magnification, lower and upper breakpoints */ get unitLength() {
        return this._unitLength;
    }
    /** Value of each unit based on magnification and base value of a unit */ get unitValue() {
        return this._unitValue;
    }
    /** 
   * Shortcut for getting the basis length of the number line,
   * w.r.t which all calculations are performed 
   */ get baseLength() {
        return this.options.baseLength;
    }
    /** Number of tick marks in a unit */ get tickCount() {
        return this.options.pattern.length;
    }
    /** The gap between ticks in a unit. This is based on the length of each unit. */ get tickGap() {
        return this._unitLength / this.tickCount;
    }
}
/** Configurable callback to let the user of NumberLine to define their own tick mark labels */ $6bcaed30d64ae01e$exports.NumberLine = $6bcaed30d64ae01e$var$NumberLine;
/**
 * Linearly maps a number from the first range to the second range
 * @param x number lying between a and b
 * @param a lowerbound of first range
 * @param b upperbound of first range
 * @param c lowerbound of second range
 * @param d upperbound of second range
 * @returns number between {@link c} and {@link d} as a result of linear mapping
 */ function $6bcaed30d64ae01e$var$rangeMapper(x, a, b, c, d) {
    return (x - a) / (b - a) * (d - c) + c;
} /** ViewModel that describes what a number line looks like */ 


export {$6bcaed30d64ae01e$exports as default};
//# sourceMappingURL=number-line.js.map
