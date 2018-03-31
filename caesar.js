#!/usr/bin/env node
String.prototype.map = Array.prototype.map;

const fs = require('fs'),
events = require('events'),

ASCII = Symbol('ASCII'),
HEX = Symbol('HEX'),
falseReg = /^(false|null|""|''|0|off|no|[]|{}|``|)$/gi;

function Mix (baseClass, ...mixins) {
	class base extends baseClass {
		constructor (...args) {
			super(...args);
			mixins.forEach(mixin => {
				copyProps(this, (new mixin));
			});
		}
	} //base
	function copyProps(target, source) {
		Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source)).forEach(prop => {
			if (!prop.toString().match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
				Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
			}
		});
	} //copyProps
	mixins.forEach((mixin) => {
		copyProps(base.prototype, mixin.prototype);
		copyProps(base, mixin);
	});
	return base;
} //Mix

class Caesar extends Mix(events.EventEmitter, String, Array) {
	constructor(value, key = 0, file = false, wheel = Caesar.wheel, safe = Caesar.safe) {
		super();
		this.key = key;
		this._key = key;
		if (!(value instanceof Buffer)) {
			try {
				value = Buffer.from(value);
			} catch (e) {
				let err = new Error("'value' must be an array-like object.");
				err.code = 'ENOSUPPORT';
				this.emit('fail', err);
				process.emit('fail', err);
				throw err;
			}
		}
		this.value = value;
		this._value = value;
		this._file = file;
		this._ready = true;
		this.cipher();
		this._ready = !file;
		this.wheel = wheel;
		this.safe = safe;
		this.key = key;
		this._key = key;
	}
	cipher(key, value, wheel = this.wheel, safe = this.safe) {
		if (this._file && !this._ready) {
			let err = new Error("File not ready.");
			err.code = 'ENOTREADY';
			this.emit('fail', err);
			process.emit('fail', err);
			throw err;
		}
		if (value) {
			key, value = [value, key];
		}
		this.value = value = value || this.value;
		this.key += key = key !== undefined ? key : (this.key !== undefined ? this.key : 0) * 1;
		return this.value = Caesar.cipher(value, key, wheel, safe);
	}
	decipher(key, value, wheel = this.wheel, safe = this.safe) {
		if (this._file && !this._ready) {
			let err = new Error("File not ready.");
			err.code = 'ENOTREADY';
			this.emit('fail', err);
			process.emit('fail', err);
			throw err;
		}
		if (value) {
			key, value = [value, key];
		}
		this.value = value = value || this.value;
		this.key -= key = key !== undefined ? key : (this.key !== undefined ? this.key : 0) * 1;
		return this.value = Caesar.decipher(value, key, wheel, safe);
	}
	static cipher(value, key = 0, wheel = Caesar.wheel, safe = Caesar.safe) {
		if (!value || !key) {
			return value;
		}
		return (value = Buffer.from(value)).map((chunk, index, array) => {
			if (wheel === HEX) return chunk + key * 1;
			if (wheel === ASCII || (safe && wheel.indexOf(chunk) < 0) || (wheel.length == 1 && wheel[0] == chunk)) return Buffer.from(String.fromCharCode(array.toString().charCodeAt(index) + key * 1))[0];
			if (wheel.indexOf(chunk) >= 0) return wheel[wheel.indexOf(chunk) + key * 1];
			return chunk;
		});
	}
	static decipher(value, key = 0, wheel = Caesar.wheel, safe = Caesar.safe) {
		if (!value || !key) {
			return value;
		}
		return (value = Buffer.from(value)).map((chunk, index, array) => {
			if (wheel === HEX) return chunk - key;
			if (wheel === ASCII || (safe && wheel.indexOf(chunk) < 0) || (wheel.length == 1 && wheel[0] == chunk)) return Buffer.from(String.fromCharCode(array.toString().charCodeAt(index) - key))[0];
			if (wheel.indexOf(chunk) >= 0) return wheel[wheel.indexOf(chunk) - key];
			return chunk;
		});
	}
	static fromFile(path, key = this.key) {
		var cae = new Caesar(path, key, path);
		if (!path) {
			let err = new Error("'path' is a required argument.");
			err.code = 'ENOPATH';
			cae.emit('fail', err);
			process.emit('fail', err);
			throw err;
		}
		fs.readFile(path, (err, data) => {
			if (!err) {
				cae._ready = true;
				cae._value = cae.value = data;
				cae.emit('ready', cae, data);
			} else {
				let err = new Error('Reading file failed.');
				err.code = 'EREADFAIL';
				cae.emit('fail', err);
				process.emit('fail', err);
				throw err;
			}
		});
		return cae;
	}
	toFile(path = this._file) {
		if (!path || !this._ready) {
			let err = new Error('Writing file failed.');
			err.code = 'EWRITEFAIL';
			cae.emit('fail', err);
			process.emit('fail', err);
			throw err;
		}
		fs.writeFile(path, this.value, data => this.emit('saved', data));
		return this;
	}
	toString() {
		return this.value.toString();
	}
	get buffer() {
		return this.value;
	}
	get [Symbol.toStringTag]() {
		return 'Caesar';
	}
	[Symbol.hasInstance](instance) {
		return instance instanceof Array || instance instanceof String;
	}
	[Symbol.toPrimitive](hint) {
		if (hint == 'number' && /^[0-9]+$/.test(this.toString())) {
			return this.toString() * 1;
		}
		return this.toString() + '';
	}
	static get [Symbol.species]() {
		return String;
	}
} //Caesar
var temp = ASCII;
if (process.env.wheel || process.argv[5]) {
	temp = /^HEXA?(DECIMAL)?/i.test(process.env.wheel || process.argv[5]) ? HEX : process.env.wheel || process.argv[5];
}
const wheel = Caesar.wheel = temp,
safe = Caesar.safe = !falseReg.test(process.env.safe || !!process.argv[6] || false);
Caesar.ASCII = ASCII, Caesar.HEX = HEX;

if (require.main !== module) {
	module.exports = Caesar;
} else {
	const key = process.env.key || process.argv[3] || 1,
	file = process.env.file || process.argv[2],
	mode = process.env.mode || process.argv[4] || "Cipher";
	if (key === undefined || file === undefined) {
		throw `'${key === undefined ? 'key' : 'file'}' is a required parameter.`;
	} else if (/^c(iph|ipher)?/i.test(mode)) {
		Caesar.fromFile(file).once('ready', (cae, data) => {
			cae.cipher(key);
			cae.toFile().once('saved', () => console.info(`File ${file} Ciphered with key : ${key}`));
		});
	} else if (/^de?c?(iph|ipher)?/i.test(mode)) {
		Caesar.fromFile(file).once('ready', (cae, data) => {
			cae.decipher(key);
			cae.toFile().once('saved', () => console.info(`File ${file} Deciphered with key : ${key}`));
		});
	} else {
		let err = new Error("Illegal 'mode' passed.");
		err.code = 'EILLMODE';
		process.emit('fail', err);
		throw err;
	}
}
