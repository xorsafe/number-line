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
	/** 
	 * The speed with which the number line magnifies.
	 * Negative number or zero not allowed.
	 * @default 10
	 */
	zoomStep?: number;
	/** 
	 * The amount by which unit length is increased or decreased with changes in magnification.
	 * Must be greater than 0.
	 * @default 1
	 */
	zoomFactor?: number;
	/** The lower bound breakpoint for unit length*/
	breakpointLowerbound: number;
	/** The upper bound breakpoint for unit length*/
	breakpointUpperBound: number;
	/** The labelling strategy for tick marks */
	labelStrategy: ITickMarkLabelStrategy;
	/** 
	 * The initial displacement of the number line
	 * with respect to the origin.
	 * @default 0 
	 */
	initialDisplacement?: number;
	/** 
	 * The initial magnification of the number line.
	 * Negative number will zoom out, positive number will zoom in.
	 * @default 0 
	 */
	initialMagnification?: number;
}


/** 
 * A strechable, zoomable number line view model that can
 * be used to construct functional rulers and graphs 
 */
export class NumberLine {

	private _unitLength: number;
	private _unitValue: number;
	private _magnification: number;
	private _displacement: number;
	private _biggestTickPatternValue: number;

	constructor(private options: INumberLineOptions) {
		this.initialize();
	}

	private initialize() {
		if (this.options.breakpointLowerbound > this.options.breakpointUpperBound) {
			throw new Error("Breakpoint lower bound cannot be greater than breakpoint upper bound");
		}
		this._unitLength = this.options.breakpointLowerbound;
		this._unitValue = this.getBaseUnitValue();
		if(this.options.zoomStep<=0){
			throw new Error("Zoom step cannot be negative or zero");
		}
		if(this.options.zoomFactor<=0){
			throw new Error("Zoom factor cannot be negative or zero");
		}
		this._biggestTickPatternValue = this.options.pattern.reduce((a, b) => Math.max(a, b), 0);
		this.options.zoomStep = this.options.zoomStep || 10;
		this.options.zoomFactor = this.options.zoomFactor || 1;
		this.zoomTo(this.options.initialMagnification || 0);
		this.panTo(this.options.initialDisplacement || 0);
	}

	private getBaseUnitValue(): number {
		return this.options.baseCoverage / this.options.baseLength;
	}

	get biggestTickPatternValue():number{
		return this._biggestTickPatternValue;
	}

	get unitLength(): number {
		return this._unitLength;
	}
	get unitValue(): number {
		return this._unitValue;
	}
	get magnification(): number {
		return this._magnification;
	}
	get displacement(): number {
		return this._displacement;
	}

	/**
	 * Zooms the number line to the specified magnification
	 *
	 * @param {number} magnification - the magnification level
	 * @return {void} 
	 */
	zoomTo(magnification: number):void {
		this._unitLength = sawtooth(magnification, this.options.breakpointLowerbound, this.options.breakpointUpperBound, this.options.zoomStep);
		const level = staircase(magnification, this.options.zoomFactor, this.options.zoomStep);
		if(level==0){
			this._unitValue = this.getBaseUnitValue();
		}else if(level>0){
			this._unitValue = this.getBaseUnitValue() / level;
		}else{
			this._unitValue = this.getBaseUnitValue() * Math.abs(level);
		}
	}

    /**
     * Zooms around a position by a specified amount.
     *
     * @param {number} position - The position to zoom around. This position will be frozen throughout the zoom.
     * @param {number} by - The delta amount to zoom by.
     */
	zoomAround(position: number, by: number) {
		const originalDisplacement = this.displacement;
		const valueAtHingePoint = this.valueAt(position);
		this.panTo(0);
		this.zoomTo(this.magnification + by);
		const newPositionForHingePoint = this.positionOf(valueAtHingePoint);
		const shift = newPositionForHingePoint - position;
		const newDisplacement = originalDisplacement - shift;
		this.panTo(newDisplacement);
	}

	/**
	 * Simply sets the displacement of the number line
	 * to the specified position.
	 * @param {number} position - The position to pan to.
	 */
	panTo(position: number) {
		this._displacement = position;
	}

	/**
	 * Increases/Decreases the displacement by the given delta.
	 * @param {number} delta - The amount to increase the displacement by.
	 */
	panBy(delta:number){
		this._displacement += delta;
	}

	/**
	 * Position of the given value in the number line in 
	 * whatever unit is used for rendering(most commonly pixels)
	*
	 * @param {number} value - Value on the number line
	 * @return {number} description of return value
	 */
	positionOf(value:number):number{
		return this._displacement + (this._unitLength/this._unitValue) * value;
	}

	/**
	 * Calculates the value at a given position.
	 * @param {number} position - The position at which to calculate the value.
	 */
	valueAt(position:number):number{
		return (position + this._displacement) / (this._unitLength/this._unitValue);
	}

