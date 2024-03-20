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
	 * By what amount will the unit length increase for 1% increase in magnification
	 * @default 1
	 */
	initialPosition?:number;
	/** 
	 * The initial displacement of the number line
	 * with respect to the origin.
	 * @default 0 
	 */
	initialDisplacement?:number;
	/** 
	 * The initial magnification of the number line.
	 * Negative number will zoom out, positive number will zoom in.
	 * @default 0 
	 */
	initialMagnification?:number;
}


/** 
 * A strechable, zoomable number line view model that can
 * be used to construct functional rulers and graphs 
 */
export class NumberLine{

	private _unitLength: number;
	private _unitValue:number;
	private _magnification:number;
	private _displacement:number;

	constructor(private options:INumberLineOptions){
		this.initialize();
	}

	private initialize(){
		if(this.options.breakpointLowerbound>this.options.breakpointUpperBound){
			throw new Error("Breakpoint lower bound cannot be greater than breakpoint upper bound");
		}
		this._unitLength = this.options.breakpointLowerbound;
		this._unitValue = this.computeBaseUnitValue();
		this.zoomTo(this.options.initialMagnification || 0);
		this.panTo(this.options.initialDisplacement || 0);
	}

	private computeBaseUnitValue():number{
		return this.options.baseCoverage/this.options.baseLength;
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

	zoomTo(magnification:number){
		
	}

	panTo(position:number){
		
	}

	/** 
	 * Builds a view model describing this number line 
	 * @returns A view model useful for rendering this number line
	 * through any rendering technology or format
	 */
	buildViewModel(length:number):NumberLineViewModel{
		
		return null;
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
	label:string;
	/** Value of this tick mark */
	value:number;
	/** Position of this tick mark from the start */
	position:number;
}