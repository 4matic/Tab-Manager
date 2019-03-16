var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TabManager = function (_React$Component) {
	_inherits(TabManager, _React$Component);

	function TabManager(props) {
		_classCallCheck(this, TabManager);

		var _this = _possibleConstructorReturn(this, (TabManager.__proto__ || Object.getPrototypeOf(TabManager)).call(this, props));

		_this.getFilterClasses = function (className, filter) {
			var classes = "icon filteraction " + className;
			if (!filter) filter = className;
			if (_this.state.appliedFilters[filter]) {
				classes += " active";
			}
			return classes;
		};

		_this.deleteTabs = function () {
			var tabs = Object.keys(_this.state.selection).map(function (id) {
				return _this.state.tabsbyid[id];
			});
			if (tabs.length) {
				for (var i = 0; i < tabs.length; i++) {
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

		_this.addWindow = function () {
			var tabs = Object.keys(_this.state.selection).map(function (id) {
				return _this.state.tabsbyid[id];
			});
			var first = tabs.shift();
			var count = 0;
			if (first) {
				chrome.windows.create({ tabId: first.id }, function (w) {
					chrome.tabs.update(first.id, { pinned: first.pinned });
					for (var i = 0; i < tabs.length; i++) {
						(function (tab) {
							chrome.tabs.move(tab.id, { windowId: w.id, index: 1 }, function () {
								chrome.tabs.update(tab.id, { pinned: tab.pinned });
							});
						})(tabs[i]);
					}
				});
			} else {
				chrome.windows.create({});
			}
		};

		_this.pinTabs = function () {
			var tabs = Object.keys(_this.state.selection).map(function (id) {
				return _this.state.tabsbyid[id];
			}).sort(function (a, b) {
				return a.index - b.index;
			});
			if (tabs.length) {
				if (tabs[0].pinned) tabs.reverse();
				for (var i = 0; i < tabs.length; i++) {
					chrome.tabs.update(tabs[i].id, { pinned: !tabs[0].pinned });
				}
			} else {
				chrome.windows.getCurrent(function (w) {
					chrome.tabs.getSelected(w.id, function (t) {
						chrome.tabs.update(t.id, { pinned: !t.pinned });
					});
				});
			}
		};

		_this.search = function (e) {
			var hiddenCount = _this.state.hiddenCount || 0;
			var searchLen = (e.target.value || "").length;
			if (!searchLen) {
				_this.state.selection = {};
				_this.state.hiddenTabs = {};
				hiddenCount = 0;
			} else {
				var idList = void 0;
				var lastSearchLen = _this.state.searchLen;
				if (!lastSearchLen) {
					idList = _this.state.tabsbyid;
				} else if (lastSearchLen > searchLen) {
					idList = _this.state.hiddenTabs;
				} else if (lastSearchLen < searchLen) {
					idList = _this.state.selection;
				} else {
					return;
				}
				for (var id in idList) {
					var tab = _this.state.tabsbyid[id];
					if ((tab.title + tab.url).toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0) {
						hiddenCount -= _this.state.hiddenTabs[id] || 0;
						_this.state.selection[id] = true;
						delete _this.state.hiddenTabs[id];
					} else {
						hiddenCount += 1 - (_this.state.hiddenTabs[id] || 0);
						_this.state.hiddenTabs[id] = true;
						delete _this.state.selection[id];
					}
				}
			}
			_this.state.hiddenCount = hiddenCount;
			_this.state.searchLen = searchLen;
			_this.forceUpdate();
		};

		_this.checkEnter = function (e) {
			if (e.keyCode === 13) _this.addWindow();
		};

		_this.changeLayout = function () {
			if (_this.state.layout === "blocks") {
				localStorage["layout"] = _this.state.layout = "horizontal";
			} else if (_this.state.layout === "horizontal") {
				localStorage["layout"] = _this.state.layout = "vertical";
			} else {
				localStorage["layout"] = _this.state.layout = "blocks";
			}
			_this.forceUpdate();
		};

		_this.toggleFilterMismatchedTabs = function () {
			_this.state.filterTabs = !_this.state.filterTabs;
			localStorage["filter-tabs"] = _this.state.filterTabs ? 1 : "";
			_this.forceUpdate();
		};

		_this.state = {
			layout: localStorage["layout"] || "horizontal",
			windows: [],
			selection: {},
			hiddenTabs: {},
			tabsbyid: {},
			appliedFilters: {},
			windowsbyid: {},
			filterTabs: !!localStorage["filter-tabs"]
		};
		_this.searchBox = React.createRef();
		return _this;
	}

	_createClass(TabManager, [{
		key: "render",
		value: function render() {
			var _this2 = this;

			var hiddenCount = this.state.hiddenCount || 0;
			var tabCount = this.state.tabCount || 0;
			var selectedTabsCount = Object.keys(this.state.selection).length;
			return React.createElement(
				"div",
				null,
				React.createElement(
					"div",
					{ className: "window filterbox" },
					React.createElement("div", { className: this.getFilterClasses('muted'), title: "Muted tabs", onClick: this.filterTabs.bind(this, 'muted') }),
					React.createElement("div", { className: this.getFilterClasses('playingaudio', 'audible'), title: "Audible tabs", onClick: this.filterTabs.bind(this, 'audible') }),
					React.createElement("div", { className: this.getFilterClasses('pinned'), title: "Pinned tabs", onClick: this.filterTabs.bind(this, 'pinned') })
				),
				this.state.windows.map(function (window) {
					return React.createElement(Window, {
						key: "window" + window.id,
						window: window,
						tabs: window.tabs,
						layout: _this2.state.layout,
						selection: _this2.state.selection,
						hiddenTabs: _this2.state.hiddenTabs,
						filterTabs: _this2.state.filterTabs,
						tabMiddleClick: _this2.deleteTab.bind(_this2),
						select: _this2.select.bind(_this2),
						drag: _this2.drag.bind(_this2),
						drop: _this2.drop.bind(_this2)
					});
				}),
				React.createElement(
					"div",
					{ className: "window searchbox" },
					React.createElement("input", { ref: this.searchBox, type: "text", onChange: this.search, onKeyDown: this.checkEnter }),
					React.createElement("div", { className: "icon windowaction " + this.state.layout, title: "Change layout", onClick: this.changeLayout }),
					React.createElement("div", { className: "icon windowaction trash", title: selectedTabsCount ? "Delete tabs (" + selectedTabsCount + ")" : 'Delete current tab', onClick: this.deleteTabs }),
					React.createElement("div", { className: "icon windowaction pin", title: selectedTabsCount ? "Pin tabs (" + selectedTabsCount + ")" : 'Pin current tab', onClick: this.pinTabs }),
					React.createElement("div", {
						className: "icon windowaction filter" + (this.state.filterTabs ? " enabled" : ""),
						title: (this.state.filterTabs ? "Do not hide" : "Hide") + " non-matching Tabs",
						onClick: this.toggleFilterMismatchedTabs
					}),
					React.createElement("div", { className: "icon windowaction new", title: "Add Window", onClick: this.addWindow })
				),
				React.createElement("div", { className: "window placeholder" })
			);
		}
	}, {
		key: "componentDidMount",
		value: function componentDidMount() {
			var box = this.searchBox.current;
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
	}, {
		key: "update",
		value: function update() {
			chrome.windows.getAll({ populate: true }, function (windows) {
				this.state.windows = windows;
				this.state.windowsbyid = {};
				this.state.tabsbyid = {};
				var tabCount = 0;
				for (var i = 0; i < windows.length; i++) {
					var window = windows[i];
					this.state.windowsbyid[window.id] = window;
					for (var j = 0; j < window.tabs.length; j++) {
						var tab = window.tabs[j];
						this.state.tabsbyid[tab.id] = tab;
						tabCount++;
					}
				}
				for (var id in this.state.selection) {
					if (!this.state.tabsbyid[id]) delete this.state.selection[id];
				}
				this.state.tabCount = tabCount;
				this.state.searchLen = 0;
				this.forceUpdate();
			}.bind(this));
		}
	}, {
		key: "deleteTab",
		value: function deleteTab(tabId) {
			chrome.tabs.remove(tabId);
		}
	}, {
		key: "select",
		value: function select(id) {
			if (this.state.selection[id]) {
				delete this.state.selection[id];
			} else {
				this.state.selection[id] = true;
			}
			this.forceUpdate();
		}
	}, {
		key: "drag",
		value: function drag(e, id) {
			if (!this.state.selection[id]) {
				this.state.selection = {};
				this.state.selection[id] = true;
			}
			this.forceUpdate();
		}
	}, {
		key: "drop",
		value: function drop(id, before) {
			var _this3 = this;

			var tab = this.state.tabsbyid[id];
			var tabs = Object.keys(this.state.selection).map(function (id) {
				return _this3.state.tabsbyid[id];
			});
			var index = tab.index + (before ? 0 : 1);

			for (var i = 0; i < tabs.length; i++) {
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
	}, {
		key: "filterTabs",
		value: function filterTabs(type) {
			var _this4 = this;

			var idList = void 0;
			var appliedFilters = [];
			var conditions = [];
			var prevValue = !!this.state.appliedFilters[type];

			this.state.appliedFilters[type] = !prevValue;

			var filters = Object.keys(this.state.appliedFilters);
			for (var i = 0; i < filters.length; i++) {
				var key = filters[i];
				if (this.state.appliedFilters[key]) {
					appliedFilters.push(key);
				}
			}
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = appliedFilters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var filter = _step.value;

					var condition = void 0;
					if (filter === "audible") {
						condition = function condition(tab) {
							return tab.audible;
						};
					} else if (filter === "pinned") {
						condition = function condition(tab) {
							return tab.pinned;
						};
					} else if (filter === "muted") {
						condition = function condition(tab) {
							return tab.mutedInfo && tab.mutedInfo.muted;
						};
					}
					conditions.push(condition);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			var hiddenCount = this.state.hiddenCount || 0;
			if (appliedFilters.length) {
				var lastSearchLen = this.state.searchLen;
				if (!lastSearchLen) {
					idList = this.state.tabsbyid;
				} else if (lastSearchLen > searchLen) {
					idList = this.state.hiddenTabs;
				} else if (lastSearchLen < searchLen) {
					idList = this.state.selection;
				} else {
					return;
				}

				var _loop = function _loop(id) {
					var tab = _this4.state.tabsbyid[id];
					console.log("tab", tab);
					var condition = conditions.reduce(function (acc, condition) {
						return acc || condition.call(_this4, tab);
					}, false);
					if (condition) {
						hiddenCount -= _this4.state.hiddenTabs[id] || 0;
						_this4.state.selection[id] = true;
						delete _this4.state.hiddenTabs[id];
					} else {
						hiddenCount += 1 - (_this4.state.hiddenTabs[id] || 0);
						_this4.state.hiddenTabs[id] = true;
						delete _this4.state.selection[id];
					}
				};

				for (var id in idList) {
					_loop(id);
				}
			} else {
				this.state.selection = {};
				this.state.hiddenTabs = {};
				hiddenCount = 0;
			}
			this.state.hiddenCount = hiddenCount;
			this.forceUpdate();
		}
	}]);

	return TabManager;
}(React.Component);