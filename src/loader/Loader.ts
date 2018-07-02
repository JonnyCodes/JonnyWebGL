export class Loader {

    private _urls: string[]
    private _images: HTMLImageElement[];
    private _numImagesToLoad: number;
    private _callback: (images: HTMLImageElement[]) => void;

    constructor(urls: string[], callback: (images: HTMLImageElement[]) => void) {
        this._urls = urls.concat();
        this._callback = callback;
    }

    public start(): void {
        this._images = [];
        if (this._urls.length > 0) {
            this._numImagesToLoad = this._urls.length;
            this._urls.forEach(url => {
                this._images.push(this.loadImage(url, this.onImageLoaded));
            });
        } else {
            this._callback([]);
        }
    }

    private loadImage(url: string, callback: () => void)
    {
        const img: HTMLImageElement = new Image();
        img.src = url;
        img.onload = callback;
        return img;
    }

    private onImageLoaded(): void {
        this._numImagesToLoad--;

        if (this._numImagesToLoad === 0) {
            this._callback(this._images);
        }
    }

}