import { Subscription } from 'rxjs';

export class TempSubscriber {
  private subs: Subscription[] = [];

  destroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  static from(...subs: Subscription[]): TempSubscriber {
    const temp = new TempSubscriber();
    temp.subs = subs;
    return temp;
  }
}
