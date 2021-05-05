import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { OBSERVE, ObserveFn, OBSERVE_PROVIDER } from "ng-observe";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";

@Component({
  templateUrl: "./search.component.html",
  viewProviders: [OBSERVE_PROVIDER],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  searchControl = new FormControl();
  selected = null;
  state: State;

  get options(): Genre[] {
    const { genres, search } = this.state;

    if (!genres || !search) return [];

    const filterValue = search.toLowerCase();

    return genres.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  constructor(@Inject(OBSERVE) observe: ObserveFn, http: HttpClient) {
    this.state = observe({
      genres: http
        .get<Genre[]>(
          "https://raw.githubusercontent.com/f/netflix-genres/main/genres.tr.json"
        )
        .pipe(map((list) => list.sort((a, b) => a.name.localeCompare(b.name)))),
      search: this.searchControl.valueChanges.pipe(
        debounceTime(100),
        distinctUntilChanged()
      ),
    });
  }

  clear() {
    if (!this.selected) return;

    this.selected = null;
    this.searchControl.reset();
  }
}

interface State {
  genres: Genre[];
  search: string;
}

interface Genre {
  name: string;
  url: string;
}
