/** Configurational description of the number line */
export interface INumberLineOptions{
	/**
	 * The genesys pattern that needs to be repeated over
	 * the course of the number line's length. Each item is a tick
	 * that has a length. The array must have at least one item.
	 */
	pattern:number[];
	/** Base value of the number line for the area covered by {@link baseLength} */
	baseCoverage:number;
	/** 
	 * Length of the number line basis which all calculations are performed.
	 * Note that the number line is virtually infinite but {@link baseLength}
	 * along with {@link baseCoverage} governs the starting scale
	 */
	baseLength:number;
	/** The lower bound breakpoint for unit length*/
	breakpointLowerbound:number;
	/** The upper bound breakpoint for unit length*/
	breakpointUpperBound:number;
	/** The labelling strategy for tick marks */
	labelStrategy:ITickMarkLabelStrategy;
	/** 
	 * A number (preferably close to 1) that governs how fast
	 * the tick marks stretches upto {@link breakpointUpperBound} 
	 * before resetting back to the defined {@link breakpointLowerbound}. 
	 * The smaller the number the faster tick marks stretch. This number 
	 * must always be greater than 1
	 * @default 1.3
	 */
	stretchModulo?:number;
	/** 
	 * The initial displacement of the number line
	 * with respect to the origin.
	 * @default 0 
	 */
	initialDisplacement?:number;
	/** 
	 * The initial magnification of the number line.
	 * @default 1 
	 */
	initialMagnification?:number;
	/** 
	 * The last value on the number line. Setting this value
	 * means that the number line is bound.Optional.
	 */
	finiteEnd?:number;
	/** 
	 * Stretches the entire number line such that the first
	 * value is the starting value and the last value is the
	 * ending value. Requires {@link finiteEnd} to be set. 
	 * @default false
	 */
	strechToFit?:boolean;
}


/** 
 * A strechable, zoomable number line view model that can
 * be used to construct functional rulers and graphs 
 */
export class NumberLine{

	private _displacement:number = 0;
	private _magnification:number = 1;
	private _unitLength:number = -1;
	private _unitValue:number = -1;

	
	constructor(private readonly _options:INumberLineOptions){
		this.initialize();
	}

	private initialize(){
		this.options.initialDisplacement = this.options.initialDisplacement==undefined?0:this.options.initialDisplacement;
		this.options.initialMagnification = this.options.initialMagnification==undefined?1:this.options.initialMagnification;
		if(this.options.initialMagnification==undefined){
			this.options.initialMagnification = 1;
		}else if(this.options.initialMagnification<0){
			throw new Error("Initial Magnfication can never be negative. Try a number between 0 and 1 if you want to zoom out");
		}
		if(this.options.stretchModulo==undefined){
			this.options.stretchModulo = 1.3;
		}else if(this.options.stretchModulo<=1){
			throw new Error("Stretch modulo cannot be <=1");
		}
		this.options.strechToFit = this.options.strechToFit==undefined?false:this.options.strechToFit;
		
		this._magnification = this.options.initialMagnification;
		this._displacement = this.options.initialDisplacement;
		this.computeScale();
		if(this.options.strechToFit && this.options.finiteEnd!=undefined){
			this.strechToFit(this.options.finiteEnd);
		}
	}

	/**
	 * Stretches the entire number line such that the first
	 * value is the starting value(0) and the last value is the
	 * {@link finalValue}
	 * @param finalValue The last value on the number line
	 */
	strechToFit(finalValue: number) {
		if(finalValue<=0){
			throw new Error("Final value has to be positive. Consider using rangeFit instead");
		}
		this._displacement = 0;
		this._magnification = this.baseCoverage / finalValue;
		this.computeScale();
	}

	/**
	 * Fits a range within the base length
	 * @param startValue Smaller value
	 * @param endValue Bigger value
	 */
	rangeFit(startValue:number,endValue:number){
		if(endValue<=startValue){
			throw new Error("Ending value has to be greater than starting value");
		}
		const difference = endValue - startValue;
		this.strechToFit(difference);
		this.moveBy(startValue*this.magnification);
	}

	/** 
	 * Internal method that must be called everytime there is a change in magnification,
	 * so as to recompute unit length and unit value. Computes in O(1) time
	 * */
	private computeScale(){
		const repeater = 1 + this.magnification%this.options.stretchModulo!;
		this._unitLength = rangeMapper(
							repeater,
							1,
							this.options.stretchModulo!+1,
							this.options.breakpointLowerbound,
							this.options.breakpointUpperBound);

		const unitCount = this.baseLength / this._unitLength;
		// last value is unitCount * unit value
		// therefore, as magnification inversely divides last value
		this._unitValue = this.baseCoverage/(this.magnification*unitCount);
		
	}

