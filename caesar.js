#!/usr/bin/env node
String.prototype.toString = Array.prototype.toString;
// some platforms need polyfill!

const fs = require('fs'),
events = require('events'),

ASCII = Symbol('ASCII'),
falseReg = /^(false|null|""|''|0|off|no|[]|{}|``|)$/gi;

class Caesar extends events.EventEmitter {
	constructor(value, key, file = false, wheel = Caesar.wheel, safe = Caesar.safe) {
		super();
		this.key = key;
		this._key = key;
		this.value = value;
		this._value = value;
		this._file = file;
		this._ready = !file;
		this.wheel = wheel;
		this.safe = safe;
	}
	cipher(key, value, wheel = this.wheel, safe = this.safe) {
		if (this._file && !this._ready) {
			let err = new Error("File not ready.");
			err.code = 'ENOTREADY';
			this.emit('fail', err);
			emit('fail', err);
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
			emit('fail', err);
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
		if (!(value instanceof Array)) {
			return value.toString().split("").map(chunk => {
				if (wheel === ASCII || (safe && wheel.indexOf(chunk) < 0) || (wheel.length == 1 && wheel[0] == chunk)) return String.fromCharCode(chunk.charCodeAt(0) + key * 1);
				if (wheel.indexOf(chunk) >= 0) return wheel[wheel.indexOf(chunk) + key * 1];
				return chunk;
			}).join("");
		} else {
			return value.map(chunk => {
				if (wheel === ASCII || (safe && wheel.indexOf(chunk) < 0) || (wheel.length == 1 && wheel[0] == chunk)) return String.fromCharCode(chunk.charCodeAt(0) + key * 1);
				if (wheel.indexOf(chunk) >= 0) return wheel[wheel.indexOf(chunk) + key * 1];
				return chunk;
			});
		}
	}
	static decipher(value, key = 0, wheel = Caesar.wheel, safe = Caesar.safe) {
		if (!value || !key) {
			return value;
		}
		if (!(value instanceof Array)) {
			return value.toString().split("").map(chunk => {
				if (wheel === ASCII || (safe && wheel.indexOf(chunk) < 0) || (wheel.length == 1 && wheel[0] == chunk)) return String.fromCharCode(chunk.charCodeAt(0) - key);
				if (wheel.indexOf(chunk) >= 0) return wheel[wheel.indexOf(chunk) - key ];
				return chunk;
			}).join("");
		} else {
			return value.map(chunk => {
				if (wheel === ASCII || (safe && wheel.indexOf(chunk) < 0) || (wheel.length == 1 && wheel[0] == chunk)) return String.fromCharCode(chunk.charCodeAt(0) - key);
				if (wheel.indexOf(chunk) >= 0) return wheel[wheel.indexOf(chunk) - key];
				return chunk;
			});
		}
	}
	static fromFile(path, key = this.key) {
		var cae = new Caesar(undefined, key, true);
		if (!path) {
			let err = new Error("'path' is a required argument.");
			err.code = 'ENOPATH';
			cae.emit('fail', err);
			emit('fail', err);
			throw err;
		}
		cae._file = path;
		cae.save = function(path = cae._file) {
			fs.writeFile(path, this.value, data => this.emit('saved', data));
			return cae;
		};
		fs.readFile(path, (err, data) => {
			if (!err) {
				cae._ready = true;
				cae._value = cae.value = data;
				cae.emit('ready', cae, data);
			} else {
				let err = new Error('Reading file failed.');
				err.code = 'EREADFAIL';
				cae.emit('fail', err);
				emit('fail', err);
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
			emit('fail', err);
			throw err;
		}
		fs.writeFile(path, this.value, data => this.emit('saved', data));
		return this;
	}
} //Caesar
const wheel = Caesar.wheel = process.env.wheel || process.argv[5] || ASCII,
safe = Caesar.safe = !falseReg.test(process.env.safe || !!process.argv[6] || false);

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
			cae.save().once('saved', () => console.info(`File ${file} Ciphered with key : ${key}`));
		});
	} else if (/^de?c?(iph|ipher)?/i.test(mode)) {
		Caesar.fromFile(file).once('ready', (cae, data) => {
			cae.decipher(key);
			cae.save().once('saved', () => console.info(`File ${file} Deciphered with key : ${key}`));
		});
	} else {
		let err = new Error("Illegal 'mode' passed.");
		err.code = 'EILLMODE';
		emit('fail', err);
		throw err;
	}
}
