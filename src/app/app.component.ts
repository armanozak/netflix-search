import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { distinctUntilChanged, debounceTime, map } from "rxjs/operators";
import { OBSERVE, OBSERVE_PROVIDER, Observed, ObserveFn } from "ng-observe";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  viewProviders: [OBSERVE_PROVIDER],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  searchControl = new FormControl();
  selected = null;
  genres: Observed<Genre[]>;
  search: Observed<string>;

  get options(): Genre[] {
    if (!this.search.value || !this.genres.value) return [];

    const filterValue = this.search.value.toLowerCase();

    return this.genres.value.filter(option =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  constructor(@Inject(OBSERVE) observe: ObserveFn, http: HttpClient) {
    this.genres = observe(
      http
        .get<Genre[]>(
          "https://raw.githubusercontent.com/f/netflix-genres/main/genres.tr.json"
        )
        .pipe(map(list => list.sort((a, b) => a.name.localeCompare(b.name))))
    );

    this.search = observe(
      this.searchControl.valueChanges.pipe(
        debounceTime(100),
        distinctUntilChanged()
      )
    );
  }

  clear() {
    if (!this.selected) return;

    this.selected = null;
    this.searchControl.reset();
  }
}

interface Genre {
  name: string;
  url: string;
}
