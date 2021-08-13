/* globals */
import {useSelector, useDispatch} from 'react-redux';
import cn from 'classnames';
import {plusEnergy, minusEnergy} from '../actions';

export const SimpleButton = ({name, disabled, style, onClick}) =>
	(
		<div className={cn('simpleButton', { 'disabled': disabled })} style={style} onClick={onClick}>{name}</div>
	);

// eslint-disable-next-line react/display-name
export const withEnergyManipulation = Component => ({ id, data, ...props }) => {
	const dispatch = useDispatch();
	const freeEnergy = useSelector(state => state.energyPrompt.freeEnergy);
	const currentEnergy = useSelector(state => state.energyPrompt.cards[id]) || 0;

	const handlePlusEnergy = () => {
		if (freeEnergy > 0) {
			dispatch(plusEnergy(id));
		}
	};

	const handleMinusEnergy = () => {
		if (currentEnergy > 0) {
			dispatch(minusEnergy(id));
		}
	};
	
	return <>
		<Component
			id={id}
			data={data}
			{...props}
		/>
		<div className="energyManipulation">
			<SimpleButton name="-" style={{ color: currentEnergy === 0 ? '#ccc': '#000'}} onClick={handleMinusEnergy} disabled={currentEnergy === 0} />
			<div className="currentEnergy">{currentEnergy}</div>
			<SimpleButton name="+" style={{ color: currentEnergy === 0 ? '#ccc': '#000'}} onClick={handlePlusEnergy} disabled={freeEnergy === 0} />
		</div>
	</>;
};
