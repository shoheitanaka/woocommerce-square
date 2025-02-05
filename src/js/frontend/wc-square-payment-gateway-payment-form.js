import '../../css/frontend/wc-square-payment-gateway-payment-form.scss';

/*
 Square Payment Gateway Framework Payment Form
 */

( function () {
	const indexOf =
		[].indexOf ||
		function ( item ) {
			for ( let i = 0, l = this.length; i < l; i++ ) {
				if ( i in this && this[ i ] === item ) return i;
			}
			return -1;
		};

	jQuery( document ).ready( function ( $ ) {
		'use strict';
		return ( window.Square_Payment_Form_Handler = ( function () {
			function Square_Payment_Form_Handler( args ) {
				this.id = args.id;
				this.id_dasherized = args.id_dasherized;
				this.plugin_id = args.plugin_id;
				this.type = args.type;
				this.csc_required = args.csc_required;
				this.csc_required_for_tokens = args.csc_required_for_tokens;
				this.enabled_card_types = args.enabled_card_types;
				if ( $( 'form.checkout' ).length ) {
					this.form = $( 'form.checkout' );
					this.handle_checkout_page();
				} else if ( $( 'form#order_review' ).length ) {
					this.form = $( 'form#order_review' );
					this.handle_pay_page();
				} else if ( $( 'form#add_payment_method' ).length ) {
					this.form = $( 'form#add_payment_method' );
					this.handle_add_payment_method_page();
				} else {
					console.log( 'No payment form found!' );
					return;
				}
				this.params = window.sv_wc_payment_gateway_payment_form_params;
				if ( this.type === 'echeck' ) {
					this.form.on(
						'click',
						'.js-sv-wc-payment-gateway-echeck-form-check-hint, .js-sv-wc-payment-gateway-echeck-form-sample-check',
						( function ( _this ) {
							return function () {
								return _this.handle_sample_check_hint();
							};
						} )( this )
					);
				}
				$( document ).trigger( 'sv_wc_payment_form_handler_init', {
					id: this.id,
					instance: this,
				} );
			}

			Square_Payment_Form_Handler.prototype.handle_checkout_page = function () {
				if ( this.type === 'credit-card' ) {
					$( document.body ).on(
						'updated_checkout',
						( function ( _this ) {
							return function () {
								return _this.format_credit_card_inputs();
							};
						} )( this )
					);
				}
				$( document.body ).on(
					'updated_checkout',
					( function ( _this ) {
						return function () {
							return _this.set_payment_fields();
						};
					} )( this )
				);
				$( document.body ).on(
					'updated_checkout',
					( function ( _this ) {
						return function () {
							return _this.handle_saved_payment_methods();
						};
					} )( this )
				);
				return this.form.on(
					'checkout_place_order_' + this.id,
					( function ( _this ) {
						return function () {
							return _this.validate_payment_data();
						};
					} )( this )
				);
			};

			Square_Payment_Form_Handler.prototype.handle_pay_page = function () {
				this.set_payment_fields();
				if ( this.type === 'credit-card' ) {
					this.format_credit_card_inputs();
				}
				this.handle_saved_payment_methods();
				return this.form.submit(
					( function ( _this ) {
						return function () {
							if (
								$(
									'#order_review input[name=payment_method]:checked'
								).val() === _this.id
							) {
								return _this.validate_payment_data();
							}
						};
					} )( this )
				);
			};

			Square_Payment_Form_Handler.prototype.handle_add_payment_method_page = function () {
				this.set_payment_fields();
				if ( this.type === 'credit-card' ) {
					this.format_credit_card_inputs();
				}
				return this.form.submit(
					( function ( _this ) {
						return function () {
							if (
								$(
									'#add_payment_method input[name=payment_method]:checked'
								).val() === _this.id
							) {
								return _this.validate_payment_data();
							}
						};
					} )( this )
				);
			};

			Square_Payment_Form_Handler.prototype.set_payment_fields = function () {
				return ( this.payment_fields = $(
					'.payment_method_' + this.id
				) );
			};

			Square_Payment_Form_Handler.prototype.validate_payment_data = function () {
				let handler, valid;
				if ( this.form.is( '.processing' ) ) {
					return false;
				}
				this.saved_payment_method_selected = this.payment_fields
					.find( '.js-sv-wc-payment-gateway-payment-token:checked' )
					.val();
				valid =
					this.type === 'credit-card'
						? this.validate_card_data()
						: this.validate_account_data();
				handler =
					$( document.body ).triggerHandler(
						'sv_wc_payment_form_valid_payment_data',
						{
							payment_form: this,
							passed_validation: valid,
						}
					) !== false;
				return valid && handler;
			};

			Square_Payment_Form_Handler.prototype.format_credit_card_inputs = function () {
				$( '.js-sv-wc-payment-gateway-credit-card-form-account-number' )
					.payment( 'formatCardNumber' )
					.change();
				$( '.js-sv-wc-payment-gateway-credit-card-form-expiry' )
					.payment( 'formatCardExpiry' )
					.change();
				$( '.js-sv-wc-payment-gateway-credit-card-form-csc' )
					.payment( 'formatCardCVC' )
					.change();
				return $(
					'.js-sv-wc-payment-gateway-credit-card-form-input'
				).on(
					'change paste keyup',
					( function ( _this ) {
						return function () {
							return _this.do_inline_credit_card_validation();
						};
					} )( this )
				);
			};

			Square_Payment_Form_Handler.prototype.do_inline_credit_card_validation = function () {
				let $card_number, $card_type, $csc, $expiry;
				$card_number = $(
					'.js-sv-wc-payment-gateway-credit-card-form-account-number'
				);
				$expiry = $(
					'.js-sv-wc-payment-gateway-credit-card-form-expiry'
				);
				$csc = $( '.js-sv-wc-payment-gateway-credit-card-form-csc' );
				$card_type = $.payment.cardType( $card_number.val() );
				if ( indexOf.call( this.enabled_card_types, $card_type ) < 0 ) {
					$card_number.addClass( 'invalid-card-type' );
				} else {
					$card_number.removeClass( 'invalid-card-type' );
				}
				if (
					$.payment.validateCardExpiry(
						$expiry.payment( 'cardExpiryVal' )
					)
				) {
					$expiry.addClass( 'identified' );
				} else {
					$expiry.removeClass( 'identified' );
				}
				if ( $.payment.validateCardCVC( $csc.val() ) ) {
					return $csc.addClass( 'identified' );
				}
				return $csc.removeClass( 'identified' );
			};

			Square_Payment_Form_Handler.prototype.validate_card_data = function () {
				let account_number, csc, errors, expiry;
				errors = [];
				csc = this.payment_fields
					.find( '.js-sv-wc-payment-gateway-credit-card-form-csc' )
					.val();
				if ( csc != null ) {
					if ( csc ) {
						if ( /\D/.test( csc ) ) {
							errors.push( this.params.cvv_digits_invalid );
						}
						if ( csc.length < 3 || csc.length > 4 ) {
							errors.push( this.params.cvv_length_invalid );
						}
					} else if ( this.csc_required ) {
						if (
							! this.saved_payment_method_selected ||
							this.csc_required_for_tokens
						) {
							errors.push( this.params.cvv_missing );
						}
					}
				}
				if ( ! this.saved_payment_method_selected ) {
					account_number = this.payment_fields
						.find(
							'.js-sv-wc-payment-gateway-credit-card-form-account-number'
						)
						.val();
					expiry = $.payment.cardExpiryVal(
						this.payment_fields
							.find(
								'.js-sv-wc-payment-gateway-credit-card-form-expiry'
							)
							.val()
					);
					account_number = account_number.replace( /-|\s/g, '' );
					if ( ! account_number ) {
						errors.push( this.params.card_number_missing );
					} else {
						if (
							account_number.length < 12 ||
							account_number.length > 19
						) {
							errors.push(
								this.params.card_number_length_invalid
							);
						}
						if ( /\D/.test( account_number ) ) {
							errors.push(
								this.params.card_number_digits_invalid
							);
						}
						if (
							! $.payment.validateCardNumber( account_number )
						) {
							errors.push( this.params.card_number_invalid );
						}
					}
					if ( ! $.payment.validateCardExpiry( expiry ) ) {
						errors.push( this.params.card_exp_date_invalid );
					}
				}
				if ( errors.length > 0 ) {
					this.render_errors( errors );
					return false;
				}
				this.payment_fields
					.find(
						'.js-sv-wc-payment-gateway-credit-card-form-account-number'
					)
					.val( account_number );
				return true;
			};

			Square_Payment_Form_Handler.prototype.validate_account_data = function () {
				let account_number, errors, routing_number;
				if ( this.saved_payment_method_selected ) {
					return true;
				}
				errors = [];
				routing_number = this.payment_fields
					.find(
						'.js-sv-wc-payment-gateway-echeck-form-routing-number'
					)
					.val();
				account_number = this.payment_fields
					.find(
						'.js-sv-wc-payment-gateway-echeck-form-account-number'
					)
					.val();
				if ( ! routing_number ) {
					errors.push( this.params.routing_number_missing );
				} else {
					if ( routing_number.length !== 9 ) {
						errors.push(
							this.params.routing_number_length_invalid
						);
					}
					if ( /\D/.test( routing_number ) ) {
						errors.push(
							this.params.routing_number_digits_invalid
						);
					}
				}
				if ( ! account_number ) {
					errors.push( this.params.account_number_missing );
				} else {
					if (
						account_number.length < 3 ||
						account_number.length > 17
					) {
						errors.push(
							this.params.account_number_length_invalid
						);
					}
					if ( /\D/.test( account_number ) ) {
						errors.push( this.params.account_number_invalid );
					}
				}
				if ( errors.length > 0 ) {
					this.render_errors( errors );
					return false;
				}
				this.payment_fields
					.find(
						'.js-sv-wc-payment-gateway-echeck-form-account-number'
					)
					.val( account_number );
				return true;
			};

			Square_Payment_Form_Handler.prototype.render_errors = function (
				errors
			) {
				$( '.woocommerce-error, .woocommerce-message' ).remove();
				this.form.prepend(
					'<ul class="woocommerce-error"><li>' +
						errors.join( '</li><li>' ) +
						'</li></ul>'
				);
				this.form.removeClass( 'processing' ).unblock();
				this.form.find( '.input-text, select' ).blur();
				return $( 'html, body' ).animate(
					{
						scrollTop: this.form.offset().top - 100,
					},
					1000
				);
			};

			Square_Payment_Form_Handler.prototype.handle_saved_payment_methods = function () {
				let $csc_field,
					$new_payment_method_selection,
					csc_required,
					csc_required_for_tokens,
					id_dasherized;
				id_dasherized = this.id_dasherized;
				csc_required = this.csc_required;
				csc_required_for_tokens = this.csc_required_for_tokens;
				$new_payment_method_selection = $(
					'div.js-wc-' + id_dasherized + '-new-payment-method-form'
				);
				$csc_field = $new_payment_method_selection
					.find( '.js-sv-wc-payment-gateway-credit-card-form-csc' )
					.closest( '.form-row' );
				$( 'input.js-wc-' + this.id_dasherized + '-payment-token' )
					.change( function () {
						let tokenized_payment_method_selected;
						tokenized_payment_method_selected = $(
							'input.js-wc-' +
								id_dasherized +
								'-payment-token:checked'
						).val();
						if ( tokenized_payment_method_selected ) {
							$new_payment_method_selection.slideUp( 200 );
							if ( csc_required_for_tokens ) {
								$csc_field
									.removeClass( 'form-row-last' )
									.addClass( 'form-row-first' );
								return $new_payment_method_selection.after(
									$csc_field
								);
							}
						} else {
							$new_payment_method_selection.slideDown( 200 );
							if ( csc_required_for_tokens ) {
								$csc_field
									.removeClass( 'form-row-first' )
									.addClass( 'form-row-last' );
								return $new_payment_method_selection
									.find(
										'.js-sv-wc-payment-gateway-credit-card-form-expiry'
									)
									.closest( '.form-row' )
									.after( $csc_field );
							}
						}
					} )
					.change();
				$( 'input#createaccount' ).change( function () {
					let $parent_row;
					$parent_row = $(
						'input.js-wc-' +
							id_dasherized +
							'-tokenize-payment-method'
					).closest( 'p.form-row' );
					if ( $( this ).is( ':checked' ) ) {
						$parent_row.slideDown();
						return $parent_row.next().show();
					}
					$parent_row.hide();
					return $parent_row.next().hide();
				} );
				if ( ! $( 'input#createaccount' ).is( ':checked' ) ) {
					return $( 'input#createaccount' ).change();
				}
			};

			Square_Payment_Form_Handler.prototype.handle_sample_check_hint = function () {
				let $sample_check;
				$sample_check = this.payment_fields.find(
					'.js-sv-wc-payment-gateway-echeck-form-sample-check'
				);
				if ( $sample_check.is( ':visible' ) ) {
					return $sample_check.slideUp();
				}
				return $sample_check.slideDown();
			};

			Square_Payment_Form_Handler.prototype.block_ui = function () {
				return this.form.block( {
					message: null,
					overlayCSS: {
						background: '#fff',
						opacity: 0.6,
					},
				} );
			};

			Square_Payment_Form_Handler.prototype.unblock_ui = function () {
				return this.form.unblock();
			};

			return Square_Payment_Form_Handler;
		} )() );
	} );
}.call( this ) );

//# sourceMappingURL=sv-wc-payment-gateway-payment-form.min.js.map
