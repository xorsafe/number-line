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
			if(index%5==0){
				// return value in string to just on precision on floating point
				return value.toFixed(0);
			}
			return null;
		}
		
	}
	const defaultOptions:INumberLineOptions={
		pattern:[3,1,1,1,1,2,1,1,1,1],
		breakpointLowerbound:100,
		breakpointUpperBound:150,
		baseCoverage:1000,
		baseLength:100,
		labelStrategy:labelStrategy
	}


	it("should give correct values at specified points",()=>{
		const numberLine = new NumberLine(defaultOptions);
		expect(numberLine.valueAt(0)).toBe(0);
		expect(numberLine.valueAt(100)).toBe(10);
		expect(numberLine.valueAt(200)).toBe(20);
		expect(numberLine.valueAt(300)).toBe(30);
		expect(numberLine.valueAt(400)).toBe(40);
		expect(numberLine.valueAt(500)).toBe(50);
		expect(numberLine.valueAt(600)).toBe(60);
		expect(numberLine.valueAt(700)).toBe(70);
		expect(numberLine.valueAt(800)).toBe(80);
		expect(numberLine.valueAt(900)).toBe(90);
		expect(numberLine.valueAt(1000)).toBe(100);

		expect(numberLine.valueAt(-100)).toBe(-10);
		expect(numberLine.valueAt(-200)).toBe(-20);
		expect(numberLine.valueAt(-300)).toBe(-30);
		expect(numberLine.valueAt(-400)).toBe(-40);
		expect(numberLine.valueAt(-500)).toBe(-50);
		expect(numberLine.valueAt(-600)).toBe(-60);
		expect(numberLine.valueAt(-700)).toBe(-70);
		expect(numberLine.valueAt(-800)).toBe(-80);
		expect(numberLine.valueAt(-900)).toBe(-90);
		expect(numberLine.valueAt(-1000)).toBe(-100);

		// should give correct value at number line after it has been shifted in the positive axis
		numberLine.panBy(130);
		expect(numberLine.valueAt(0)).toBe(13);
		expect(numberLine.valueAt(10000)).toBe(1013);
		
	})

	it('should measure the value for a given length',()=>{
		const numberLine = new NumberLine(defaultOptions);
		expect(numberLine.measure(0)).toBe(0);
		expect(numberLine.measure(100)).toBe(10);
		expect(numberLine.measure(200)).toBe(20);
		expect(numberLine.measure(300)).toBe(30);
		expect(numberLine.measure(400)).toBe(40);
		expect(numberLine.measure(500)).toBe(50);
		expect(numberLine.measure(600)).toBe(60);
		expect(numberLine.measure(700)).toBe(70);
	})

	it('should give the position of a value in the number line',()=>{
		const numberLine = new NumberLine(defaultOptions);
		expect(numberLine.positionOf(0)).toBe(0);
		expect(numberLine.positionOf(10)).toBe(100);
		expect(numberLine.positionOf(20)).toBe(200);
		expect(numberLine.positionOf(30)).toBe(300);
		expect(numberLine.positionOf(40)).toBe(400);
		expect(numberLine.positionOf(50)).toBe(500);
		expect(numberLine.positionOf(60)).toBe(600);
		expect(numberLine.positionOf(70)).toBe(700);
		expect(numberLine.positionOf(80)).toBe(800);
		expect(numberLine.positionOf(90)).toBe(900);
		expect(numberLine.positionOf(100)).toBe(1000);
	})

	it('should build a view model for the default case',()=>{
		const numberLine = new NumberLine(defaultOptions);
		const viewModel = numberLine.buildViewModel(10000);
		expect(viewModel.offset).toBe(0);
		expect(viewModel.leftoverSpace).toBe(10);
		expect(viewModel.gap).toBe(10);
		expect(viewModel.tickMarks.length).toBe(1001);
		expect(viewModel.length).toBe(10000);
		expect(viewModel.endingValue).toBe(1000);
		expect(viewModel.startingValue).toBe(0);

		// check all the tick marks
		for(let i=0;i<viewModel.tickMarks.length;i++){
			expect(viewModel.tickMarks[i].position).toBe(i*10);
			if(i%5==0){
				expect(viewModel.tickMarks[i].label).toBeDefined();
			}else{
				expect(viewModel.tickMarks[i].label).toBeNull();
			}

			if(i%10==0){
				expect(viewModel.tickMarks[i].height).toBe(3);
			}else if(i%5==0){
				expect(viewModel.tickMarks[i].height).toBe(2);
			}else{
				expect(viewModel.tickMarks[i].height).toBe(1);
			}
		}
		
	})

	it('should build a view model for the default case after shifting along the positive axis',()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.panBy(130);
		const viewModel = numberLine.buildViewModel(10000);
		expect(viewModel.offset).toBe(0);
		expect(viewModel.leftoverSpace).toBe(10);
		expect(viewModel.gap).toBe(10);
		expect(viewModel.tickMarks.length).toBe(1001);
		expect(viewModel.length).toBe(10000);
		expect(viewModel.startingValue).toBe(13);
		expect(viewModel.endingValue).toBe(1013);

		// check all the tick marks
		for(let i=0;i<viewModel.tickMarks.length;i++){
			expect(viewModel.tickMarks[i].position).toBe(i*10);
			if(viewModel.tickMarks[i].value%5==0){
				expect(viewModel.tickMarks[i].label).toBeDefined();
			}else{
				expect(viewModel.tickMarks[i].label).toBeNull();
			}

			if(viewModel.tickMarks[i].value%10==0){
				expect(viewModel.tickMarks[i].height).toBe(3);
			}else if(viewModel.tickMarks[i].value%5==0){
				expect(viewModel.tickMarks[i].height).toBe(2);
			}else{
				expect(viewModel.tickMarks[i].height).toBe(1);
			}
		}
		
	})

	it('should build a view model for the default case after shifting along the negative axis',()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.panBy(-130);
		const viewModel = numberLine.buildViewModel(10000);
		expect(viewModel.offset).toBe(0);
		expect(viewModel.leftoverSpace).toBe(10);
		expect(viewModel.gap).toBe(10);
		expect(viewModel.tickMarks.length).toBe(1001);
		expect(viewModel.length).toBe(10000);
		expect(viewModel.startingValue).toBe(-13);
		expect(viewModel.endingValue).toBe(987);

		// check all the tick marks
		for(let i=0;i<viewModel.tickMarks.length;i++){
			expect(viewModel.tickMarks[i].position).toBe(i*10);
			if(viewModel.tickMarks[i].value%5==0){
				expect(viewModel.tickMarks[i].label).toBeDefined();
			}else{
				expect(viewModel.tickMarks[i].label).toBeNull();
			}

			if(viewModel.tickMarks[i].value%10==0){
				expect(viewModel.tickMarks[i].height).toBe(3);
			}else if(viewModel.tickMarks[i].value%5==0){
				expect(viewModel.tickMarks[i].height).toBe(2);
			}else{
				expect(viewModel.tickMarks[i].height).toBe(1);
			}
		}
		
	})

	it('should build a view model for the default case after shifting along the negative axis fractionally before the first tick',()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.panBy(-205);
		const viewModel = numberLine.buildViewModel(10000);
		expect(viewModel.offset).toBe(5);
		expect(viewModel.gap).toBe(10);
		expect(viewModel.length).toBe(10000);
		expect(viewModel.startingValue).toBe(-20.5);
		expect(viewModel.endingValue).toBe(979.5);
		expect(viewModel.tickMarks.length).toBe(1000);
		expect(viewModel.tickMarks[0].position).toBe(5);
		expect(viewModel.tickMarks[0].value).toBe(-20);
		expect(viewModel.tickMarks[0].label).toBe("-20");
		expect(viewModel.tickMarks[0].height).toBe(3);
		expect(viewModel.leftoverSpace).toBe(5);


		// check all the tick marks
		for(let i=0;i<viewModel.tickMarks.length;i++){
			expect(viewModel.tickMarks[i].position).toBe(5+i*10);

			if(viewModel.tickMarks[i].value%5==0){
				expect(viewModel.tickMarks[i].label).toBeDefined();
			}else{
				expect(viewModel.tickMarks[i].label).toBeNull();
			}

			if(viewModel.tickMarks[i].value%10==0){
				expect(viewModel.tickMarks[i].height).toBe(3);
			}else if(viewModel.tickMarks[i].value%5==0){
				expect(viewModel.tickMarks[i].height).toBe(2);
			}else{
				expect(viewModel.tickMarks[i].height).toBe(1);
			}
		}
		
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