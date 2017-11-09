import { ModeExpertPage } from './../mode-expert/mode-expert';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { File } from '@ionic-native/file';
import { LoadingController } from 'ionic-angular';

declare const Buffer

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  macAddress: string = "98:D3:31:30:25:EF";
  guid: string = "e0cbf06c-cd8b-4647-bb8a-263b43f0f974";
  devices: any[] = [];  // bounded bluetooth devices's list
  blueReadConnected: boolean = false;
  btEnabled: boolean = false; // bluetooth enabling 
  btName: string = "";
  btMac: string = "";

  constructor(public navCtrl: NavController,
              private bluetoothSerial: BluetoothSerial,
              private file: File,
              private loadingCtrl: LoadingController) {
        
        // Check if bluetooth is enabled on smartphone
        this.bluetoothSerial.isEnabled()
        .then(data => {
          // yes : start scanning for bluetooth devices
          this.btEnabled = true;
          this.onScan();
        })
        .catch(err => {
          this.btEnabled = false;
        });
  }

  /**
   * Scan for bounded devices and just displaying devices which name contains "BLUE-READ"
   */
  onScan(refresher = null){
    this.devices = [];
    this.bluetoothSerial.list()
    .then(data => {
      for(let i = 0; i<data.length; i++){
        if(data[i].name.toUpperCase().indexOf("BLUE-READ") >= 0){
          this.devices.push(data[i]);
        }
      }
      if(refresher){refresher.complete();}
    })
    .catch(error => {
      alert(JSON.stringify(error));
      this.devices = [];
    })
  }

  /**
   * Enabling bluetooth
   */
  onEnableBluetooth(){
    this.bluetoothSerial.enable().then(data => {
      this.bluetoothSerial.isEnabled()
      .then(data => {
        this.btEnabled = data == "OK" ? true : false;
      });
    });
  }

  onOpenModeExpert(){
    this.navCtrl.push(ModeExpertPage,{btName:this.btName, btMac: this.btMac});
  }

  /**
   * Connect to bluetooth device
   * @param btObject : mac address of the device
   */
  onConnect(btObject){
    var loader = this.loadingCtrl.create({
      content: "Connecting " + btObject.name + "...",
      dismissOnPageChange: true
    });

    this.bluetoothSerial.isEnabled()
    .then(data => {
      this.btEnabled = true;
      this.macAddress = btObject.address.toUpperCase();
      loader.present();

      // Connection
      this.bluetoothSerial.connect(this.macAddress)
      .subscribe(
        (data) => {
          this.bluetoothSerial.isConnected()
          .then(data => {
            this.blueReadConnected = true;
            this.btName = btObject.name;
            this.btMac = btObject.address;

            loader.onDidDismiss(() => {
              this.navCtrl.push(ModeExpertPage,{btName:btObject.name, btMac: btObject.address})
            });
            loader.dismiss();
          })
          .catch(error => {
            loader.dismiss();
            alert("\r\nBlueRead disconnected\r\n");
            this.blueReadConnected = false;
          });
      },
      (error) => {
        alert("\r\nConnection status : " + JSON.stringify(error));
        loader.dismiss();
      });
        // Tiemout function to refresh connexion status
        setTimeout(function(){
        },4500);
    })
    .catch(err => {
      this.btEnabled = false;
      loader.dismiss();
    });    
  }

  onConnectMac(mac){
    this.bluetoothSerial.isEnabled()
    .then(data => {
      
      this.btEnabled = true;
      this.macAddress = mac.toUpperCase();
      
      // Connection
      this.bluetoothSerial.connect(this.macAddress)
      .subscribe(
        (data) => {
          this.btName = mac;
          this.btMac = mac;
          this.bluetoothSerial.isConnected()
          .then(data => {
            this.blueReadConnected = true;
          })
          .catch(error => {
            alert("\r\nBlueRead disconnected\r\n");
            this.blueReadConnected = false;
          });
      },
      (error) => {
        alert("\r\nConnection status : " + JSON.stringify(error));
      });
  
      // Tiemout function to refresh connexion status
      setTimeout(function(){
      },3500);
    })
    .catch(err => {
      this.btEnabled = false;
    });    
  }


  /**
   * Disconnect bluetooth device
   */
  onDisconnect(){
    this.bluetoothSerial.disconnect()
    .then((data) => {
      this.blueReadConnected = false;
    })
    .catch((error) => {
      alert("\r\nError Disconnect : " + JSON.stringify(error));
    });
  }

  /**
   * Return true if the bluetooth device is connected
   */
  isConnected(){
    var res = false;
    this.bluetoothSerial.isConnected()
    .then(data => {
      alert("Blue-Read connected");
      this.blueReadConnected = true;
      res = true;
    })
    .catch(error => {
      alert("Blue-Read disconnected");
      this.blueReadConnected = false;
    });

    return res;
  }

  ionViewWillLeave(){
    //if(this.blueReadConnected){this.onDisconnect();}
  }
}
