import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { OBSERVE, Observed, ObserveFn, OBSERVE_PROVIDER } from "ng-observe";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";

@Component({
  templateUrl: "./search.component.html",
  viewProviders: [OBSERVE_PROVIDER],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  searchControl = new FormControl();
  selected = null;
  genres: Observed<Genre[]>;
  search: Observed<string>;

  get options(): Genre[] {
    if (!this.search.value || !this.genres.value) return [];

    const filterValue = this.search.value.toLowerCase();

    return this.genres.value.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  constructor(@Inject(OBSERVE) observe: ObserveFn, http: HttpClient) {
    this.genres = observe(
      http
        .get<Genre[]>(
          "https://raw.githubusercontent.com/f/netflix-genres/main/genres.tr.json"
        )
        .pipe(map((list) => list.sort((a, b) => a.name.localeCompare(b.name))))
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
