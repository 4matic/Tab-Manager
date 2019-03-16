class TabManager extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			layout: localStorage["layout"] || "horizontal",
			windows: [],
			selection: {},
			hiddenTabs: {},
			tabsbyid: {},
			appliedFilters: {},
			windowsbyid: {},
			filterTabs: !!localStorage["filter-tabs"]
		};
		this.searchBox = React.createRef();
	}

	render() {
		const hiddenCount = this.state.hiddenCount || 0;
		const tabCount = this.state.tabCount || 0;
		const selectedTabsCount = Object.keys(this.state.selection).length;
		return (
			<div>
				<div className={"window filterbox"}>
					<div className={this.getFilterClasses('muted')} title={"Muted tabs"} onClick={this.filterTabs.bind(this, 'muted')} />
					<div className={this.getFilterClasses('playingaudio', 'audible')} title={"Audible tabs"} onClick={this.filterTabs.bind(this, 'audible')} />
					<div className={this.getFilterClasses('pinned')} title={"Pinned tabs"} onClick={this.filterTabs.bind(this, 'pinned')} />
				</div>
				{this.state.windows.map(window => (
					<Window
						key={"window"+window.id}
						window={window}
						tabs={window.tabs}
						layout={this.state.layout}
						selection={this.state.selection}
						hiddenTabs={this.state.hiddenTabs}
						filterTabs={this.state.filterTabs}
						tabMiddleClick={this.deleteTab.bind(this)}
						select={this.select.bind(this)}
						drag={this.drag.bind(this)}
						drop={this.drop.bind(this)}
					/>
				))}
				<div className={"window searchbox"}>
					<input ref={this.searchBox} type={"text"} onChange={this.search} onKeyDown={this.checkEnter} />
					<div className={"icon windowaction "+ this.state.layout} title={"Change layout"} onClick={this.changeLayout} />
					<div className={"icon windowaction trash"} title={selectedTabsCount ? `Delete tabs (${selectedTabsCount})` : 'Delete current tab'} onClick={this.deleteTabs} />
					<div className={"icon windowaction pin"} title={selectedTabsCount ? `Pin tabs (${selectedTabsCount})` : 'Pin current tab'} onClick={this.pinTabs} />
					<div
						className={"icon windowaction filter"+(this.state.filterTabs? " enabled":"")}
						title={(this.state.filterTabs? "Do not hide":"Hide")+" non-matching Tabs"}
						onClick={this.toggleFilterMismatchedTabs}
					/>
					<div className={"icon windowaction new"} title={"Add Window"} onClick={this.addWindow} />
				</div>
				<div className={"window placeholder"} />
			</div>
		);
	}

	getFilterClasses = (className, filter) => {
		let classes = `icon filteraction ${className}`;
		if (!filter) filter = className;
		if (this.state.appliedFilters[filter]) {
			classes += " active";
		}
		return classes;
	};

	componentDidMount() {
		const box = this.searchBox.current;
		box.focus();
		box.select();
		chrome.windows.onCreated.addListener(this.update.bind(this));
		chrome.windows.onRemoved.addListener(this.update.bind(this));
		chrome.tabs.onCreated.addListener(this.update.bind(this));
		chrome.tabs.onUpdated.addListener(this.update.bind(this));
		chrome.tabs.onMoved.addListener(this.update.bind(this));
		chrome.tabs.onDetached.addListener(this.update.bind(this));
		chrome.tabs.onRemoved.addListener(this.update.bind(this));
		chrome.tabs.onReplaced.addListener(this.update.bind(this));
		this.update();
	}

	update() {
		chrome.windows.getAll({populate: true}, function (windows) {
			this.state.windows = windows;
			this.state.windowsbyid = {};
			this.state.tabsbyid = {};
			let tabCount = 0;
			for (let i = 0; i < windows.length; i++) {
				const window = windows[i];
				this.state.windowsbyid[window.id] = window;
				for (let j = 0; j < window.tabs.length; j++) {
					const tab = window.tabs[j];
					this.state.tabsbyid[tab.id] = tab;
					tabCount++;
				}
			}
			for (let id in this.state.selection) {
				if (!this.state.tabsbyid[id]) delete this.state.selection[id];
			}
			this.state.tabCount = tabCount;
			this.state.searchLen = 0;
			this.forceUpdate();
		}.bind(this));
	}

	deleteTabs = () => {
		const tabs = Object.keys(this.state.selection).map(id => this.state.tabsbyid[id]);
		if (tabs.length) {
			for (let i = 0; i < tabs.length; i++) {
				chrome.tabs.remove(tabs[i].id);
			}
		} else {
			chrome.windows.getCurrent(function (w) {
				chrome.tabs.getSelected(w.id, function (t) {
					chrome.tabs.remove(t.id);
				});
			});
		}
	};

	deleteTab(tabId) {
		chrome.tabs.remove(tabId);
	}

	addWindow = () => {
		const tabs = Object.keys(this.state.selection).map(id => this.state.tabsbyid[id]);
		const first = tabs.shift();
		const count = 0;
		if (first) {
			chrome.windows.create({tabId: first.id}, function (w) {
				chrome.tabs.update(first.id, {pinned: first.pinned});
				for (var i = 0; i < tabs.length; i++) {
					(function (tab) {
						chrome.tabs.move(tab.id, {windowId: w.id, index: 1}, function () {
							chrome.tabs.update(tab.id, {pinned: tab.pinned});
						});
					})(tabs[i]);
				}
			});
		} else {
			chrome.windows.create({});
		}
	};

	pinTabs = () => {
		const tabs = Object.keys(this.state.selection).map(id => this.state.tabsbyid[id]).sort((a, b) => a.index - b.index);
		if (tabs.length) {
			if (tabs[0].pinned) tabs.reverse();
			for (var i = 0; i < tabs.length; i++) {
				chrome.tabs.update(tabs[i].id, {pinned: !tabs[0].pinned});
			}

		} else {
			chrome.windows.getCurrent(function (w) {
				chrome.tabs.getSelected(w.id, function (t) {
					chrome.tabs.update(t.id, {pinned: !t.pinned});
				});
			});
		}
	};

	search = (e) => {
		var hiddenCount = this.state.hiddenCount || 0;
		var searchLen = (e.target.value || "").length;
		if (!searchLen) {
			this.state.selection = {};
			this.state.hiddenTabs = {};
			hiddenCount = 0;
		} else {
			let idList;
			const lastSearchLen = this.state.searchLen;
			if (!lastSearchLen) {
				idList = this.state.tabsbyid;
			} else if (lastSearchLen > searchLen) {
				idList = this.state.hiddenTabs;
			} else if (lastSearchLen < searchLen) {
				idList = this.state.selection;
			} else {
				return;
			}
			for (let id in idList) {
				const tab = this.state.tabsbyid[id];
				if ((tab.title + tab.url).toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0) {
					hiddenCount -= (this.state.hiddenTabs[id] || 0);
					this.state.selection[id] = true;
					delete this.state.hiddenTabs[id];
				} else {
					hiddenCount += 1 - (this.state.hiddenTabs[id] || 0);
					this.state.hiddenTabs[id] = true;
					delete this.state.selection[id];
				}
			}
		}
		this.state.hiddenCount = hiddenCount;
		this.state.searchLen = searchLen;
		this.forceUpdate();
	};

	checkEnter = (e) => {
		if (e.keyCode === 13) this.addWindow();
	};

	changeLayout = () => {
		if (this.state.layout === "blocks") {
			localStorage["layout"] = this.state.layout = "horizontal";
		} else if (this.state.layout === "horizontal") {
			localStorage["layout"] = this.state.layout = "vertical";
		} else {
			localStorage["layout"] = this.state.layout = "blocks";
		}
		this.forceUpdate();
	};

	select(id) {
		if (this.state.selection[id]) {
			delete this.state.selection[id];
		} else {
			this.state.selection[id] = true;
		}
		this.forceUpdate();
	}

	drag(e, id) {
		if (!this.state.selection[id]) {
			this.state.selection = {};
			this.state.selection[id] = true;
		}
		this.forceUpdate();
	}

	drop(id, before) {
		const tab = this.state.tabsbyid[id];
		const tabs = Object.keys(this.state.selection).map(id => this.state.tabsbyid[id]);
		const index = tab.index + (before ? 0 : 1);

		for (let i = 0; i < tabs.length; i++) {
			(function (t) {
				chrome.tabs.move(t.id, {
					windowId: tab.windowId,
					index: index
				}, function () {
					chrome.tabs.update(t.id, {
						pinned: t.pinned
					});
				});
			})(tabs[i]);
		}
	}

	toggleFilterMismatchedTabs = () => {
		this.state.filterTabs = !this.state.filterTabs;
		localStorage["filter-tabs"] = this.state.filterTabs ? 1 : "";
		this.forceUpdate();
	};

	filterTabs(type) {
		let idList;
		const appliedFilters = [];
		let conditions = [];
		const prevValue = !!this.state.appliedFilters[type];

		this.state.appliedFilters[type] = !prevValue;

		const filters = Object.keys(this.state.appliedFilters);
		for (let i = 0; i < filters.length; i++) {
			const key = filters[i];
			if (this.state.appliedFilters[key]) {
				appliedFilters.push(key);
			}
		}
		for (let filter of appliedFilters) {
			let condition;
			if (filter === "audible") {
				condition = (tab) => tab.audible;
			} else if (filter === "pinned") {
				condition = (tab) => tab.pinned;
			} else if (filter === "muted") {
				condition = (tab) => tab.mutedInfo && tab.mutedInfo.muted;
			}
			conditions.push(condition);
		}
		let hiddenCount = this.state.hiddenCount || 0;
		if(appliedFilters.length) {
			const lastSearchLen = this.state.searchLen;
			if (!lastSearchLen) {
				idList = this.state.tabsbyid;
			} else if (lastSearchLen > searchLen) {
				idList = this.state.hiddenTabs;
			} else if (lastSearchLen < searchLen) {
				idList = this.state.selection;
			} else {
				return;
			}
			for (let id in idList) {
				const tab = this.state.tabsbyid[id];
				console.log("tab", tab);
				const condition = conditions.reduce((acc, condition) => acc || condition.call(this, tab), false);
				if (condition) {
					hiddenCount -= (this.state.hiddenTabs[id] || 0);
					this.state.selection[id] = true;
					delete this.state.hiddenTabs[id];
				} else {
					hiddenCount += 1 - (this.state.hiddenTabs[id] || 0);
					this.state.hiddenTabs[id] = true;
					delete this.state.selection[id];
				}
			}
		} else {
			this.state.selection = {};
			this.state.hiddenTabs = {};
			hiddenCount = 0;
		}
		this.state.hiddenCount = hiddenCount;
		this.forceUpdate();
	}
}
