var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tab = function (_React$Component) {
	_inherits(Tab, _React$Component);

	function Tab(props) {
		_classCallCheck(this, Tab);

		var _this = _possibleConstructorReturn(this, (Tab.__proto__ || Object.getPrototypeOf(Tab)).call(this, props));

		_this.getClassName = function () {
			return "icon tab " + (_this.props.selected ? "selected " : "") + (_this.props.hidden ? "hidden " : "") + (_this.props.layout === "vertical" ? "full " : "") + (_this.props.tab.incognito ? "incognito " : "") + (_this.props.tab.audible ? "audible " : "") + (_this.state.draggingOver || "");
		};

		_this.click = function (e) {
			if (e.button === 1) {
				_this.props.middleClick(_this.props.tab.id);
			} else if (e.nativeEvent.shiftKey || e.nativeEvent.ctrlKey) {
				_this.props.select(_this.props.tab.id);
			} else {
				chrome.tabs.update(_this.props.tab.id, { selected: true });
				chrome.windows.update(_this.props.window.id, { focused: true });
			}
		};

		_this.dragStart = function (e) {
			_this.props.drag(e, _this.props.tab.id);
		};

		_this.dragOver = function (e) {
			e.nativeEvent.preventDefault();
			var before = _this.state.draggingOver;
			if (_this.props.layout === "vertical") {
				_this.state.draggingOver = e.nativeEvent.offsetY > _this.getDOMNode().clientHeight / 2 ? "bottom" : "top";
			} else {
				_this.state.draggingOver = e.nativeEvent.offsetX > _this.getDOMNode().clientWidth / 2 ? "right" : "left";
			}
			if (before !== _this.state.draggingOver) _this.forceUpdate();
		};

		_this.dragOut = function () {
			delete _this.state.draggingOver;
			_this.forceUpdate();
		};

		_this.drop = function (e) {
			var before = _this.state.draggingOver === "top" || _this.state.draggingOver === "left";
			delete _this.state.draggingOver;
			_this.props.drop(_this.props.tab.id, before);
		};

		_this.resolveFavIconUrl = function () {
			if (_this.props.tab.url.indexOf("chrome://") !== 0) {
				return _this.props.tab.favIconUrl ? "url(" + _this.props.tab.favIconUrl + ")" : "";
			} else {
				var favIcons = ["bookmarks", "chrome", "crashes", "downloads", "extensions", "flags", "history", "settings"];
				var iconName = _this.props.tab.url.slice(9).match(/^\w+/g);
				return !iconName || favIcons.indexOf(iconName[0]) < 0 ? "" : "url(../images/chrome/" + iconName[0] + ".png)";
			}
		};

		_this.state = {};
		return _this;
	}

	_createClass(Tab, [{
		key: "render",
		value: function render() {
			var children = [];
			if (this.props.layout === "vertical") {
				children.push(React.createElement(
					"div",
					{ className: "tabtitle" },
					this.props.tab.title
				));
			}
			return React.createElement(
				"div",
				null,
				React.createElement(
					"div",
					{
						className: this.getClassName(),
						style: {
							backgroundImage: this.resolveFavIconUrl(),
							paddingLeft: this.props.layout === "vertical" ? "20px" : ""
						},
						title: this.props.tab.title,
						onClick: this.click,
						onDragStart: this.dragStart,
						onDragOver: this.dragOver,
						onDragLeave: this.dragOut,
						onDrop: this.drop,
						draggable: "true"
					},
					children
				),
				React.createElement("div", { className: "limiter" })
			);
			// return React.DOM.div({
			// 	className:"icon tab "
			// 		+ (this.props.selected?"selected ":"")
			// 		+ (this.props.hidden?"hidden ":"")
			// 		+ (this.props.layout==="vertical"?"full ":"")
			// 		+ (this.props.tab.incognito?"incognito ":"")
			// 		+ (this.state.draggingOver||""),
			// 	style:{
			// 		backgroundImage:this.resolveFavIconUrl(),
			// 		paddingLeft:this.props.layout==="vertical"?"20px":""
			// 	},
			// 	title:this.props.tab.title,
			// 	onClick:this.click,
			// 	onDragStart:this.dragStart,
			// 	onDragOver:this.dragOver,
			// 	onDragLeave:this.dragOut,
			// 	onDrop:this.drop,
			// 	draggable:"true"
			// },
			// 	children,
			// 	// React.DOM.div({className:"limiter"})
			// );
		}
	}]);

	return Tab;
}(React.Component);