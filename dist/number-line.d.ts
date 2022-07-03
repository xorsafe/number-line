/** Configurational description of the number line */
export interface INumberLineOptions {
    /**
     * The genesys pattern that needs to be repeated over
     * the course of the number line's length. Each item is a tick
     * that has a length. The array must have at least one item.
     */
    pattern: number[];
    /** Base value of the number line for the area covered by {@link baseLength} */
    baseCoverage: number;
    /**
     * Length of the number line basis which all calculations are performed.
     * Note that the number line is virtually infinite but {@link baseLength}
     * along with {@link baseCoverage} governs the starting scale
     */
    baseLength: number;
    /** The lower bound breakpoint for unit length*/
    breakpointLowerbound: number;
    /** The upper bound breakpoint for unit length*/
    breakpointUpperBound: number;
    /** The labelling strategy for tick marks */
    labelStrategy: ITickMarkLabelStrategy;
    /**
     * A number (preferably close to 1) that governs how fast
     * the tick marks stretches upto {@link breakpointUpperBound}
     * before resetting back to the defined {@link breakpointLowerbound}.
     * The smaller the number the faster tick marks stretch. This number
     * must always be greater than 1
     * @default 1.3
     */
    stretchModulo?: number;
    /**
     * The initial displacement of the number line
     * with respect to the origin.
     * @default 0
     */
    initialDisplacement?: number;
    /**
     * The initial magnification of the number line.
     * @default 1
     */
    initialMagnification?: number;
    /**
     * The last value on the number line. Setting this value
     * means that the number line is bound.Optional.
     */
    finiteEnd?: number;
    /**
     * Stretches the entire number line such that the first
     * value is the starting value and the last value is the
     * ending value. Requires {@link finiteEnd} to be set.
     * @default false
     */
    strechToFit?: boolean;
}
/**
 * A strechable, zoomable number line view model that can
 * be used to construct functional rulers and graphs
 */
export class NumberLine {
    constructor(_options: INumberLineOptions);
    /**
     * Stretches the entire number line such that the first
     * value is the starting value(0) and the last value is the
     * {@link finalValue}
     * @param finalValue The last value on the number line
     */
    strechToFit(finalValue: number): void;
    /**
     * Fits a range within the base length
     * @param startValue Smaller value
     * @param endValue Bigger value
     */
    rangeFit(startValue: number, endValue: number): void;
    /**
     * Computes the value at specified distance from origin in O(1) time
     * @param location Position along the number line
     * @param wrtOrigin True implies location is with respect to origin.
     * False gives location with respect to the assumed start.
     * @returns the value on the number line on that distance
     */
    valueAt(location: number, wrtOrigin: boolean): number;
    /**
     * Computes and returns the location of the
     * given value along the number line
     * @param value value that rests at the number line
     * @param wrtOrigin True implies location is with respect to origin.
     * False gives location with respect to the assumed start.
     * @returns The location of this value w.r.t origin
     */
    locationOf(value: number, wrtOrigin: boolean): number;
    /**
     * Builds a view model describing this number line
     * @returns A view model useful for rendering this number line
     * through any rendering technology or format
     */
    buildViewModel(length: number): NumberLineViewModel;
    /**
     * Moves the ruler by a specified amount
     * @param delta The amount to move by. Value can be either positive or negative
     */
    moveBy(delta: number): void;
    /**
     * Magnifies the entire ruler either in or out
     * @param delta The amount to magnify by (+ve or -ve)
     * @param positionFromStart The position on the number line which
     * should not move because thats whats being zoomed around.
     * This position is relative to the start of the number line
     * @returns True if zoom was successful, false if zoom was out of range
     */
    zoomAround(delta: number, positionFromStart: number): boolean;
    get options(): INumberLineOptions;
    /**
     * A factor that governs the scale of the number line.
     * When magnification==1, you are in the base case.
     * When magnification>1, you aer zooming out.
     * When magnification is b/w 0 and 1, you are zooming in.
     */
    get magnification(): number;
    /**
     * The displacement of origin w.r.t the assumed
     * starting point of the number line. This can also
     * be thought of as offset.
     */
    get displacement(): number;
    /** The first value on the number line based on length, displacement and magnification */
    get firstValue(): number;
    /** The last value on the number line based on {@link baseLength}, displacement and magnification */
    get lastValue(): number;
    /** Base final value for magnificaiton = 1, displacement=0 for base length */
    get baseCoverage(): number;
    /** Length of each unit based on current magnification, lower and upper breakpoints */
    get unitLength(): number;
    /** Value of each unit based on magnification and base value of a unit */
    get unitValue(): number;
    /**
     * Shortcut for getting the basis length of the number line,
     * w.r.t which all calculations are performed
     */
    get baseLength(): number;
    /** Number of tick marks in a unit */
    get tickCount(): number;
    /** The gap between ticks in a unit. This is based on the length of each unit. */
    get tickGap(): number;
}
/** Configurable callback to let the user of NumberLine to define their own tick mark labels */
export interface ITickMarkLabelStrategy {
    /**
     * Callback for getting the tick mark label for each unit.
     * @param value Value of this tick mark
     * @param index Index of this tick mark in the tick mark pattern
     * @param position The position of this tick mark w.r.t start
     * @param numberLine The main number line requesting the label
     * @returns The formatted tick mark label. Return null for blank tick marks.
     */
    labelFor(value: number, index: number, position: number, numberLine: NumberLine): string;
}
/**
 * Linearly maps a number from the first range to the second range
 * @param x number lying between a and b
 * @param a lowerbound of first range
 * @param b upperbound of first range
 * @param c lowerbound of second range
 * @param d upperbound of second range
 * @returns number between {@link c} and {@link d} as a result of linear mapping
 */
export function rangeMapper(x: number, a: number, b: number, c: number, d: number): number;
/** ViewModel that describes what a number line looks like */
export interface NumberLineViewModel {
    /** The gap at the start of number line before a tick mark begins */
    offset: number;
    /** The trailing space left between the last tick mark and the length */
    leftoverSpace: number;
    /** Gap between tick marks */
    gap: number;
    /** Array of tick marks over the length of this view model */
    tickMarks: TickMarkViewModel[];
    /** The length of this ruler view model */
    length: number;
    /** The value at the start of the number line */
    startingValue: number;
    /** The value at the end of the number line */
    endingValue: number;
    /** The number line for which this view model was created */
    numberLine: NumberLine;
}
/** ViewModel that describes what a tick mark looks like */
export interface TickMarkViewModel {
    /** Height of the tick as governed by the tick mark pattern */
    height: number;
    /** Label on the tick mark as directly received from {@link ITickMarkLabelStrategy} */
    label: string;
    /** Value of this tick mark */
    value: number;
    /** Position of this tick mark from the start */
    position: number;
}

//# sourceMappingURL=number-line.d.ts.map
