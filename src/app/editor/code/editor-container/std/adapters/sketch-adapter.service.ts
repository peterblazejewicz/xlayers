import { Injectable } from "@angular/core";
import * as jszip from "jszip";

const entryAsyncCheck = (entry: any): entry is { async: Function } => {
  return !!entry && typeof entry === "object" && "async" in entry;
};

const jszipLoadAsync = (jszip: any): jszip is { loadAsync: Function } => {
  return !!jszip && typeof jszip === "object" && "loadAsync" in jszip;
};

@Injectable({
  providedIn: "root"
})
export class SketchAdapterService {
  async process(file: File) {
    const data = {
      images: {},
      pages: [],
      previews: [],
      document: {},
      user: {},
      meta: {}
    } as any;

    const files = await this.readZipEntries(file);

    await Promise.all(
      Object.entries(files).map(async ([relativePath, entry]) => {
        if (relativePath === "previews/preview.png") {
          return this.addPreviewImage(data, relativePath, entry);
        } else if (relativePath.startsWith("images/")) {
          return this.addImage(data, relativePath, entry);
        } else if (relativePath.startsWith("pages/")) {
          return this.addPage(data, relativePath, entry);
        } else if (Object.hasOwnProperty(relativePath.replace(".json", ""))) {
          return this.addConfiguration(data, relativePath, entry);
        }
        return Promise.resolve({});
      })
    );

    return data;
  }

  private async readZipEntries(file: Blob) {
    return new Promise<unknown[]>((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = _event => {
        try {
          resolve(this.unzipSketchPackage(fileReader.result));
        } catch (e) {
          reject(e);
        }
      };

      fileReader.onerror = e => {
        reject(e);
      };

      try {
        fileReader.readAsArrayBuffer(file);
      } catch (e) {
        reject(e);
      }
    });
  }

  private async unzipSketchPackage(data: string | ArrayBuffer) {
    const jszip = window["JSZip"];

    if (jszipLoadAsync(jszip)) {
      const zipFileInstance = await jszip.loadAsync(data);

      const files: unknown[] = [];
      zipFileInstance.forEach((relativePath, zipEntry) => {
        files[relativePath] = zipEntry;
      });
      return files;
    } else {
      throw new Error("JSzip not loaded");
    }
  }

  private async addConfiguration(
    data: SketchMSData,
    relativePath: string,
    entry: unknown
  ) {
    const content = await this.extractJson(relativePath, entry);
    data[relativePath] = content;
  }

  private async addPage(
    data: SketchMSData,
    relativePath: string,
    entry: unknown
  ) {
    const content = await this.extractJson(relativePath, entry);

    try {
      const page = JSON.parse(content);
      data.pages.push(page);
    } catch (e) {
      throw new Error(`Could not load page "${relativePath}"`);
    }
  }

  private async addImage(
    data: SketchMSData,
    relativePath: string,
    entry: unknown
  ) {
    const imageData = await this.extractBase64(relativePath, entry);
    (data as any).images[relativePath] = imageData;
  }

  private async addPreviewImage(
    data: SketchMSData,
    relativePath: string,
    entry: unknown
  ) {
    const imageData = await this.extractBase64(relativePath, entry);

    data.previews.push({
      source: imageData.source,
      width: imageData.image.width,
      height: imageData.image.height
    });
  }

  private async extractJson(_relativePath: string, entry: unknown) {
    if (entryAsyncCheck(entry)) {
      const content = await entry.async("string");
      return JSON.parse(content);
    } else {
      throw new Error("JSZip undefined async function");
    }
  }

  private async extractBase64(relativePath: string, entry: unknown) {
    if (entryAsyncCheck(entry)) {
      return entry.async("base64");
    } else {
      throw new Error("JSZip undefined async function");
    }
  }
}