# iQOS.js
an iQOS library written in JavaScript to talk with iQOS over BLE.

## How to Use
* You will need to install this library:
	* __yarn__: ` yarn add @0x77/iqos `
	* __npm__: ` npm i -S @0x77/iqos `
* Then you need to _import_ and _bootstrap_ it:
```javascript
// Import the library:
import iQOS from '@0x77/iqos';
const iqos = new iQOS();
// Then bootstrap:
iqos.bootstrap();
// You will receive a prompt to select iQOS device.
```
* Get the _charge status_:
```javascript
// Imagine that Holder not inside Chrager:
console.log(iqos.holderCharge);
// Will return -> false -> because its not inside Charger
/*
 If it will be inside Charger 
 it will be non false and 0 or 100
*/
console.log(iqos.chargerCharge);
// It will return the percentage of Charger Charge.
```