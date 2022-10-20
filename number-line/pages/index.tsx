import Head from 'next/head';
import React, { createRef } from 'react';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import { NumberLine, ITickMarkLabelStrategy, NumberLineViewModel, TickMarkViewModel, isActuallyZero} from '../core/my-number-line';

const numberScaleTickMarkStrategy:ITickMarkLabelStrategy={
	labelFor(value,index,position,numberLine){
		// if(Math.round(value)==0){
		// 	return "0";// 0.0 should be rendered as just 0
		// }
		if(index==0 || index ==5){
			if(isActuallyZero(value)){
				return value+"";
			}else{
				return value.toFixed(1)+"";
			}
			
		}
		return "";
	}
}
const numberScale:NumberLine = new NumberLine({
	baseUnitValue:1000,
	breakpoints:[100,180],
	labelStrategy:numberScaleTickMarkStrategy,
	pattern:[3,1,1,1,1,2,1,1,1,1],
	unitLengthType:'rubber-band',
	subdivisionFallout:[200,100,50,20,10],
	maximumLengthOfLastSubdivision:500

})

interface NumberLineProps{
	model:NumberLineViewModel;
}
interface NumberLineState{
	model:NumberLineViewModel;
	icon:'cursor-grab'|'cursor-grabbing';
}

class NumberScaleTickMarks extends React.Component<NumberLineProps,NumberLineState>{
	constructor(props:NumberLineState){
		super(props);
		this.state = {model:props.model, icon:'cursor-grab'}
	}

	private tickMarkLeftClassName(v:TickMarkViewModel):string{
		if(v.label!=null){
			switch(v.label.length){
				case 1: return "-left-1"
				case 2: return "-left-2"
				case 3: return "-left-3"
				case 4: return "-left-3"
				case 5: return "-left-4"
				default: return "-left-5"
			}
		}
		return "";
	}

	render(): React.ReactNode {
		let keyCounter=0;
		// This example uses tailwind ^3.1.6
		return (
			<div className={'flex items-end select-none'} style={{columnGap:this.state.model.gap-1,paddingLeft:this.state.model.offset}}>
				{
					this.state.model.tickMarks.slice(0,-2).map((v,i,tvm)=>{
						if(v.patternIndex==0){
							const leftClassName = this.tickMarkLeftClassName(v);
							return (
							<div key={keyCounter++ +""} className={'relative h-3 bg-black'} style={{width:"1px"}}>
								<div className={"text-xs absolute -top-6 "+leftClassName}>{v.label}</div>
							</div>)
						}else if(v.patternIndex==5){
							return (<div key={keyCounter++ +""} className={'h-2 bg-black'} style={{width:"1px"}}></div>)
						}else{
							return (<div key={keyCounter++ +""} className={'h-1 bg-black'} style={{width:"1px"}}></div>)
						}
					})
				}
			</div>
		)
	}
}


class Home extends React.Component {

	resizeObserver!:ResizeObserver;
	resizeElement:React.RefObject<HTMLDivElement> = createRef();
	numberLineContainer:React.RefObject<NumberScaleTickMarks> = createRef();

	containerWidth!:number;
	numberLineViewModel!:NumberLineViewModel;
	private isDown = false;
	private lastX!:number;

	constructor(props:any){
		super(props);
		// initial view model will be updated later
		this.numberLineViewModel = numberScale.buildViewModel(0)
	}

	componentDidMount(){

		this.resizeObserver = new ResizeObserver((entries)=>{
			
			for (let entry of entries) {
				if(entry.target==this.resizeElement.current){
					this.containerWidth = entry.contentRect.width;
					// numberScale.strechToFit(3360,this.containerWidth);
					numberScale.strechToFit(1900,this.containerWidth);
					console.log("value at ",numberScale.valueAt(this.containerWidth,false));
					// numberScale.rangeFit(-600,1200,this.containerWidth);
					// numberScale.rangeFit(3000,6000,this.containerWidth);
					console.log("Rebuilding number line view model for width "+this.containerWidth);
					this.numberLineContainer.current?.setState({model:numberScale.buildViewModel(this.containerWidth)})
					break;
				}
			}
		});

		this.resizeObserver.observe(this.resizeElement.current!);
		this.resizeElement.current?.addEventListener('wheel',this.zoom,{passive:false})
		
	}

	componentWillUnmount(){
		if(this.resizeObserver){
			this.resizeObserver.disconnect();
		}
		this.resizeElement.current?.removeEventListener('wheel',this.zoom);
	}

	render(): React.ReactNode {
		
		return (
			<>
				<Layout home>
					<Head>
					<title>{siteTitle}</title>
					</Head>
					<section className={'text-center '+utilStyles.headingMd}>
						<p>Virtually infinite,pannable,zoomable and completely customizable</p>
						<p>
						Use mouse wheel to pan the number line. Ctrl + Mouse wheel to zoom
						</p>
						<a href="https://github.com/nikhilnxvverma1/number-line">Github</a>
					</section>
				</Layout>
				<div 
				ref={this.resizeElement} 
				
				onMouseDown={this.mouseDown}
				onMouseMove={this.mouseMove}
				onMouseUp={this.mouseUp}
				onMouseLeave={this.mouseOut}
				className={"w-full h-20 flex flex-col justify-end bg-slate-50 cursor-grab"}>
					<NumberScaleTickMarks ref={this.numberLineContainer} model={this.numberLineViewModel}></NumberScaleTickMarks>
				</div>
			</>
	  )
	}

	zoom=(event:WheelEvent)=>{
		const delta = event.deltaY*0.01;
		const value= numberScale.valueAt(event.x,false);
		// console.log("event.x",event.x);
		numberScale.zoomAround(value,event.x,delta);
		
		this.numberLineContainer.current?.setState({model:numberScale.buildViewModel(this.containerWidth)})
		event.preventDefault();
	}

	mouseOut=(event:React.MouseEvent<HTMLDivElement>)=>{
		this.isDown = false;
	}
	
	mouseDown = (event:React.MouseEvent<HTMLDivElement>)=>{
		this.isDown = true;
		this.lastX = event.clientX;
		event.stopPropagation();
	}
	
	mouseMove = (event:React.MouseEvent<HTMLDivElement>)=>{
		if(this.isDown){
			const delta = event.clientX - this.lastX;
			this.lastX = event.clientX;
			numberScale.moveBy(-delta);
			this.numberLineContainer.current?.setState({model:numberScale.buildViewModel(this.containerWidth)})
		}
		event.stopPropagation();
	}

	mouseUp = (event:React.MouseEvent<HTMLDivElement>)=>{
		this.isDown = false;
		event.stopPropagation();
	}
	
}

export default Home
