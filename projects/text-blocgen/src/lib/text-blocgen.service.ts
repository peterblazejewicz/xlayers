import { Injectable } from "@angular/core";
import { TextContextService } from "./text-context.service";
import { TextParserService } from "./text-parser.service";
import { TextRenderService } from "./text-render.service";

export interface TextBlocGenOptions {}

@Injectable({
  providedIn: "root"
})
export class TextBlocGenService {
  constructor(
    private readonly textContextService: TextContextService,
    private readonly textParserService: TextParserService,
    private readonly textRenderService: TextRenderService
  ) {}

  transform(
    data: SketchMSData,
    current: SketchMSLayer,
    opts?: TextBlocGenOptions
  ) {
    if (!this.textContextService.hasContext(current)) {
      this.textParserService.compute(current);
    }

    return this.textRenderService.render(data, current, opts);
  }
}