	/**
	 * Returns a value that represents the current scaled amount on the number line
	 * @param length Length of the number line in whatever unit is used for rendering it(most likely in pixels)
	 */
	measure(length:number):number{
		return this._unitValue/this._unitLength * length;
	}

	/** Number of tick marks in a unit */
	get tickCount():number{
		return this.options.pattern.length;
	} 

	/** 
	 * Builds a view model describing this number line 
	 * @returns A view model useful for rendering this number line
	 * through any rendering technology or format
	 */
	buildViewModel(length: number): NumberLineViewModel {
		const tickGap = this._unitLength/this.tickCount;
		const unitLength = this.unitLength;
		const unitValue= this.unitValue;
		const tickValue= unitValue/this.tickCount;
		
		let firstTickMarkValue:number;
		let firstTickMarkIndex:number;
		let firstTickMarkPosition:number;
		let totalNegativeTicks:number;
		if(this.displacement>=0){
			const tickCountsTillFirstTick = Math.ceil((this.displacement/unitLength)*this.tickCount)
			firstTickMarkValue = tickCountsTillFirstTick*tickValue;
			firstTickMarkIndex = tickCountsTillFirstTick % this.tickCount;
			firstTickMarkPosition = tickCountsTillFirstTick*tickGap - this.displacement;
			totalNegativeTicks = 0;
		}else{
			const tickCountsTillFirstTick = Math.floor((-this.displacement/unitLength)*this.tickCount)
			totalNegativeTicks = tickCountsTillFirstTick;
			firstTickMarkValue = -tickCountsTillFirstTick*tickValue;
			firstTickMarkIndex = tickCountsTillFirstTick % this.tickCount== 0 ? 0 : this.tickCount - tickCountsTillFirstTick % this.tickCount;
			firstTickMarkPosition = Math.abs(this.displacement) - tickCountsTillFirstTick*tickGap;
		}

		const totalTicks = Math.floor((length - firstTickMarkPosition)/tickGap) + 1;
		
		const leftoverSpace = tickGap - firstTickMarkPosition;

		const numberLineViewModel:NumberLineViewModel = {
			offset:firstTickMarkPosition,
			leftoverSpace:leftoverSpace,
			startingValue:this.valueAt(0),
			endingValue:this.valueAt(length),
			length:length,
			numberLine:this,
			tickMarks:[],
			gap:tickGap
		}

		
		for (let i = 0,
			currentTickValue = firstTickMarkValue,
			currentTickPosition = firstTickMarkPosition,
			currentTickIndex = firstTickMarkIndex,
			negativeTicksLeft = totalNegativeTicks
			; i < totalTicks;
			i++,
			currentTickValue+=tickValue,
			currentTickPosition+=tickGap,
			negativeTicksLeft--
			) {

				const tickMarkViewModel:TickMarkViewModel={
					value:currentTickValue,
					position:currentTickPosition,
					height:this.options.pattern[currentTickIndex],
					label:this.options.labelStrategy!=null?
						this.options.labelStrategy.labelFor(
							currentTickValue,
							currentTickIndex,
							currentTickPosition,
							this):
							null
				}
				numberLineViewModel.tickMarks.push(tickMarkViewModel);
				currentTickIndex = currentTickIndex + 1 < this.tickCount ? currentTickIndex + 1 : 0;

		}

		return numberLineViewModel;
	}
}

/**
 * Generates a sawtooth wave based on the input parameters.
 *
 * @param {number} x - the input value
 * @param {number} lowerBound - the lower bound of the wave
 * @param {number} upperBound - the upper bound of the wave
 * @param {number} period - the period of the wave
 * @return {number} the calculated value of the sawtooth wave at the given input
 */
export function sawtooth(x: number, lowerBound: number, upperBound: number, period: number): number {
	const amplitude = upperBound - lowerBound;
	const normalizedX = (x % period) / period;
	const y = lowerBound + amplitude * (normalizedX - Math.floor(normalizedX));

	return y;
}

/**
 * Calculates the y-coordinate of a point on a staircase based on the given x-coordinate, height, and period.
 *
 * @param {number} x - The x-coordinate of the point.
 * @param {number} height - The height of each step on the staircase.
 * @param {number} period - The period of the staircase.
 * @return {number} The y-coordinate of the point on the staircase.
 */
export function staircase(x: number, height: number, period: number): number {
	const steps = Math.floor(x / period);
	const y = steps * height;
	return y;
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
export function rangeMapper(x: number, a: number, b: number, c: number, d: number): number {
	return ((x - a) / (b - a)) * (d - c) + c;
}

/** ViewModel that describes what a number line looks like */
export interface NumberLineViewModel {
	/** The gap at the start of number line before a tick mark begins */
	offset: number;
	/** The trailing space left between the last tick mark and the length */
	leftoverSpace: number
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