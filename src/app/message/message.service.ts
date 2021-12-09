import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import input from 'input'; // npm i input
import * as _ from 'lodash';

@Injectable()
export class MessageService implements OnModuleInit {
  client: TelegramClient;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const stringSession = new StringSession('');
    const apiId = parseInt(this.config.get('API_ID'));
    const apiHash = this.config.get('API_HASH');
    this.client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });
    console.log('Client Try to connect.');
    await this.client.start({
      phoneNumber: async () => await input.text('number ?'),
      // phoneNumber: '+919876543210',
      password: async () => await input.text('password?'),
      phoneCode: async () => await input.text('Code ?'),
      onError: (err) => console.log(err),
    });
    // const ses = this.client.session.save();
    // console.log(ses); // Save this string to avoid logging in again
    // await client.connect();
    // console.log('Client connected.');
    // await client.sendMessage('+919488507981', { message: 'Hello1' });
    console.log(`The message module has been initialized.`);
    this.client.addEventHandler((update: Api.TypeUpdate) => {
      if (
        update.className === 'UpdateNewChannelMessage' &&
        (update.message.peerId as any).channelId?.toString() == '1593235404'
      ) {
        console.log('update message', update);
        // console.log(update);
        console.log((update.message as any)?.message);
        const message: string = (update.message as any)?.message;
        const msgArr = _.compact(message.split('\n'));
        console.log('msgArr', _.compact(msgArr));
        const data: {
          name?: string;
          price?: number;
          mode?: string;
          sl?: number;
          tp1?: number;
          tp2?: number;
          tp3?: number;
        } = {};
        for (const item of msgArr) {
          const at = item.split('@');
          const col = item.split(':');
          if (at.length === 2) {
            const val = _.compact(at[0].split(' '));
            data.name = val[2];
            data.mode = val[1];
            data.price = parseFloat(at[1]);
          }
          if (col.length === 2) {
            const val = parseFloat(col[1]);
            switch (col[0]) {
              case 'SL':
                data.sl = val;
                break;
              case 'TP1':
                data.tp1 = val;
                break;
              case 'TP2':
                data.tp2 = val;
                break;
              case 'TP3':
                data.tp3 = val;
                break;
            }
          }
        }
        console.log('data', data);
      }
    });
  }

  async sendMessage(phno: string, message: string) {
    await this.client.connect();
    await this.client.sendMessage(phno, { message });
    await this.client.disconnect();
  }
}
