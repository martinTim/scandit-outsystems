import { Component, ViewChild, NgZone } from '@angular/core';
import { Content, Events, NavController } from 'ionic-angular';

import { Enums } from '../../providers/enums';
import { IbanValidator } from '../../providers/iban-validator';
import { Scanner } from '../../providers/scanner';
import { ScannerSettings } from '../../providers/scanner-settings';
import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})
export class ScanPage {
  @ViewChild(Content) content: Content;

  public scannerPlaceholderHeight = '200px';
  public scanSession: any;

  private onScanHandler: Function;
  private onStateChangeHandler: Function;
  private onPropertyChangeHandler: Function;

  constructor(
    private ngZone: NgZone,
    private nav: NavController,
    private events: Events,
    private scanner: Scanner,
    private scannerSettings: ScannerSettings,
    private Enums: Enums,
  ) {
    this.onScanHandler = (session) => {
      this.handleScan(session);
    }

    this.onStateChangeHandler = (state) => {
      this.handleStateChange(state);
    }

    this.onPropertyChangeHandler = (property, newValue) => {
      this.handlePropertyChange(property, newValue);
    }
  }

  public get scanResult(): string {
    const noScansText = 'nothing recognized yet';
    if (this.scanSession && this.scanSession.text) {
      let scanResult = this.scanSession.text.trim();
      const isRejected = this.scanSession.rejected;
      return isRejected ? `rejected (${scanResult})` : scanResult;
    } else if (this.scanSession && this.scanSession.newlyRecognizedCodes) {
      const barcodes = this.scanSession.newlyRecognizedCodes.map(barcode => barcode.data);
      return barcodes.join(', ');
    } else {
      return noScansText;
    }
  }

  public ionViewWillEnter(): void {
    console.log('scan willEnter');
    this.subscribe();
  }

  public ionViewDidEnter(): void {
    console.log('scan didEnter');
    this.startScanner();
  }

  public ionViewWillLeave(): void {
    console.log('scan willLeave');
    this.scanner.stop();
    this.unsubscribe();
  }

  public openSettings(): void {
    this.nav.push(SettingsPage)
  }

  private subscribe(): void {
    this.events.subscribe(this.scanner.event.scan, this.onScanHandler);
    this.events.subscribe(this.scanner.event.stateChange, this.onStateChangeHandler);
    this.events.subscribe(this.scanner.event.didChangeProperty, this.onPropertyChangeHandler);
  }

  private unsubscribe(): void {
    this.events.unsubscribe(this.scanner.event.scan, this.onScanHandler);
    this.events.unsubscribe(this.scanner.event.stateChange, this.onStateChangeHandler);
    this.events.unsubscribe(this.scanner.event.didChangeProperty, this.onPropertyChangeHandler);
  }

  private startScanner(): void {
    this.setScannerConstraints();
    this.scanner.start();
    this.scanner.resume();
    this.scanSession = undefined;
  }

  private setScannerConstraints(): void {
    const top = this.content.contentTop;
    if (top === undefined) {
      setTimeout(this.setScannerConstraints.bind(this), 500);
    }

    const topConstraint = top || 0;
    const rightConstraint = 0;
    const bottomConstraint = '20%';
    const leftConstraint = 0;

    this.scannerPlaceholderHeight = `calc(80vh - ${top}px)`;

    this.scanner.setConstraints(topConstraint, rightConstraint, bottomConstraint, leftConstraint);
  }

  private handleScan(session): void {
    console.log(session);
    if (this.scannerSettings.scanningMode === this.Enums.ScanningMode.iban && session && session.text) {
      const isIbanValid = IbanValidator.validate(session.text)
      session.rejected = !isIbanValid;
    }
    this.ngZone.run(() => {
      this.scanSession = session;
    });
  }

  private handleStateChange(state): void {
    console.log(this.Enums.ScannerState[state]);
  }

  private handlePropertyChange(property, newValue): void {
    console.log(property, newValue);
  }
}
