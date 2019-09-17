class iQOS {
    constructor() {
        this.connected = false;
        this.holderCharge = false;
        this.chargerCharge = false;
        this.deviceReady = false;
        this.device = null;
        this.servicesWeNeed = ["daebb240-b041-11e4-9e45-0002a5d5c51b"];
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
            optionalServices: this.servicesWeNeed
        }).then((device) => {
            console.log('[iQOS]', 'Connecting to GATT Server...');
            this.device = device;
            return device.gatt.connect();
        }).then((server) => {
            this.connected = true;
            console.log('[iQOS]', 'Getting Services...');
            return server.getPrimaryServices();
        }).then((services) => this.main(services)).catch(error => {
            console.log('[iQOS]', 'Argh! ' + error);
            this.connected = false;
        });
    }
    main(services) {
        let queue = Promise.resolve();
        services.forEach(service => {
            queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
                console.log('[iQOS]', '> Service: ' + service.uuid);
                characteristics.forEach(characteristic => {
                    ;
                    console.log(characteristic.uuid);
                    if (characteristic.uuid == "f8a54120-b041-11e4-9be7-0002a5d5c51b") {
                        console.log('[iQOS]', "characteristic of deviceStatus found");
                        characteristic.startNotifications().then(characteristic => {
                            characteristic.addEventListener(
                                'characteristicvaluechanged', (e) => this.handleUpdates(e, this)
                            );

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
        let holderCharge = new Uint8Array(value.target.value.buffer.slice(-1))[0];
        if (value.target.value.buffer.byteLength == 7) {
            iqos.holderCharge = holderCharge;
        } else {
            iqos.holderCharge = false;
        }
        console.log("[iQOS]", 'holderCharge', holderCharge);
    }
}
// export default iQOS;