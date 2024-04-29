/**
 * External dependencies.
 */
import { __, sprintf } from '@wordpress/i18n';
import parse from 'html-react-parser';
import {
    Button,
	SelectControl,
    Modal,
    CheckboxControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies.
 */
import {
	Section,
	SectionTitle,
	SectionDescription,
	InputWrapper,
	SquareCheckboxControl,
} from '../../components';

export const ConfigureSync = ( { indent = 0, useSquareSettings }) => {
	const {
		settings,
		squareSettingsLoaded,
		setSquareSettingData,
	} = useSquareSettings;

    const [ updateImport, setUpdateImport ] = useState( false );
    const [ isOpen, setOpen ] = useState( false );
    const [ isImporting, setIsImporting ] = useState( false );
    const [ importDoneNotice, setImportDoneNotice ] = useState( '' );
    const openModal = () => setOpen( true );
    const closeModal = () => setOpen( false );

	const {
		system_of_record = 'disabled',
		enable_inventory_sync = 'no',
		override_product_images = 'no',
		hide_missing_products = 'no',
		sync_interval = '0.25',
		is_connected = false,
	} = settings;

	const sync_interval_options = [
		{
			label: __( '15 minutes', 'woocommerce-square' ),
			value: '0.25',
		},
		{
			label: __( '30 minutes', 'woocommerce-square' ),
			value: '0.5',
		},
		{
			label: __( '45 minutes', 'woocommerce-square' ),
			value: '0.75',
		},
		{
			label: __( '1 hour', 'woocommerce-square' ),
			value: '1',
		},
		{
			label: __( '2 hours', 'woocommerce-square' ),
			value: '2',
		},
		{
			label: __( '3 hours', 'woocommerce-square' ),
			value: '3',
		},
		{
			label: __( '6 hours', 'woocommerce-square' ),
			value: '6',
		},
		{
			label: __( '8 hours', 'woocommerce-square' ),
			value: '8',
		},
		{
			label: __( '12 hours', 'woocommerce-square' ),
			value: '12',
		},
		{
			label: __( '24 hours', 'woocommerce-square' ),
			value: '24',
		},
	];

	if ( ! squareSettingsLoaded ) {
		return null;
	}

    const importProducts = async () => {
        const response = await apiFetch( {
			path: '/wc/v3/wc_square/import-products',
			method: 'POST',
			data: {
                update_during_import: updateImport,
                api_callback: true,
            },
		} );

        closeModal();
        setIsImporting( false );
        setImportDoneNotice( response.data );
    }

	return (
		<>
			{ is_connected && ( <Section>
				<SectionTitle title={ __( 'Configure Sync Settings', 'woocommerce-square' ) } />
				<SectionDescription>
					{ __( 'Choose how you want your product data to flow between WooCommerce and Square to keep your inventory and listings perfectly aligned. Select from the options below to best match your business operations:', 'woocommerce-square' ) }
				</SectionDescription>

                <div className='woo-square-wizard__fields'>
                    <InputWrapper
                        label={ __( 'Sync Settings', 'woocommerce-square' ) }
                        description={
                            parse(
                                sprintf(
                                    __( "Choose where data will be updated for synced products. Inventory in Square is always checked for adjustments when sync is enabled. %1$sLearn more%2$s about choosing a system of record or %3$screate a ticket%4$s if you're experiencing technical issues.", 'woocommerce-square' ),
                                    '<a href="https://woocommerce.com/document/woocommerce-square/#section-8" target="_blank">',
                                    '</a>',
                                    '<a href="https://wordpress.org/support/plugin/woocommerce-square/" target="_blank">',
                                    '</a>',
                                )
                            )
                        }
                    >
                        <SelectControl
                            value={ system_of_record }
                            onChange={ ( system_of_record ) => setSquareSettingData( { system_of_record } ) }
                            options={ [
                                {
                                    label: __( 'Disabled', 'woocommerce-square' ),
                                    value: 'disabled',
                                },
                                {
                                    label: __( 'Square', 'woocommerce-square' ),
                                    value: 'square',
                                },
                                {
                                    label: __( 'WooCommerce', 'woocommerce-square' ),
                                    value: 'woocommerce',
                                },
                            ] }
                        />
                    </InputWrapper>

                    {
                        'woocommerce' === system_of_record && (
                            <InputWrapper
                                label={ __( 'Sync Inventory', 'woocommerce-square' ) }
                                indent = { indent }
                                description={
                                    parse(
                                        sprintf(
                                            __( 'Inventory is %1$salways fetched from Square%2$s periodically to account for sales from other channels.', 'woocommerce-square' ),
                                            '<strong>',
                                            '</strong>'
                                        )
                                    )
                                }
                            >
                                <SquareCheckboxControl
                                    checked={ 'yes' === enable_inventory_sync }
                                    onChange={ ( enable_inventory_sync ) => setSquareSettingData( { enable_inventory_sync: enable_inventory_sync ? 'yes' : 'no' } ) }
                                    label={ __( 'Enable to push inventory changes to Square', 'woocommerce-square' ) }
                                />
                            </InputWrapper>
                        )
                    }

                    {
                        'square' === system_of_record && (
                            <>
                                <InputWrapper
                                    label={ __( 'Sync Inventory', 'woocommerce-square' ) }
                                    indent = { indent }
                                    description={ __( 'Inventory is fetched from Square periodically and updated in WooCommerce.', 'woocommerce-square' ) }
                                >
                                    <SquareCheckboxControl
                                        checked={ 'yes' === enable_inventory_sync }
                                        onChange={ ( enable_inventory_sync ) => setSquareSettingData( { enable_inventory_sync: enable_inventory_sync ? 'yes' : 'no' } ) }
                                        label={ __( 'Enable to fetch inventory changes from Square', 'woocommerce-square' ) }
                                    />
                                </InputWrapper>

                                <InputWrapper
                                    label={ __( 'Override product images', 'woocommerce-square' ) }
                                    indent = { indent }
                                    description={ __( 'Product images that have been updated in Square will also be updated within WooCommerce during a sync.', 'woocommerce-square' ) }
                                >
                                    <SquareCheckboxControl
                                        checked={ 'yes' === override_product_images }
                                        onChange={ ( override_product_images ) => setSquareSettingData( { override_product_images: override_product_images ? 'yes' : 'no' } ) }
                                        label={ __( 'Enable to override Product images from Square', 'woocommerce-square' ) }
                                    />
                                </InputWrapper>

                                <InputWrapper
                                    label={ __( 'Handle missing products', 'woocommerce-square' ) }
                                    indent = { indent }
                                    description={ __( 'Products not found in Square will be hidden in the WooCommerce product catalog.', 'woocommerce-square' ) }
                                >
                                    <SquareCheckboxControl
                                        checked={ 'yes' === hide_missing_products }
                                        onChange={ ( hide_missing_products ) => setSquareSettingData( { hide_missing_products: hide_missing_products ? 'yes' : 'no' } ) }
                                        label={ __( 'Hide synced products when not found in Square', 'woocommerce-square' ) }
                                    />
                                </InputWrapper>
                            </>
                        )
                    }

                    {
                        ( 'woocommerce' === system_of_record || 'square' === system_of_record ) && (
                            <InputWrapper
                                label={ __( 'Sync interval', 'woocommerce-square' ) }
                                description={ __( 'Frequency for how regularly WooCommerce will sync products with Square.', 'woocommerce-square' ) }
                                indent = { indent }
                            >
                                <SelectControl
                                    value={ sync_interval }
                                    options={ sync_interval_options }
                                    onChange={ ( sync_interval ) => setSquareSettingData( { sync_interval } ) }
                                />
                            </InputWrapper>
                        )
                    }

                    {
                        ( 'woocommerce' === system_of_record ) && (
                            <>
                                <InputWrapper
                                    label={ __( 'Import Products', 'woocommerce-square' ) }
                                >
                                    <Button
                                        variant='secondary'
                                        className='import-square-products-react'
                                        onClick={ openModal }
                                        style={ { display: importDoneNotice ? 'none' : 'block' } }
                                    >
                                        { __( 'Import all Products from Square', 'woocommerce-square' ) }
                                    </Button>
                                    <div className='import-notice notice notice-info is-dismissible' style={ { display: importDoneNotice ? 'block' : 'none', padding: '10px' } }>
                                        { importDoneNotice }
                                    </div>
                                </InputWrapper>

                                { isOpen &&
                                    <Modal title='Import Products From Square' size={'large'} onRequestClose={ closeModal }>
                                        <div className='import-modal-cover'>
                                            <div className='import-modal-content'>
                                                <p>{__( 'You are about to import all new products, variations and categories from Square. This will create a new product in WooCommerce for every product retrieved from Square. If you have products in the trash from the previous imports, these will be ignored in the import.', 'woocommerce-square' )} </p>
                                                <h4>{__( 'Do you wish to import existing product updates from Square?', 'woocommerce-square' )} </h4>
                                                <p>
                                                    {
                                                        parse(
                                                            sprintf( __( 'Doing so will update existing WooCommerce products with the latest information from Square. %1$sView Documentation%2$s.', 'woocommerce-square' ), '<a href="https://woocommerce.com/document/woocommerce-square/#section-8" target="_blank">', '</a>' )
                                                        )
                                                    }
                                                </p>
                                                <CheckboxControl
                                                    checked={ updateImport }
                                                    onChange={ ( updateImport ) => setUpdateImport( updateImport ) }
                                                    label={ __( 'Update existing products during import.', 'woocommerce-square' ) }
                                                />
                                            </div>
                                            <div className="import-buttons">
                                                <Button variant="secondary" onClick={ closeModal }>
                                                    {__( 'Cancel', 'woocommerce-square' )}
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    onClick={ () => {
                                                        setIsImporting( true );
                                                        importProducts();
                                                    } }
                                                    isBusy={ isImporting }
                                                >
                                                    {__( 'Import Products', 'woocommerce-square' )}
                                                </Button>
                                            </div>
                                        </div>
                                    </Modal>
                                }
                            </>
                        )
                    }
                </div>
			</Section> ) }
		</>
	)
};
