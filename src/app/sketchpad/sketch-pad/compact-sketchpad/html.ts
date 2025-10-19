export class HTMLUtils {
  static getInputNumber(event: Event): number {
    return +this.getInputText(event);
  }
  static getInputText(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
