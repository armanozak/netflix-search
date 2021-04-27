import {
  ChangeDetectionStrategy,
  Compiler,
  Component,
  Injector,
  ViewContainerRef,
} from "@angular/core";
import type { SearchModule } from "./search.module";

@Component({
  selector: "app-root",
  template: "",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(injector: Injector) {
    const compiler = injector.get(Compiler);
    const viewContainerRef = injector.get(ViewContainerRef);

    import("./search.module")
      .then((m) => compiler.compileModuleAsync(m.SearchModule))
      .then((moduleFactory) => {
        const moduleRef = moduleFactory.create(injector);
        const moduleCtor: typeof SearchModule = moduleFactory.moduleType as any;
        return moduleRef.componentFactoryResolver.resolveComponentFactory(
          moduleCtor.component
        );
      })
      .then((componentFactory) => {
        viewContainerRef.createComponent(componentFactory);
      });
  }
}
