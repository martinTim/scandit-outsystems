import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import { ScannerSettings } from './scanner-settings';

import { Enums } from './enums';

@Injectable()
export class Scanner {
  public event: {
    scan: string,
    stateChange: string,
    didChangeProperty: string,
  };

  public state;
  public picker: BarcodePicker;

  public portraitConstraints: Constraints;
  public landscapeConstraints: Constraints;

  constructor(
    private events: Events,
    private settings: ScannerSettings,
    private Enums: Enums,
  ) {
    this.event = {
      scan: 'scanner:scan',
      stateChange: 'scanner:stateChange',
      didChangeProperty: 'scanner:didChangeProperty',
    };

    this.events.subscribe(this.settings.event.settingsChanged, (newScanSettings: ScanSettings, newUiSettings: UiSettings) => {
      if (this.picker) {
        this.applyScanSettings(newScanSettings);
        this.applyUiSettings(newUiSettings, this.picker.getOverlayView());
      }
    });

    this.setAppKey();

    this.createNewPicker();
  }

  public start(): void {
    if (this.isFullscreen()) {
      this.createNewPicker();
    }

    if (this.isStopped()) {
      this.show();
    }

    this.startScanning();
  }

  public pause(): void {
    console.log('picker.pauseScanning');
    this.picker.pauseScanning();
  }

  public resume(): void {
    console.log('picker.resumeScanning');
    this.picker.resumeScanning();
  }

  public stop(): void {
    if (!this.isStopped()) {
      console.log('picker.cancel');
      this.picker.cancel();
    }
  }

  public startScanning(): void {
    console.log('picker.startScanning');
    this.picker.startScanning();
  }

  public isStopped(): boolean {
    return this.state === this.Enums.ScannerState.stopped;
  }

  public setConstraints(top: Constraint, right: Constraint, bottom: Constraint, left: Constraint, animationDuration: number = 0): void {
    this.setPortraitConstraints(top, right, bottom, left, animationDuration);
    this.setLandscapeConstraints(top, right, bottom, left, animationDuration);
  }

  public setPortraitConstraints(top: Constraint, right: Constraint, bottom: Constraint, left: Constraint, animationDuration: number = 0): void {
    const newConstraints = new Scandit.Constraints();
    newConstraints.topMargin = top;
    newConstraints.rightMargin = right;
    newConstraints.bottomMargin = bottom;
    newConstraints.leftMargin = left;

    if (
      !this.portraitConstraints ||
      newConstraints.topMargin !== this.portraitConstraints.topMargin ||
      newConstraints.rightMargin !== this.portraitConstraints.rightMargin ||
      newConstraints.bottomMargin !== this.portraitConstraints.bottomMargin ||
      newConstraints.leftMargin !== this.portraitConstraints.leftMargin
    ) {
      this.portraitConstraints = newConstraints;
      this.applyConstraints(animationDuration);
    }
  }

  public setLandscapeConstraints(top: Constraint, right: Constraint, bottom: Constraint, left: Constraint, animationDuration: number = 0): void {
    const newConstraints = new Scandit.Constraints();
    newConstraints.topMargin = top;
    newConstraints.rightMargin = right;
    newConstraints.bottomMargin = bottom;
    newConstraints.leftMargin = left;

    if (
      !this.landscapeConstraints ||
      newConstraints.topMargin !== this.landscapeConstraints.topMargin ||
      newConstraints.rightMargin !== this.landscapeConstraints.rightMargin ||
      newConstraints.bottomMargin !== this.landscapeConstraints.bottomMargin ||
      newConstraints.leftMargin !== this.landscapeConstraints.leftMargin
    ) {
      this.landscapeConstraints = newConstraints;
      this.applyConstraints(animationDuration);
    }
  }

  private createNewPicker(): void {
    this.picker = new Scandit.BarcodePicker(this.settings.getScanSettings());
    this.picker.continuousMode = true;
    this.state = this.Enums.ScannerState.stopped;
  }

  private show(): void {
    this.applyUiSettings(this.settings.getUiSettings(), this.picker.getOverlayView());
    this.picker.show({
      didScan: this.onScan.bind(this),
      didRecognizeText: this.onScan.bind(this),
      didChangeState: this.onStateChange.bind(this),
      didChangeProperty: this.onDidChangeProperty.bind(this),
      didCancel: this.onCancel.bind(this),
      didManualSearch: this.onManualInput.bind(this),
    });
  }

