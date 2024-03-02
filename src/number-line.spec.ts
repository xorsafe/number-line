import { INumberLineOptions, ITickMarkLabelStrategy, NumberLine, rangeMapper } from "./number-line"


describe("Utility",()=>{

	it("should properly map a number from first range to second range",()=>{
		const y = rangeMapper(1,0.0,1.9,40,60);
		expect(y).toBeCloseTo(50.52,1);
	})
})

describe("Number Line",()=>{

	const labelStrategy:ITickMarkLabelStrategy={
		labelFor(value:number,index:number,pattern:number,numberLine:NumberLine):string{
			if(index==0){
				return `${value}`;
			}
			return null;
		}
	}

	const defaultOptions:INumberLineOptions={
		pattern:[3,1,1,1,1,2,1,1,1,1],
		breakpointLowerbound:5,
		breakpointUpperBound:11.5,
		baseCoverage:100,
		baseLength:100,
		labelStrategy:labelStrategy
	}

	it("should normalize default options properly",()=>{
		const numberLine = new NumberLine(defaultOptions);
		expect(numberLine.options.stretchToFit).toBe(false);
		expect(numberLine.options.initialDisplacement).toBe(0);
		expect(numberLine.options.initialMagnification).toBe(1);
		expect(numberLine.options.finiteEnd).toBeUndefined();
	})

	it("should give correct base values for magnification==1 and displacement==0",()=>{
		const numberLine = new NumberLine(defaultOptions);
		expect(numberLine.baseLength).toBe(100);
		expect(numberLine.tickCount).toBe(10);
		expect(numberLine.unitLength).toBe(10)
		expect(numberLine.unitValue).toBe(10);
		expect(numberLine.baseCoverage).toBe(100)
	})

	it("should stretch to fit a zoomed in value on the number line at construction",()=>{
		const options = clone(defaultOptions);
		options.stretchToFit = true;
		options.finiteEnd = 100;//<---------- less than base coverage of 146.06
		const numberLine = new NumberLine(options);
		expect(Math.abs(numberLine.lastValue-100)).toBeLessThanOrEqual(1);

	})

	it("should stretch to fit a zoomed in value on the number after construction",()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.stretchToFit(100);//<---------- less than base coverage of 146.06
		expect(Math.abs(numberLine.lastValue-100)).toBeLessThanOrEqual(1);
	})

	it("should stretch to fit a zoomed in value on the number line at construction",()=>{
		const options = clone(defaultOptions);
		options.stretchToFit = true;
		options.finiteEnd = 200;//<---------- greater than base coverage of 146.06
		const numberLine = new NumberLine(options);
		expect(Math.abs(numberLine.lastValue-200)).toBeLessThanOrEqual(1);

	})

	it("should stretch to fit a zoomed in value on the number after construction",()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.stretchToFit(300);//<---------- greater than base coverage of 146.06
		expect(Math.abs(numberLine.lastValue-300)).toBeLessThanOrEqual(1);
	})

	it("should give value at a particular position when displacement is 0",()=>{
		const numberLine = new NumberLine(defaultOptions);
		expect(numberLine.valueAt(60,false)).toBe(60);
		expect(numberLine.valueAt(60,true)).toBe(60);
	})

	it("should move the number line by a certain amount",()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.moveBy(20);
		expect(numberLine.displacement).toBe(20);
		numberLine.moveBy(-10);
		expect(numberLine.displacement).toBe(10);
	})

	it("should give correct value for a displaced number line",()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.moveBy(20);
		expect(numberLine.valueAt(30,false)).toBe(50);
		numberLine.moveBy(-10);
		expect(numberLine.valueAt(30,true)).toBe(30);
	})

	it("should give correct position of a value",()=>{
		const numberLine = new NumberLine(defaultOptions);
		expect(numberLine.locationOf(40,false)).toBe(40);
		expect(numberLine.locationOf(40,true)).toBe(40);
		numberLine.moveBy(20);//20
		expect(numberLine.locationOf(30,false)).toBe(10);
		numberLine.moveBy(-10);//10
		expect(numberLine.locationOf(30,false)).toBe(20);
		expect(numberLine.locationOf(30,true)).toBe(30);
		expect(numberLine.locationOf(-60,false)).toBe(-70);
	})

	it("should never zoom magnification levels below or equal to 0",()=>{
		const numberLine = new NumberLine(defaultOptions);
		const valueBefore = numberLine.valueAt(70,false);
		numberLine.zoomAround(1.3,70);
		const valueAfter = numberLine.valueAt(70,false);
		expect(valueBefore).toBe(valueAfter);
		const zoomStatus = numberLine.zoomAround(-10.3,70);
		expect(zoomStatus).toBe(false);
	})

	it("should adaptive zoom in by a certain amount",()=>{
		const numberLine = new NumberLine(defaultOptions);
		const valueBefore = numberLine.valueAt(70,false);
		numberLine.zoomAround(1.3,70);
		const valueAfter = numberLine.valueAt(70,false);
		expect(valueBefore).toBe(valueAfter);
		expect(numberLine.magnification).toBe(2.3);
	})

	it("should adaptive zoom out by a certain amount",()=>{
		const numberLine = new NumberLine(defaultOptions);
		const valueBefore = numberLine.valueAt(70,false);
		numberLine.zoomAround(-0.4,70);
		const valueAfter = numberLine.valueAt(70,false);
		expect(valueBefore).toBe(valueAfter);
		expect(numberLine.magnification).toBe(0.6);
	})

	it("should range fit 2 positive values",()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.rangeFit(10,40);
		expect(numberLine.firstValue).toBe(10);
		expect(numberLine.lastValue).toBe(40);
	})

	it("should range fit 2 negative values",()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.rangeFit(-100,-40);
		expect(numberLine.firstValue).toBeCloseTo(-100);
		expect(numberLine.lastValue).toBeCloseTo(-40);
	})

	it("should range fit 1 negative values and 1 positive value",()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.rangeFit(-10,40);
		expect(numberLine.firstValue).toBeCloseTo(-10);
		expect(numberLine.lastValue).toBeCloseTo(40);
	})

	it("should disallow range fitting 2 values if ending value smaller",()=>{
		const numberLine = new NumberLine(defaultOptions);
		expect(()=>numberLine.rangeFit(40,10)).toThrow();
		expect(()=>numberLine.rangeFit(40,40)).toThrow();
		expect(()=>numberLine.rangeFit(-40,-80)).toThrow();
	})

})

function clone(options:INumberLineOptions):INumberLineOptions{
	const clone:INumberLineOptions={
		pattern:options.pattern,
		baseCoverage:options.baseCoverage,
		breakpointLowerbound:options.breakpointLowerbound,
		breakpointUpperBound:options.breakpointUpperBound,
		baseLength:options.baseLength,
		labelStrategy:options.labelStrategy
	}
	return clone;
}