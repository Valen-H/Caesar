# Caesar  
  
***Caesar*** is a file encryptor tool inspired by the Caesar-Cipher wheel.  
  
## How it works  
  It simply shifts characters by `key`.  
  e.g: `value : test, key : 1 => value : uftu, key : 1`  
  
***  
  
### Usage  
 * Terminal : `mode=cipher|decipher key=1 file=... safe=false wheel=ASCII|HEX|"abcd..." npm start` where `safe` is a boolean which controls whether character that does not belong to the `wheel` passed will be encrypted by the default wheel [Symbol('ASCII')]. `wheel` is a string containing all encryption characters in row, characters that do not appear in there **will not** be encrypted if `safe` is 'false'. Other formats : `file=... npm run cipher file.txt`, `npm run start file key mode wheel safe`.  
 * Binary : run `npm test` to install module globally and get access to `cc file` command which is the same as 'Terminal Run'.  
 * Module : the *Caesar* class contains the following : 3 static methods : `cipher(value, key[, wheel, safe]), decipher(value, key[, wheel, safe]), fromFile(path) //<- returns a Caesar object that emits 'ready' and 'saved' events on itself`. Instances have the following methods : `cipher(key), cipher(value, key[, wheel, safe]), decipher(key), decipher(value, key[, wheel, safe]), toFile([path]) //<- specifying 'path' is not necessary for objects created with fromFile method.`  
> Note that if you try to use instance operations on fromFile objects before they load ('ready'), they emit a 'fail' event on themselves and the `global`