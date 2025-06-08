// src/app/shared/pipes/nl2br.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'nl2br',
  standalone: true // Fă-l standalone pentru importare ușoară
})
export class Nl2brPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (value === null || value === undefined) {
      return '';
    }
    // Înlocuiește secvențele de linie nouă (\n, \r\n, \r) cu <br />
    // și sanitizează HTML-ul rezultat pentru securitate.
    return this.sanitizer.bypassSecurityTrustHtml(value.replace(/(\r\n|\n|\r)/gm, '<br />'));
  }
}