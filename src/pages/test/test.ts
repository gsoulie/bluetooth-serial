import { crc } from './../../models/crc';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-test',
  templateUrl: 'test.html',
})
export class TestPage {
  
  
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private utils: crc) {
    
    this.utils.CRCMaster.init();
    var res = this.utils.CRCMaster.Calculate("060102021404","hex");
    console.log("RES = " + res.crccittxmodem);
    
    //CRCMaster.Calculate("060102021404","hex")
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TestPage');
  }

}
