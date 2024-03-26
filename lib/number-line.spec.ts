import { INumberLineOptions, ITickMarkLabelStrategy, NumberLine, rangeMapper, sawtooth, staircase } from "./number-line";


describe("Utility",()=>{

	it("should properly map a number from first range to second range",()=>{
		const y = rangeMapper(1,0.0,1.9,40,60);
		expect(y).toBeCloseTo(50.52,1);
	})

	it('should give correct values in sawtooth wave',()=>{
		const y1 = sawtooth(0,0,100,10);
		expect(y1).toBeCloseTo(0,1);
		const y2 = sawtooth(45,5,10,30);
		expect(y2).toBeCloseTo(7.5,1);
	})

	it('should give correct values in staircase wave',()=>{
		const y1 = staircase(5,5,10);
		expect(y1).toBeCloseTo(0,1);

		const y2 = staircase(45,10,50);
		expect(y2).toBeCloseTo(0,1);

		const y3 = staircase(90,10,50);
		expect(y3).toBeCloseTo(10,1);

		// negative values
		const y4 = staircase(-5,10,50);
		expect(y4).toBeCloseTo(-10,1);

		const y5 = staircase(-105,10,50);
		expect(y5).toBeCloseTo(-30,1);
	})
})

describe("Number Line",()=>{

	const labelStrategy:ITickMarkLabelStrategy={
		labelFor:(value,index,position, numberLine)=>{
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