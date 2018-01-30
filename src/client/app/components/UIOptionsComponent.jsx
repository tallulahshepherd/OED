/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Slider from 'react-rangeslider';
import moment from 'moment';
import { Button, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import 'react-rangeslider/lib/index.css';
import '../styles/react-rangeslider-fix.css';
import { chartTypes } from '../reducers/graph';
import ExportContainer from '../containers/ExportContainer';
import ChartSelectContainer from '../containers/ChartSelectContainer';
import ChartDataSelectContainer from '../containers/ChartDataSelectContainer';
import BaselineCreationContainer from '../containers/BaselineCreationContainer';
import ChartLinkContainer from '../containers/ChartLinkContainer';
import TimeInterval from '../../../common/TimeInterval';

export default class UIOptionsComponent extends React.Component {
	/**
	 * Initializes the component's state, binds all functions to 'this' UIOptionsComponent
	 * @param props The props passed down through the UIOptionsContainer
	 */
	constructor(props) {
		super(props);
		this.handleMeterSelect = this.handleMeterSelect.bind(this);
		this.handleBarDurationChange = this.handleBarDurationChange.bind(this);
		this.handleBarDurationChangeComplete = this.handleBarDurationChangeComplete.bind(this);
		this.handleChangeBarStacking = this.handleChangeBarStacking.bind(this);
		this.handleSpanButton = this.handleSpanButton.bind(this);
		this.handleCompareSpanButton = this.handleCompareSpanButton.bind(this);
		this.toggleSlider = this.toggleSlider.bind(this);
		this.state = {
			barDuration: this.props.barDuration.asDays(),
			showSlider: false
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ barDuration: nextProps.barDuration.asDays() });
	}

	/**
	 * Stores temporary barDuration until slider is released, used to update the UI of the slider
	 */
	handleBarDurationChange(value) {
		this.setState({ barDuration: value });
	}

	/**
	 * Handles a change in meter selection
	 * @param {Object[]} selection An array of {label: string, value: {type: string, id: int}} representing the current selection
	 */
	handleMeterSelect(selection) {
		this.props.selectMeters(selection.map(s => s.value));
	}

	/**
	 * Called when the user releases the slider, dispatch action on temporary state variable
	 */
	handleBarDurationChangeComplete(e) {
		e.preventDefault();
		this.props.changeDuration(moment.duration(this.state.barDuration, 'days'));
	}

	handleChangeBarStacking() {
		this.props.changeBarStacking();
	}

	handleSpanButton(value) {
		this.props.changeDuration(moment.duration(value, 'days'));
	}

	handleCompareSpanButton(value) {
		let compareTimeInterval;
		let compareDuration;
		switch (value) {
			case 'day':
				compareTimeInterval = new TimeInterval(moment().subtract(2, 'days'), moment()).toString();
				// fetch hours for accuracy when time interval is small
				compareDuration = moment.duration(1, 'hours');
				break;
			case 'month':
				compareTimeInterval = new TimeInterval(moment().startOf('week').subtract(49, 'days'), moment()).toString();
				compareDuration = moment.duration(1, 'days');
				break;
			default: // handles week
				compareTimeInterval = new TimeInterval(moment().startOf('week').subtract(7, 'days'), moment()).toString();
				compareDuration = moment.duration(1, 'days');
				break;
		}
		this.props.changeCompareInterval(compareTimeInterval, compareDuration);
	}

	toggleSlider() {
		this.setState({ showSlider: !this.state.showSlider });
	}

	/**
	 * @returns JSX to create the UI options side-panel (includes dynamic rendering of meter information for selection)
	 */
	render() {
		const labelStyle = {
			fontWeight: 'bold',
			margin: 0
		};

		const divTopPadding = {
			paddingTop: '15px'
		};

		const zIndexFix = {
			zIndex: '0'
		};

		const divBottomPadding = {
			paddingBottom: '15px'
		};

		const compareTimeIntervalDurationInDays = TimeInterval.fromString(this.props.compareInterval).duration('days');
		let compareVal;
		if (compareTimeIntervalDurationInDays < 7) {
			compareVal = 'day';
		} else if (compareTimeIntervalDurationInDays >= 7 && compareTimeIntervalDurationInDays < 14) {
			compareVal = 'week';
		} else {
			compareVal = 'month';
		}

		return (
			<div>
				<ChartSelectContainer />
				{/* Controls specific to the bar chart. */}
				{this.props.chartToRender === chartTypes.compare &&
				<p style={divBottomPadding}>
					Note: group data cannot be used with the compare function at this time.
				</p>
				}
				<ChartDataSelectContainer />

				{/* Controls specific to the bar chart */}
				{this.props.chartToRender === chartTypes.bar &&
					<div>
						<div className="checkbox">
							<label><input type="checkbox" onChange={this.handleChangeBarStacking} checked={this.props.barStacking}/>Bar stacking</label>
						</div>
						<p style={labelStyle}>Bar chart interval :</p>
						<ToggleButtonGroup
							type="radio"
							name="timeSpans"
							value={this.state.barDuration}
							onChange={this.handleSpanButton}
							style={zIndexFix}
						>
							<ToggleButton value={1}>Day</ToggleButton>
							<ToggleButton value={7}>Week</ToggleButton>
							<ToggleButton value={28}>Month</ToggleButton>
						</ToggleButtonGroup>
						<Button name="customToggle" onClick={this.toggleSlider}>Toggle CustomSlider (days)</Button>

						{this.state.showSlider &&
						<Slidermin={1} max={365} value={this.state.barDuration} onChange={this.handleBarDurationChange} onChangeComplete={this.handleBarDurationChangeComplete}
					/>
						}</div>
				}
				{ /* Controls specific to the compare chart */}
				{this.props.chartToRender === chartTypes.compare &&
				<div>
					<ToggleButtonGroup
						name="timeSpansCompare"
						value={compareVal}
						onChange={this.handleCompareSpanButton}
						style={zIndexFix}
					>
						<ToggleButton value="day">Day</ToggleButton>
						<ToggleButton value="week">Week</ToggleButton>
						<ToggleButton value="month">Month</ToggleButton>
					</ToggleButtonGroup>
				</div>
				}


				{/* We can't export compare data -- Don't render export button if looking at compare */}
				{this.props.chartToRender !== chartTypes.compare &&
				<div style={divTopPadding}>
						<ExportContainer />
					</div>
				}

				<BaselineCreationContainer />

				<div style={divTopPadding}>
					<ChartLinkContainer />
				</div>
			</div>
		);
	}
}