	/**
	 * Computes the value at specified distance from origin in O(1) time
	 * @param location Position along the number line
	 * @param wrtOrigin True implies location is with respect to origin.
	 * False gives location with respect to the assumed start.
	 * @returns the value on the number line on that distance
	 */
	valueAt(location:number,wrtOrigin:boolean):number{
		this.computeScale();
		if(wrtOrigin){
			return (location/this.unitLength) * this.unitValue;
		}else{
			// find out value since left most point (origin)
			const unitCount = location/this.unitLength;
			const valueSinceOrigin = unitCount * this.unitValue;
			// find out the value of displacement
			const valueOfDisplacement = (this.displacement/this.unitLength)*this.unitValue;
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
	 */
	locationOf(value:number,wrtOrigin:boolean):number{
		this.computeScale();
		if(wrtOrigin){
			return (value/this.unitValue) * this.unitLength;
		}else{
			return (value/this.unitValue) * this.unitLength - this.displacement;
		}
	}

	/** 
	 * Builds a view model describing this number line 
	 * @returns A view model useful for rendering this number line
	 * through any rendering technology or format
	 */
	buildViewModel(length:number):NumberLineViewModel{
		this.computeScale();
		
		const tickGap = this.tickGap;
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
			firstTickMarkIndex = this.tickCount - tickCountsTillFirstTick % this.tickCount - 1;
			firstTickMarkPosition = tickCountsTillFirstTick*tickGap - this.displacement;
		}

		const totalTicks = Math.floor((length - firstTickMarkPosition)/tickGap);
		const leftoverSpace = length - totalTicks*tickGap;

		const numberLineViewModel:NumberLineViewModel = {
			offset:firstTickMarkPosition,
			leftoverSpace:leftoverSpace,
			startingValue:this.firstValue,
			endingValue:this.valueAt(length,false),
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
							null,
					patternIndex:currentTickIndex
				}
				numberLineViewModel.tickMarks.push(tickMarkViewModel);
				const indexIncrementer = negativeTicksLeft>0?-1:1;
				currentTickIndex+=indexIncrementer;
				if(currentTickIndex<0){
					currentTickIndex=this.tickCount-1;
				}else if(currentTickIndex>=this.tickCount){
					currentTickIndex = 0;
				}
		}

		return numberLineViewModel;
	}

	/** 
	 * Moves the ruler by a specified amount
	 * @param delta The amount to move by. Value can be either positive or negative
	 */
	moveBy(delta:number){
		this._displacement+=delta;
	}

	/**
	 * Magnifies the entire ruler either in or out
	 * @param delta The amount to magnify by (+ve or -ve)
	 * @param positionFromStart The position on the number line which
	 * should not move because thats whats being zoomed around.
	 * This position is relative to the start of the number line
	 * @returns True if zoom was successful, false if zoom was out of range
	 */
	zoomAround(delta:number,positionFromStart:number):boolean{
		if(this._magnification+delta<=0){
			return false;
		}
		const fixedValue = this.valueAt(positionFromStart,false);
		// const beforeZoom = this.locationOf(fixedValue);
		this._magnification+=delta;
		this.computeScale();
		const afterZoom = this.locationOf(fixedValue,false);
		const cancelDifference = afterZoom - positionFromStart;
		this.moveBy(cancelDifference);
		return true;
	}

	get options():INumberLineOptions{
		return this._options;
	}

	/**
	 * A factor that governs the scale of the number line.
	 * When magnification==1, you are in the base case.
	 * When magnification>1, you aer zooming out.
	 * When magnification is b/w 0 and 1, you are zooming in. 
	 */
	get magnification():number{
		return this._magnification;
	}

	/** 
	 * The displacement of origin w.r.t the assumed
	 * starting point of the number line. This can also
	 * be thought of as offset. 
	 */
	get displacement():number{
		return this._displacement;
	}

	/** The first value on the number line based on length, displacement and magnification */
	get firstValue():number{
		return this.valueAt(0,false);
	}

	/** The last value on the number line based on {@link baseLength}, displacement and magnification */
	get lastValue():number{
		return this.valueAt(this.baseLength,false);
	}

	/** Base final value for magnificaiton = 1, displacement=0 for base length */
	get baseCoverage():number{
		return this.options.baseCoverage;
	}

	/** Length of each unit based on current magnification, lower and upper breakpoints */
	get unitLength():number{
		return this._unitLength;
	}

	/** Value of each unit based on magnification and base value of a unit */
	get unitValue():number{
		return this._unitValue;
	}

	/** 
	 * Shortcut for getting the basis length of the number line,
	 * w.r.t which all calculations are performed 
	 */
	get baseLength():number{
		return this.options.baseLength;
	}

	/** Number of tick marks in a unit */
	get tickCount():number{
		return this.options.pattern.length;
	}

	/** The gap between ticks in a unit. This is based on the length of each unit. */
	get tickGap():number{
		return this._unitLength/this.tickCount;
	}
}

/** Configurable callback to let the user of NumberLine to define their own tick mark labels */
export interface ITickMarkLabelStrategy{
	/**
	 * Callback for getting the tick mark label for each unit.
	 * @param value Value of this tick mark
	 * @param index Index of this tick mark in the tick mark pattern
	 * @param position The position of this tick mark w.r.t start
	 * @param numberLine The main number line requesting the label
	 * @returns The formatted tick mark label. Return null for blank tick marks.
	 */
	labelFor(value:number,index:number,position:number,numberLine:NumberLine):string;
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
export function rangeMapper(x:number,a:number,b:number,c:number,d:number):number{
	return ((x-a)/(b-a))*(d-c) + c;
}

/** ViewModel that describes what a number line looks like */
export interface NumberLineViewModel{
	/** The gap at the start of number line before a tick mark begins */
	offset:number;
	/** The trailing space left between the last tick mark and the length */
	leftoverSpace:number
	/** Gap between tick marks */
	gap:number;
	/** Array of tick marks over the length of this view model */
	tickMarks:TickMarkViewModel[];
	/** The length of this ruler view model */
	length:number;
	/** The value at the start of the number line */
	startingValue:number;
	/** The value at the end of the number line */
	endingValue:number;
	/** The number line for which this view model was created */
	numberLine:NumberLine;
}

/** ViewModel that describes what a tick mark looks like */
export interface TickMarkViewModel{
	/** Height of the tick as governed by the tick mark pattern */
	height:number;
	/** Label on the tick mark as directly received from {@link ITickMarkLabelStrategy} */
	label:string|null;
	/** Value of this tick mark */
	value:number;
	/** Position of this tick mark from the start */
	position:number;
	/** Index of this tick mark in the repeating tick mark pattern */
	patternIndex:number;
}