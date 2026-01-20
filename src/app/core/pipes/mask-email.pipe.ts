import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'maskEmail' })
export class MaskEmailPipe implements PipeTransform {
  transform(email: string): string {
    if (!email || !email.includes('@')) return '';

    const [name, domain] = email.split('@');
    return name.length > 2
      ? name.slice(0, 2) + '*'.repeat(name.length - 2) + '@' + domain
      : name[0] + '*@' + domain;
  }
}
