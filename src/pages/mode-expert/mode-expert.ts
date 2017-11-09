import { crc } from './../../models/crc';
import { Component, OnInit  } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { File } from '@ionic-native/file';

declare const Buffer

@Component({
  selector: 'page-mode-expert',
  templateUrl: 'mode-expert.html',
})
export class ModeExpertPage  implements OnInit{
  output: string = "";  // output console
  stringToWrite = "";   // frame to write
  btName: string = "Mode Expert";
  btMac: string = "";
  frame_start: string = "FF01";
  frame_session: string = "0001";
  frame_end: string = "04";
  
  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private bluetoothSerial: BluetoothSerial, 
              private file: File,
              private utils: crc) {
        
        this.utils.CRCMaster.init();  //init CRC lib
        this.btName = this.navParams.get("btName"); 
        this.btMac = this.navParams.get("btMac");
        this.bluetoothSerial.clear(); // clear bluetooth buffer because it may contains connection response frame
  }
  
  ngOnInit(){

  }
  /**
   * Write data from input field to the bluetooth device
   */
  onWrite(){
    var frame = this.onBuildFrame(this.stringToWrite);
    
    this.bluetoothSerial.isConnected()
    .then(data => {
      this.bluetoothSerial.write(new Buffer(frame,"hex"))
      .then(data => {
        this.output += "\r\n\r\nTx : " + frame + "\r\n";  
        this.onRawData();
        setTimeout(function(){},1500);
      })
      .catch(error => {this.output += "\r\nWrite Error : " + JSON.stringify(error);});
    })
    .catch(error => {
      this.output += "\r\nBT disconnected";
    });    
  }

  /**
   * Build the complete frame with its SOH + CRC + Session number + Size + Payload + EOT
   * @param frame : frame's payload
   */
  onBuildFrame(frame){
    let full_frame = this.utils.calculateFrameSize(frame) + frame
    return this.frame_start + this.utils.CRCMaster.Calculate(full_frame,"hex") + this.frame_session + this.utils.calculateFrameSize(frame) + frame + this.frame_end;
  }

    /**
   * Subscribe to be notified when data is received.
   */
  onRawData(){
    this.output += "Rx : ";
    this.bluetoothSerial.subscribeRawData().subscribe(
      (data) => {
        var temp = new Uint8Array(data);
        for(let x=0; x < temp.length; x++){
          this.output += ("0" + parseInt(temp[x].toString(16),16).toString(16)).slice(-2).toUpperCase() + " "; 
        }            
        //this.bluetoothSerial.clear();
      },
      (error) => {
        this.output += "\r\nReception error : " + JSON.stringify(error) + "\r\n";
    });
  }

  /**
   * Read bluetooth response
   */
  onRead(){
    
    this.bluetoothSerial.isConnected()
    .then(data => {
      this.bluetoothSerial.read().then(data => {  
        this.output += "\r\n\r\nRead : " + this.ascii_to_hexa(data) + "\r\n";
        this.onLog("\r\nRx : " + this.ascii_to_hexa(data));
      },
      error =>{
        this.output += "\r\nRead Error : " + JSON.stringify(error);    
      });
      
    })
    .catch(error => {
      this.output += "\r\nBT disconnected";
    });
  }

  /**
   * Convert received data stream (ascii) to hexadecimal
   * @param str 
   */
  ascii_to_hexa(str)
  {
    var arr1 = [];
    for (var n = 0, l = str.length; n < l; n ++) 
    {
      var hex = ("0" + parseInt(str.charCodeAt(n).toString(16).match(/.{1,2}/g),16).toString(16)).slice(-2).toUpperCase();
      arr1.push(hex);
    }
    return arr1.join(' ');
  }

  /**
   * Send log trace by email
   * @param msg 
   */
  onLog(msg){
    this.file.checkDir(this.file.dataDirectory, 'log')
    .then(data => {

    })
    .catch(error => {
      this.file.createDir(this.file.dataDirectory,'log',false);
    });

    this.file.writeFile(this.file.dataDirectory+"/"+'log','log.txt',msg+'\r\n');
  }

  onClearFrame(){
    this.stringToWrite = "";
  }
  onCleanTrace(){
    this.output = "";
  }

}
