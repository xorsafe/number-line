import { render } from "../lib/html-renderer";
import { INumberLineOptions, ITickMarkLabelStrategy, NumberLine } from "../lib/number-line";

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


const numberLine = new NumberLine(defaultOptions);
// numberLine.panBy(-205);
// numberLine.panBy(-130);
const panDiv = document.querySelector("#pan") as HTMLElement;
render(numberLine,panDiv);

let draggingPanDiv = false;
let lastX = -1;

panDiv.onmousedown = (event)=>{draggingPanDiv = true,lastX = event.clientX;}
panDiv.onmouseup = (event)=>{draggingPanDiv = false}
panDiv.onmousemove = (event)=>{
	if(draggingPanDiv){
		numberLine.panBy(lastX - event.clientX);
		// remove all children from panDiv element
		panDiv.innerHTML = '';
		render(numberLine,panDiv);

		lastX = event.clientX;
	}
}
