import { NumberLine, NumberLineViewModel, TickMarkViewModel } from "number-line";

export function render(numberLine:NumberLine,container:HTMLElement|string,lengthwise = true) {
	let div!:HTMLElement;
	if(container instanceof HTMLElement){
		div = container;
	}else{
		div = document.querySelector(container)! as HTMLElement;
	}
	// compute the bounding client rect of the div
	const size = div.getBoundingClientRect();
	let length!:number;
	if(lengthwise){
		length = size.width;
	}else{
		length = size.height;
	}

	const numberLineViewModel = numberLine.buildViewModel(length);
	for(let i =0;i<numberLineViewModel.tickMarks.length;i++){
		const tickMark = numberLineViewModel.tickMarks[i];
		const tickMarkElement = createTickMark(tickMark,lengthwise);
		div.append(tickMarkElement);
	}
	return div;
}

function createTickMark(tickMark: TickMarkViewModel,lengthwise:boolean,stickToOpposite=false) {
	const tickMarkElement = document.createElement("div");
	tickMarkElement.style.opacity = `${tickMark.height}`;
	tickMarkElement.style.position = `absolute`;
	if(lengthwise){
		tickMarkElement.style.left = `${tickMark.position}px`;
		tickMarkElement.style.width = `1px`;
		tickMarkElement.style.height = `${tickMark.height}px`;
		if(stickToOpposite){
			tickMarkElement.style.bottom = `0px`;
		}else{
			tickMarkElement.style.top = `0px`;
		}
	}else{
		tickMarkElement.style.top = `${tickMark.position}px`;
		tickMarkElement.style.height = `1px`;
		tickMarkElement.style.width = `${tickMark.height}px`;
		if(stickToOpposite){
			tickMarkElement.style.right = `0px`;
		}else{
			tickMarkElement.style.left = `0px`;
		}
	}
	return tickMarkElement;
}