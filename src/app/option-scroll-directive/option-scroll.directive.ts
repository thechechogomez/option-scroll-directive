import { Directive, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { tap, takeUntil, debounceTime } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';

@Directive({
  selector: 'mat-select[optionsScroll]',
})
export class OptionScrollDirective implements OnDestroy {
  @Input() thresholdPercent = 0.8;
  @Input() hasMore: boolean = false;
  @Output('optionsScroll') scroll = new EventEmitter<any>();
  private $scroll = new Subject();
  private lastST = 0;
  _onDestroy = new Subject();

  constructor(public matSelect: MatSelect) {
    this.matSelect.openedChange
      .pipe(
        tap((open: boolean) => {
          if (open) {
            setTimeout(() => {
              this.matSelect.panel.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
            });
          }
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe();
    this.$scroll.pipe(debounceTime(250), takeUntil(this._onDestroy)).subscribe(() => this.scroll.next(true));
  }

  ngOnDestroy() {
    this._onDestroy.next(true);
    this._onDestroy.complete();
  }

  onScroll(event: any) {
    const threshold = (this.thresholdPercent * 100 * event.target.scrollHeight) / 100;
    const current = event.target.scrollTop + event.target.clientHeight;
    const ST = event.target.scrollTop;
    if (current > threshold && ST > this.lastST && this.hasMore) {
      this.$scroll.next(true);
    }
    this.lastST = ST <= 0 ? 0 : ST;
  }
}
