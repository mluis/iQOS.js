class iQOS {
    constructor() {
        this.connected = false;
        this.holderCharge = false;
        this.chargerCharge = false;
        this.deviceReady = false;
        this.device = null;
        this.SerialNumber = null;
        this.characteristics = {
            batteryInformation: null,
            deviceStatus: null,
            SCPControlPoint: null
        }
        //this.deviceStatus = {};
    }
    bootstrap() {
        // Initialize the events...
        // Add an event listener
        document.addEventListener("deviceStatus", function (e) {
            console.log("[iQOS] Device Status:", e);
        });
        //this.deviceStatus = new CustomEvent("deviceStatus");

        // Start Working With Device:
        navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ["daebb240-b041-11e4-9e45-0002a5d5c51b"]
        }).then((device) => {
            console.log('[iQOS]', 'Connecting to GATT Server...');
            return device.gatt.connect();
        }).then((server) => {
            console.log('[iQOS]', 'Getting Services...');
            return server.getPrimaryServices();
        }).then((services) => this.main(services)).catch(error => {
            console.log('[iQOS]', 'Argh! ' + error);
        });
    }
    main(services) {
        this.connected = true;
        let queue = Promise.resolve();
        services.forEach(service => {
            queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
                console.log('[iQOS]', '> Service: ' + service.uuid);
                characteristics.forEach(characteristic => {
                    console.log('[iQOS]', '> Characteristic: ' + characteristic.uuid);
                    if (characteristic.uuid == "e16c6e20-b041-11e4-a4c3-0002a5d5c51b") {
                        console.log('[iQOS]', "characteristic of UUID_SCP_CONTROL_POINT found");
                        this.characteristics.SCPControlPoint = characteristic;
                    }
                    if (characteristic.uuid == "ecdfa4c0-b041-11e4-8b67-0002a5d5c51b") {
                        console.log('[iQOS]', "characteristic of UUID_DEVICE_STATUS found");
                        this.characteristics.deviceStatus = characteristic;
                    }
                    if (characteristic.uuid == "f8a54120-b041-11e4-9be7-0002a5d5c51b") {
                        console.log('[iQOS]', "characteristic of UUID_BATTERY_INFORMATION found");
                        characteristic.startNotifications().then(characteristic => {
                            characteristic.addEventListener(
                                'characteristicvaluechanged', (e) => this.handleUpdates(e, this)
                            );
                            this.characteristics.batteryInformation = characteristic;
                        }).catch(error => { console.error("[iQOS]", error); });
                    }
                    console.log("[iQOS]", "Reinsert holder to begin...");
                });
            }));
        });
        return queue;
    }
    handleUpdates(value, iqos) {
        iqos.deviceReady = true;
        iqos.rawStatus = value.target.value;
        window.rawStatus = value.target.value;
        const rawData = new Uint8Array(value.target.value.buffer);
        if (value.target.value.buffer.byteLength == 7) {
            iqos.holderCharge = rawData[6];
            iqos.chargerCharge = rawData[2];
        } else {
            iqos.holderCharge = false;
            iqos.chargerCharge = rawData[2];
        }
        console.log("[iQOS]", 'holderCharge', holderCharge);
    }
}
export default iQOS;