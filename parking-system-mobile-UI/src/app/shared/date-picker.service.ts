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
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: options.header,
        cssClass: 'date-picker-alert',
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
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: 'Select',
            handler: (data) => {
              resolve(data.date || null);
            }
          }
        ]
      });
      
      await alert.present();
    });
  }

  async openDateTimePicker(options: {
    header: string;
    value?: string;
    min?: string;
    max?: string;
  }): Promise<string | null> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: options.header,
        cssClass: 'datetime-picker-alert',
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
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: 'Select',
            handler: (data) => {
              resolve(data.datetime || null);
            }
          }
        ]
      });
      
      await alert.present();
    });
  }
}