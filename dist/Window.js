var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Window = function (_React$Component) {
	_inherits(Window, _React$Component);

	function Window() {
		var _ref;

		var _temp, _this, _ret;

		_classCallCheck(this, Window);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Window.__proto__ || Object.getPrototypeOf(Window)).call.apply(_ref, [this].concat(args))), _this), _this.addTab = function () {
			chrome.tabs.create({ windowId: _this.props.window.id });
		}, _this.close = function () {
			chrome.windows.remove(_this.props.window.id);
		}, _temp), _possibleConstructorReturn(_this, _ret);
	}

	_createClass(Window, [{
		key: "render",
		value: function render() {
			var _this2 = this;

			var hideWindow = true;
			var tabsperrow = this.props.layout === "blocks" ? Math.ceil(Math.sqrt(this.props.tabs.length + 2)) : this.props.layout === "vertical" ? 1 : 15;
			var tabs = this.props.tabs.map(function (tab) {
				var isHidden = !!_this2.props.hiddenTabs[tab.id] && _this2.props.filterTabs;
				var isSelected = !!_this2.props.selection[tab.id];
				hideWindow &= isHidden;
				return React.createElement(Tab, {
					key: "tab" + tab.id,
					window: _this2.props.window,
					layout: _this2.props.layout,
					tab: tab,
					selected: isSelected,
					hidden: isHidden,
					middleClick: _this2.props.tabMiddleClick,
					select: _this2.props.select,
					drag: _this2.props.drag,
					drop: _this2.props.drop
				});
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
			if (!hideWindow) {
				tabs.push(React.createElement("div", { key: "tab-add", className: "icon add " + (this.props.layout === "blocks" ? "" : "windowaction"), title: "Add tab to window", onClick: this.addTab }));
				tabs.push(React.createElement("div", { key: "tab-close", className: "icon close " + (this.props.layout === "blocks" ? "" : "windowaction"), title: "Close window", onClick: this.close }));
				var children = [];
				var count = 0;
				for (var j = 0; j < tabs.length; j++) {
					if (j % tabsperrow === 0 && j && (j < tabs.length - 1 || this.props.layout === "blocks")) {
						children.push(React.createElement("div", { key: "tab-liner" + count++, className: "newliner" }));
					}
					children.push(tabs[j]);
				}
				return React.createElement(
					"div",
					{ className: "window " + (this.props.layout === "blocks" ? "block" : "") },
					children
				);
			} else {
				return null;
			}
		}
	}]);

	return Window;
}(React.Component);