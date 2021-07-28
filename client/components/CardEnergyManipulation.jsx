/* globals */
import cn from 'classnames';

export const SimpleButton = ({name, disabled, onClick}) =>
	(
		<div className={cn('simpleButton', { 'disabled': disabled })} onClick={onClick}>{name}</div>
	);

// eslint-disable-next-line react/display-name
export const withEnergyManipulation = Component => ({ energy, onPlus, onMinus, canIncrease, canDecrease, ...props }) => {
	return <>
		<Component 
			{...props}
		/>
		<div className="energyManipulation">
			<SimpleButton name="-" onClick={onMinus} disabled={!canDecrease} />
			<div className="currentEnergy">{energy}</div>
			<SimpleButton name="+" onClick={onPlus} disabled={!canIncrease} />
		</div>
	</>;
};
