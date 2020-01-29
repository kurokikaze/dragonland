import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import './style.css';

import {
} from 'moonlands/src/const';

function Step({icon, active}) {
    return (
    <div>
        <img src={`/images/UI/${icon}${active ? '-active': ''}.png`} width="50" height="50" />
    </div>);
}

function StepBoard({currentStep}) {
    return (
        <div className="stepBoard">
            <Step icon="energize" active={currentStep === 0} />
            <Step icon="prs" active={currentStep === 1} />
            <Step icon="attack" active={currentStep === 2} />
            <Step icon="creatures" active={currentStep === 3} />
            <Step icon="prs" active={currentStep === 4} />
            <Step icon="draw" active={currentStep === 5} />
        </div>
    );
}

function mapStateToProps(state) {
    return {
        currentStep: state.step,
        promptParams: state.promptParams,
    };
}

const enhance = connect(mapStateToProps);

export default enhance(StepBoard);
