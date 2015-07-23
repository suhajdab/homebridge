var types = require( "../lib/HAP-NodeJS/accessories/types.js" );
var request = require( 'request' );

/*
 * TODO: color: purple
 */

function LifxAccessory( log, config ) {
	this.log = log;

	// auth info
	this.token = config["token"];

	this.baseUrl = 'https://api.lifx.com/v1beta1/lights/';

	// device info
	this.name = config["name"];
	this.id = config["id"];
	this.selector = 'id:' + this.id;
	this.state = {};

	request = request.defaults({
		headers: {
			"Authorization": "Bearer " + this.token
		}
	});

	//this.log( "Searching for Lifx device with exact name '" + this.name + "'..." );
	this.getLamp( function ( err, resp, body ) {
		console.log( this.name + ' init');
		console.log(body );
	}.bind( this ));
}

LifxAccessory.prototype = {

	getLamp: function( callback ) {

		var url = this.baseUrl + this.selector;
		this.log( url );
		request({
			"method": "GET",
			"uri"    : url
		}, callback );
	},

	setLamp: function( mode, state, callback ) {
		var that = this;

		//{ color: "brightness:" + this.brightness + "%", selector: lampSelector});
		var url = this.baseUrl + this.selector + '/' + mode;

		request({
			method: "PUT",
			uri: url,
			form: state
		}, callback );
		that.log( JSON.stringify({ url:url, state: state }));
	},

	setPowerState: function( powerOn ) {
		//if ( !this.device ) {
		//	this.log( "No '" + this.name + "' device found (yet?)" );
		//	return;
		//}

		var that = this;

		if ( powerOn ) {

			this.setLamp( 'power', {state: 'on'}, function( response ) {
				that.log(response);
				if ( response === undefined ) {
					that.log( "Error setting power state on the '" + that.name + "'" )
				} else {
					that.log( "Successfully set power state on the '" + that.name + "' to on" );
				}
			} );
		} else {
			this.log( "Setting power state on the '" + this.name + "' to off" );
			this.setLamp( 'power', {state: 'off'}, function( response ) {
				that.log(response);
				if ( response === undefined ) {
					that.log( "Error setting power state on the '" + that.name + "'" )
				} else {
					that.log( "Successfully set power state on the '" + that.name + "' to off" );
				}
			} );
		}

	},

	setBrightness: function( level ) {
//		if ( !this.device ) {
//			this.log( "No '" + this.name + "' device found (yet?)" );
//			return;
//		}

		var that = this;

		this.log( "Setting brightness on the '" + this.name + "' to " + level );
		this.setLamp( 'color', {
			color: "brightness:" + level + "%",
			selector: this.selector
		}, function( response ) {
			that.log( response );
			if ( response === undefined ) {
				that.log( "Error setting brightness on the '" + that.name + "'" )
			} else {
				that.log( "Successfully set brightness on the '" + that.name + "' to " + level );
			}
		});
	},

	getServices: function() {
		var that = this;
		return [{
			sType          : types.ACCESSORY_INFORMATION_STYPE,
			characteristics: [{
				cType            : types.NAME_CTYPE,
				onUpdate         : null,
				perms            : ["pr"],
				format           : "string",
				initialValue     : this.name,
				supportEvents    : false,
				supportBonjour   : false,
				manfDescription  : "Name of the accessory",
				designedMaxLength: 255
			}, {
				cType            : types.MANUFACTURER_CTYPE,
				onUpdate         : null,
				perms            : ["pr"],
				format           : "string",
				initialValue     : "Lifx",
				supportEvents    : false,
				supportBonjour   : false,
				manfDescription  : "Manufacturer",
				designedMaxLength: 255
			}, {
				cType            : types.MODEL_CTYPE,
				onUpdate         : null,
				perms            : ["pr"],
				format           : "string",
				initialValue     : "Rev-1",
				supportEvents    : false,
				supportBonjour   : false,
				manfDescription  : "Model",
				designedMaxLength: 255
			}, {
				cType            : types.SERIAL_NUMBER_CTYPE,
				onUpdate         : null,
				perms            : ["pr"],
				format           : "string",
				initialValue     : "A1S2NASF88EW",
				supportEvents    : false,
				supportBonjour   : false,
				manfDescription  : "SN",
				designedMaxLength: 255
			}, {
				cType            : types.IDENTIFY_CTYPE,
				onUpdate         : null,
				perms            : ["pw"],
				format           : "bool",
				initialValue     : false,
				supportEvents    : false,
				supportBonjour   : false,
				manfDescription  : "Identify Accessory",
				designedMaxLength: 1
			}]
		}, {
			sType          : types.LIGHTBULB_STYPE,
			characteristics: [{
				cType            : types.NAME_CTYPE,
				onUpdate         : null,
				perms            : ["pr"],
				format           : "string",
				initialValue     : this.name,
				supportEvents    : true,
				supportBonjour   : false,
				manfDescription  : "Name of service",
				designedMaxLength: 255
			}, {
				cType            : types.POWER_STATE_CTYPE,
				onUpdate         : function( value ) {
					that.setPowerState( value );
				},
				perms            : ["pw", "pr", "ev"],
				format           : "bool",
				initialValue     : 0,
				supportEvents    : true,
				supportBonjour   : false,
				manfDescription  : "Change the power state of the Bulb",
				designedMaxLength: 1
			}, {
				cType           : types.BRIGHTNESS_CTYPE,
				onUpdate        : function( value ) {
					that.setBrightness( value );
				},
				perms           : ["pw", "pr", "ev"],
				format          : "int",
				initialValue    : 0,
				supportEvents   : true,
				supportBonjour  : false,
				manfDescription : "Adjust Brightness of Light",
				designedMinValue: 0,
				designedMaxValue: 100,
				designedMinStep : 1,
				unit            : "%"
			}]
		}];
	}
};

module.exports.accessory = LifxAccessory;
