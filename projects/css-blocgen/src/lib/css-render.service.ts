import { Injectable } from "@angular/core";
import { FormatService } from "@xlayers/std-blocgen";
import { CssContextService, CssBlocGenContext } from "./css-context.service";
import { CssBlocGenOptions } from './css-blocgen.service';

@Injectable({
  providedIn: "root"
})
export class CssRenderService {
  constructor(
    private readonly cssContextService: CssContextService,
    private readonly formatHelperService: FormatService
  ) {}

  render(
    _data: SketchMSData,
    current: SketchMSLayer,
    _options: CssBlocGenOptions = {}
  ) {
    if (this.cssContextService.hasContext(current)) {
      const context = this.cssContextService.contextOf(current);
      return [
        {
          kind: "css",
          language: "css",
          value: this.formatContext(context),
          uri: `${current.name}.css`
        }
      ];
    }

    return [];
  }

  private formatContext(context: CssBlocGenContext) {
    return [
      `${context.className} {`,
      this.flattenAndIndentRules(context),
      "}"
    ].join("\n");
  }

  private flattenAndIndentRules(context: CssBlocGenContext) {
    return Object.entries(context.rules)
      .map(([key, value]) =>
        this.formatHelperService.indent(1, `${key}: ${value};`)
      )
      .join("\n");
  }
}