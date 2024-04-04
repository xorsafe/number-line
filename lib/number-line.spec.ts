import { INumberLineOptions, ITickMarkLabelStrategy, NumberLine, rangeMapper, sawtooth, staircase, divisorBetween } from "./number-line";


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
		expect(y1).toBeCloseTo(5,1);

		const y2 = staircase(45,10,50);
		expect(y2).toBeCloseTo(10,1);

		const y3 = staircase(90,10,50);
		expect(y3).toBeCloseTo(20,1);

		// negative values
		const y4 = staircase(-5,10,50);
		expect(y4).toBeCloseTo(-10,1);

		const y5 = staircase(-105,10,50);
		expect(y5).toBeCloseTo(-30,1);
	})

	it("should find the first number that is divisible by another number and fits between 2 numbers",()=>{
		expect(divisorBetween(2,6,3)).toBe(3);
		expect(divisorBetween(2,6,4)).toBe(4);
		expect(divisorBetween(30,60,5)).toBe(30);
		expect(divisorBetween(27,60,5)).toBe(30);
		expect(divisorBetween(24,60,5)).toBe(25);
		expect(divisorBetween(6,9,4)).toBe(8);
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

	it("should compute the adjusted base unit value correctly",()=>{
		const clonedOptions = clone(defaultOptions);
		clonedOptions.zoomFactor = 7;
		clonedOptions.zoomPeriod = 10;
		clonedOptions.baseCoverage = 4000;
		clonedOptions.baseLength = 50;
		clonedOptions.initialMagnification = 110;
		const numberLine = new NumberLine(clonedOptions);
		expect(numberLine.getBaseUnitValue()).toBe(80);
		expect(numberLine.computeBaseUnitValueAdjusted()).toBe(84);
		expect(numberLine.baseUnitValueAdjusted).toBe(84);
		expect(numberLine.magnification).toBe(110);
		expect(numberLine.unitValue).toBe(84);
	})


	it("should give correct values at specified points",()=>{
		const numberLine = new NumberLine(defaultOptions);
		expect(numberLine.valueAt(0)).toBe(0);
		expect(numberLine.valueAt(100)).toBe(1);
		expect(numberLine.valueAt(200)).toBe(2);
		expect(numberLine.valueAt(300)).toBe(3);
		expect(numberLine.valueAt(400)).toBe(4);
		expect(numberLine.valueAt(500)).toBe(5);
		expect(numberLine.valueAt(600)).toBe(6);
		expect(numberLine.valueAt(700)).toBe(7);
		expect(numberLine.valueAt(800)).toBe(8);
		expect(numberLine.valueAt(900)).toBe(9);
		expect(numberLine.valueAt(1000)).toBe(10);

		expect(numberLine.valueAt(-100)).toBe(-1);
		expect(numberLine.valueAt(-200)).toBe(-2);
		expect(numberLine.valueAt(-300)).toBe(-3);
		expect(numberLine.valueAt(-400)).toBe(-4);
		expect(numberLine.valueAt(-500)).toBe(-5);
		expect(numberLine.valueAt(-600)).toBe(-6);
		expect(numberLine.valueAt(-700)).toBe(-7);
		expect(numberLine.valueAt(-800)).toBe(-8);
		expect(numberLine.valueAt(-900)).toBe(-9);
		expect(numberLine.valueAt(-1000)).toBe(-10);

		// should give correct value at number line after it has been shifted in the positive axis
		numberLine.panBy(130);
		expect(numberLine.valueAt(0)).toBe(1.3);
		expect(numberLine.valueAt(10000)).toBe(101.3);
		
	})

	it('should measure the value for a given length',()=>{
		const numberLine = new NumberLine(defaultOptions);
		expect(numberLine.measure(0)).toBe(0);
		expect(numberLine.measure(100)).toBe(1);
		expect(numberLine.measure(200)).toBe(2);
		expect(numberLine.measure(300)).toBe(3);
		expect(numberLine.measure(400)).toBe(4);
		expect(numberLine.measure(500)).toBe(5);
		expect(numberLine.measure(600)).toBe(6);
		expect(numberLine.measure(700)).toBe(7);
	})

	it('should give the position of a value in the number line',()=>{
		const numberLine = new NumberLine(defaultOptions);
		expect(numberLine.positionOf(0)).toBe(0);
		expect(numberLine.positionOf(10)).toBe(1000);
		expect(numberLine.positionOf(20)).toBe(2000);
		expect(numberLine.positionOf(30)).toBe(3000);
		expect(numberLine.positionOf(40)).toBe(4000);
		expect(numberLine.positionOf(50)).toBe(5000);
		expect(numberLine.positionOf(60)).toBe(6000);
		expect(numberLine.positionOf(70)).toBe(7000);
		expect(numberLine.positionOf(80)).toBe(8000);
		expect(numberLine.positionOf(90)).toBe(9000);
		expect(numberLine.positionOf(100)).toBe(10000);
	})

	it('should build a view model for the default case',()=>{
		const numberLine = new NumberLine(defaultOptions);
		const viewModel = numberLine.buildViewModel(10000);
		expect(viewModel.offset).toBe(0);
		expect(viewModel.leftoverSpace).toBe(10);
		expect(viewModel.gap).toBe(10);
		expect(viewModel.tickMarks.length).toBe(1001);
		expect(viewModel.length).toBe(10000);
		expect(viewModel.endingValue).toBe(100);
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
		expect(viewModel.startingValue).toBe(1.3);
		expect(viewModel.endingValue).toBe(101.3);

		// check all the tick marks
		for(let i=0;i<viewModel.tickMarks.length;i++){
			expect(viewModel.tickMarks[i].position).toBe(i*10);
			
			if(viewModel.tickMarks[i].patternIndex%5==0){
				expect(viewModel.tickMarks[i].label).toBeDefined();
			}else{
				expect(viewModel.tickMarks[i].label).toBeNull();
			}

			if(viewModel.tickMarks[i].patternIndex%10==0){
				expect(viewModel.tickMarks[i].height).toBe(3);
			}else if(viewModel.tickMarks[i].patternIndex%5==0){
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
		expect(viewModel.startingValue).toBe(-1.3);
		expect(viewModel.endingValue).toBe(98.7);

		// check all the tick marks
		for(let i=0;i<viewModel.tickMarks.length;i++){
			expect(viewModel.tickMarks[i].position).toBe(i*10);
			if(viewModel.tickMarks[i].patternIndex%5==0){
				expect(viewModel.tickMarks[i].label).toBeDefined();
			}else{
				expect(viewModel.tickMarks[i].label).toBeNull();
			}

			if(viewModel.tickMarks[i].patternIndex%10==0){
				expect(viewModel.tickMarks[i].height).toBe(3);
			}else if(viewModel.tickMarks[i].patternIndex%5==0){
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
		expect(viewModel.startingValue).toBe(-2.05);
		expect(viewModel.endingValue).toBe(97.95);
		expect(viewModel.tickMarks.length).toBe(1000);
		expect(viewModel.tickMarks[0].position).toBe(5);
		expect(viewModel.tickMarks[0].value).toBe(-2);
		expect(viewModel.tickMarks[0].label).toBe("-2");
		expect(viewModel.tickMarks[0].height).toBe(3);
		expect(viewModel.leftoverSpace).toBe(5);


		// check all the tick marks
		for(let i=0;i<viewModel.tickMarks.length;i++){
			expect(viewModel.tickMarks[i].position).toBe(5+i*10);

			if(viewModel.tickMarks[i].patternIndex%5==0){
				expect(viewModel.tickMarks[i].label).toBeDefined();
			}else{
				expect(viewModel.tickMarks[i].label).toBeNull();
			}

			if(viewModel.tickMarks[i].patternIndex%10==0){
				expect(viewModel.tickMarks[i].height).toBe(3);
			}else if(viewModel.tickMarks[i].patternIndex%5==0){
				expect(viewModel.tickMarks[i].height).toBe(2);
			}else{
				expect(viewModel.tickMarks[i].height).toBe(1);
			}
		}
		
	})

	it('should build a view model after zooming to a particular value',()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.zoomTo(5);
		expect(numberLine.magnification).toBe(5);
		expect(numberLine.unitLength).toBe(125);
		expect(numberLine.unitValue).toBe(1);
		const viewModel = numberLine.buildViewModel(10000);
		expect(viewModel.offset).toBe(0);
		expect(viewModel.startingValue).toBe(0);
		expect(viewModel.gap).toBe(12.5);
		expect(viewModel.leftoverSpace).toBe(12.5);
		expect(viewModel.tickMarks.length).toBe(801);
		expect(viewModel.length).toBe(10000);
		expect(viewModel.endingValue).toBe(80.0);

		// check all the tick marks
		for(let i=0;i<viewModel.tickMarks.length;i++){
			expect(viewModel.tickMarks[i].position).toBe(i*12.5);
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

	it('should build a view model after zooming to a value beyond the unit length stretch limits',()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.zoomTo(10);
		expect(numberLine.magnification).toBe(10);
		expect(numberLine.unitLength).toBe(100);
		expect(numberLine.unitValue).toBe(2);
		const viewModel = numberLine.buildViewModel(10000);
		expect(viewModel.offset).toBe(0);
		expect(viewModel.startingValue).toBe(0);
		expect(viewModel.gap).toBe(10);
		expect(viewModel.leftoverSpace).toBe(10);
		expect(viewModel.tickMarks.length).toBe(1001);
		expect(viewModel.length).toBe(10000);
		expect(viewModel.endingValue).toBe(200);

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

	it('should build a view model after zooming around the origin by a particular value',()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.zoomAround(0,5);
		expect(numberLine.unitLength).toBe(125);
		expect(numberLine.unitValue).toBe(1);
		const viewModel = numberLine.buildViewModel(10000);
		expect(viewModel.offset).toBe(0);
		expect(viewModel.startingValue).toBe(0);
		expect(viewModel.gap).toBe(12.5);
		expect(viewModel.leftoverSpace).toBe(12.5);
		expect(viewModel.tickMarks.length).toBe(801);
		expect(viewModel.length).toBe(10000);
		expect(viewModel.endingValue).toBe(80.0);

		// check all the tick marks
		for(let i=0;i<viewModel.tickMarks.length;i++){
			expect(viewModel.tickMarks[i].position).toBe(i*12.5);
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

	it('should build a view model after zooming around a positive position by a particular value',()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.zoomAround(300,5);
		expect(numberLine.unitLength).toBe(125);
		expect(numberLine.unitValue).toBe(1);
		const viewModel = numberLine.buildViewModel(10000);
		expect(viewModel.offset).toBe(0);
		expect(viewModel.startingValue).toBe(0.6);
		expect(viewModel.gap).toBe(12.5);
		expect(viewModel.leftoverSpace).toBe(12.5);
		expect(viewModel.tickMarks.length).toBe(801);
		expect(viewModel.length).toBe(10000);
		expect(viewModel.endingValue).toBe(80.6);

		// check all the tick marks
		for(let i=0;i<viewModel.tickMarks.length;i++){
			expect(viewModel.tickMarks[i].position).toBe(i*12.5);
			const offsetIndex = i -4;
			
			if(offsetIndex%5==0){
				expect(viewModel.tickMarks[i].label).toBeDefined();
			}else{
				expect(viewModel.tickMarks[i].label).toBeNull();
			}

			if(offsetIndex%10==0){
				expect(viewModel.tickMarks[i].height).toBe(3);
			}else if(offsetIndex%5==0){
				expect(viewModel.tickMarks[i].height).toBe(2);
			}else{
				expect(viewModel.tickMarks[i].height).toBe(1);
			}
		}
		
	})

	it('should build a view model after zooming around a positive position by a particular value done multiple times',()=>{
		const numberLine = new NumberLine(defaultOptions);
		numberLine.zoomAround(300,1);
		numberLine.zoomAround(300,1);
		numberLine.zoomAround(300,2);
		numberLine.zoomAround(300,1);
		expect(numberLine.unitLength).toBe(125);
		expect(numberLine.unitValue).toBe(1);
		const viewModel = numberLine.buildViewModel(10000);
		expect(viewModel.offset).toBe(0);
		expect(viewModel.startingValue).toBe(0.6);
		expect(viewModel.gap).toBe(12.5);
		expect(viewModel.leftoverSpace).toBe(12.5);
		expect(viewModel.tickMarks.length).toBe(801);
		expect(viewModel.length).toBe(10000);
		expect(viewModel.endingValue).toBe(80.6);

		// check all the tick marks
		for(let i=0;i<viewModel.tickMarks.length;i++){
			expect(viewModel.tickMarks[i].position).toBe(i*12.5);
			const offsetIndex = i -4;

			if(offsetIndex%5==0){
				expect(viewModel.tickMarks[i].label).toBeDefined();
			}else{
				expect(viewModel.tickMarks[i].label).toBeNull();
			}

			if(offsetIndex%10==0){
				expect(viewModel.tickMarks[i].height).toBe(3);
			}else if(offsetIndex%5==0){
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