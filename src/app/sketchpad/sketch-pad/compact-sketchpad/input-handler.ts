import { HTMLUtils } from './html';

export class InputHandler {
  toText<T extends string>(event: Event): T {
    return HTMLUtils.getInputText(event).trim() as T;
  }

  toNum<T extends number>(event: Event): T {
    return HTMLUtils.getInputNumber(event) as T;
  }
}
