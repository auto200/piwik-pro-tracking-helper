import 'webext-bridge';
import { Message } from './lib/messaging';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    JSTC_EVENT: Message;
    // to specify the return type of the message,
    // use the `ProtocolWithReturn` type wrapper
    // bar: ProtocolWithReturn<CustomDataType, CustomReturnType>;
  }
}
