const SHOW_POWER_NAME = 'actions/show_power_name';
const HIDE_POWER_NAME = 'actions/hide_power_name';

export default {
	SHOW_POWER_NAME,
	HIDE_POWER_NAME,
	showPowerName: (id, powerName) => ({type: SHOW_POWER_NAME, id, powerName}),
	hidePowerName: (id, powerName) => ({type: HIDE_POWER_NAME, id, powerName}),
};
