
export default class ResizeTracker {

    public static mw: number = 200;
    public static mh: number = 300;

    public static wL: number;
    public static wW: number;
    public static wT: number;
    public static wH: number;

    public static constX: number;
    public static constY: number;

    private static animationPointer: number;
    private static appWindow: HTMLElement;

    private static animate(context: ResizeTracker) {

        if (!((this.wW <= this.mw) ||  ((this.wW + this.appWindow.offsetLeft) >= (window.innerWidth - 12)))) { this.appWindow.style.width = `${this.wW}px` };
        if (!((this.wL <= -1))) { this.appWindow.style.left = `${this.wL}px` };
        if (!(this.wT <= 12)) {}
        
        this.animationPointer = requestAnimationFrame(()=>{
            this.animate(context)
        });
    };

    public static on(AppWindow: HTMLElement ): void {

        this.constX = AppWindow.offsetLeft + AppWindow.clientWidth;
        this.constY = AppWindow.offsetTop + AppWindow.clientHeight;

        this.wL = AppWindow.offsetLeft;
        this.wW = AppWindow.clientWidth;
        this.wT = AppWindow.offsetTop;
        this.wH = AppWindow.clientHeight;

        this.appWindow = AppWindow;
        this.animate(this);
    };

    public static off() {

        cancelAnimationFrame(this.animationPointer)
    }
}