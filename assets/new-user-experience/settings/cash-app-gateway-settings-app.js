/**
 * External dependencies.
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies.
 */
import { CashAppSetup } from '../onboarding/steps/';
import { usePaymentGatewaySettings } from '../onboarding/hooks';
import { Loader } from '../components';

export const CashAppSettingsApp = () => {
	const usePaymentGatewaySettingsData = usePaymentGatewaySettings( true );
	const { cashAppGatewaySettings, cashAppGatewaySettingsLoaded, saveCashAppSettings } = usePaymentGatewaySettingsData;
	const [ saveInProgress, setSaveInProgress ] = useState( false );
	const { createSuccessNotice } = useDispatch( noticesStore );

	if ( ! cashAppGatewaySettingsLoaded ) {
		return <Loader />;
	}

	const saveSettings = async () => {
		setSaveInProgress( true );
		const response = await saveCashAppSettings( cashAppGatewaySettings );

		if ( response.success ) {
			createSuccessNotice( __( 'Settings saved!', 'woocommerce-square' ), {
				type: 'snackbar',
			} )
		}

		setSaveInProgress( false );
	};

	const style = {
		width: '100%',
		maxWidth: '780px',
		marginTop: '50px',
		marginLeft: '50px',
	};

	return (
		<div style={ style }>
			<CashAppSetup usePaymentGatewaySettings={usePaymentGatewaySettingsData} />
			<Button
				variant='primary'
				onClick={ () => saveSettings() }
				isBusy={ saveInProgress }
			>
				{ __( 'Save Changes', 'woocommerce-square' ) }
			</Button>
		</div>
	)
};