  private applyScanSettings(newScanSettings: ScanSettings): void {
    this.picker.applyScanSettings(newScanSettings);
  }

  private applyUiSettings(uiSettings: UiSettings, overlay): void {
    overlay.setBeepEnabled(uiSettings.feedback.beep);
    overlay.setVibrateEnabled(uiSettings.feedback.vibrate);

    overlay.showSearchBar(uiSettings.searchBar);
    if (uiSettings.searchBar) {
      overlay.setSearchBarPlaceholderText('Manual barcode entry');
    }

    overlay.setTorchEnabled(uiSettings.torch.enabled);
    overlay.setTorchButtonMarginsAndSize(
      uiSettings.torch.offset.left,
      uiSettings.torch.offset.top,
      40,
      40,
    );

    overlay.setCameraSwitchVisibility(uiSettings.cameraSwitch.visibility);
    overlay.setCameraSwitchButtonMarginsAndSize(
      uiSettings.cameraSwitch.offset.right,
      uiSettings.cameraSwitch.offset.top,
      40,
      40,
    );

    overlay.setTextRecognitionSwitchVisible(uiSettings.textRecognitionSwitch.visible);

    overlay.setGuiStyle(uiSettings.viewfinder.style);
    overlay.setViewfinderDimension(
      uiSettings.viewfinder.portrait.width,
      uiSettings.viewfinder.portrait.height,
      uiSettings.viewfinder.landscape.width,
      uiSettings.viewfinder.landscape.height,
    );
  }

  private onScan(session): void {
    this.events.publish(this.event.scan, session);
  }

  private onManualInput(content): void {
    console.log(content);
  }

  private onCancel(error): void {
    // console.log(error);
  }

  private onStateChange(state): void {
    this.changeState(state);
  }

  private onDidChangeProperty(property, newValue): void {
    this.didChangeProperty(property, newValue);
  }

  private changeState(state): void {
    this.state = state;
    this.events.publish(this.event.stateChange, state);
  }

  private didChangeProperty(property, newValue): void {
    if (property === 'recognitionMode') {
      if (newValue === 1 || newValue === Scandit.ScanSettings.RecognitionMode.TEXT) {
        this.settings.setRecognitionMode(Scandit.ScanSettings.RecognitionMode.TEXT);
        this.settings.setViewfinderSize({ width: 0.9, height: 0.1 }, { width: 0.6, height: 0.2 });
      } else if (newValue === 2 || newValue === Scandit.ScanSettings.RecognitionMode.CODE) {
        this.settings.setRecognitionMode(Scandit.ScanSettings.RecognitionMode.CODE);
        this.settings.setViewfinderSize({ width: 0.9, height: 0.2 }, { width: 0.6, height: 0.4 });
      }
      this.events.publish(this.event.didChangeProperty, property, newValue);
    }
  }

  private applyConstraints(animationDuration: number = 0): void {
    this.picker.setConstraints(this.portraitConstraints, this.landscapeConstraints, animationDuration);
  }

  private isFullscreen(): boolean {
    return (!this.portraitConstraints && !this.landscapeConstraints)
      || ((this.portraitConstraints.topMargin === 0 || this.portraitConstraints.topMargin === '0%')
        && (this.portraitConstraints.rightMargin === 0 || this.portraitConstraints.rightMargin === '0%')
        && (this.portraitConstraints.leftMargin === 0 || this.portraitConstraints.leftMargin === '0%')
        && (this.portraitConstraints.bottomMargin === 0 || this.portraitConstraints.bottomMargin === '0%')
        && (this.landscapeConstraints.topMargin === 0 || this.landscapeConstraints.topMargin === '0%')
        && (this.landscapeConstraints.rightMargin === 0 || this.landscapeConstraints.rightMargin === '0%')
        && (this.landscapeConstraints.leftMargin === 0 || this.landscapeConstraints.leftMargin === '0%')
        && (this.landscapeConstraints.bottomMargin === 0 || this.landscapeConstraints.bottomMargin === '0%'));
  }

  private setAppKey(): void {
    Scandit.License.setAppKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");
  }
}
