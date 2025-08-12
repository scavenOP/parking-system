import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DatePickerService {

  constructor(private alertController: AlertController) {}

  async openDatePicker(options: {
    header: string;
    value?: string;
    min?: string;
    max?: string;
  }): Promise<string | null> {
    const alert = await this.alertController.create({
      header: options.header,
      inputs: [
        {
          name: 'date',
          type: 'date',
          value: options.value,
          min: options.min,
          max: options.max
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Select',
          handler: (data) => data.date
        }
      ]
    });
    
    await alert.present();
    const result = await alert.onDidDismiss();
    return result.data?.values?.date || null;
  }

  async openDateTimePicker(options: {
    header: string;
    value?: string;
    min?: string;
    max?: string;
  }): Promise<string | null> {
    const alert = await this.alertController.create({
      header: options.header,
      inputs: [
        {
          name: 'datetime',
          type: 'datetime-local',
          value: options.value,
          min: options.min,
          max: options.max
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Select',
          handler: (data) => data.datetime
        }
      ]
    });
    
    await alert.present();
    const result = await alert.onDidDismiss();
    return result.data?.values?.datetime || null;
  }
}