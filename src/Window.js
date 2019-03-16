class Window extends React.Component {
	render(){
		var hideWindow = true;
		var tabsperrow = this.props.layout==="blocks"?Math.ceil(Math.sqrt(this.props.tabs.length+2)):(this.props.layout==="vertical"?1:15);
		var tabs = this.props.tabs.map(tab => {
			var isHidden = !!this.props.hiddenTabs[tab.id] && this.props.filterTabs;
			var isSelected = !!this.props.selection[tab.id];
			hideWindow &= isHidden;
			return (
				<Tab
					key={"tab"+tab.id}
					window={this.props.window}
					layout={this.props.layout}
					tab={tab}
					selected={isSelected}
					hidden={isHidden}
					middleClick={this.props.tabMiddleClick}
					select={this.props.select}
					drag={this.props.drag}
					drop={this.props.drop}
				/>
			);
			// return Tab({
			// 	window: this.props.window,
			// 	layout:this.props.layout,
			// 	tab: tab,
			// 	selected: isSelected,
			// 	hidden: isHidden,
			// 	middleClick: this.props.tabMiddleClick,
			// 	select: this.props.select,
			// 	drag: this.props.drag,
			// 	drop: this.props.drop,
			// 	ref: "tab"+tab.id
			// });
		});
		if(!hideWindow) {
			tabs.push(<div key={"tab-add"} className={"icon add "+(this.props.layout === "blocks"?"":"windowaction")} title={"Add tab to window"} onClick={this.addTab} />);
			tabs.push(<div key={"tab-close"} className={"icon close "+(this.props.layout === "blocks"?"":"windowaction")} title={"Close window"} onClick={this.close} />);
			const children = [];
			let count = 0;
			for(let j = 0; j < tabs.length; j++){
				if(j % tabsperrow === 0 && j && (j < tabs.length-1 || this.props.layout === "blocks")){
					children.push(<div key={"tab-liner"+count++} className={"newliner"} />);
				}
				children.push(tabs[j]);
			}
			return (
				<div className={"window "+(this.props.layout === "blocks"?"block":"")}>
					{children}
				</div>
			);
		} else {
			return null;
		}
	}
	addTab = () => {
		chrome.tabs.create({windowId:this.props.window.id});
	};
	close = () => {
		chrome.windows.remove(this.props.window.id);
	};
}
