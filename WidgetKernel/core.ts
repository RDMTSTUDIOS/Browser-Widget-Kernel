import { CONFIGURATION } from "../configuration";


export default class WidgetWindow {

    public show() { document.body.appendChild(this._windowNode) };

    public ChangeMinimalWindowSize() {  }
    
    // provided window
    public get ApplicationWindow(): HTMLElement { return this._windowNode };
    private _windowNode: ApplicationWindowHTMLElement;

    // window elements
    private _windowHeader: HTMLElement;

    // window props
    // private _theme: boolean;

    constructor(configuration: {
        Title: string,

        InitialHeight: string,
        InitialWidth: string,

        MinimalHeight: number,
        MinimalWidth: number,

        CollapsesToward?: WindowMinimizeDirection,
    }) {

        this._windowNode = document.createElement('div');
        this._windowNode.style.width = configuration.InitialWidth;
        this._windowNode.style.height = configuration.InitialHeight;
        this._windowNode.style.position = 'absolute';
        this._windowNode.style.display = 'flex';
        this._windowNode.style.alignItems = 'center';
        this._windowNode.style.justifyContent = 'center';
        this._windowHeader = document.createElement('div');
        
        WidgetWindow.DeployScalesToWindow({
            deployScales: WidgetWindow.UIWindow_System_ConstructWindowScales(this._windowNode, configuration.MinimalHeight, configuration.MinimalWidth),
            toWindow: this._windowNode,
        });
    };


    private static DeployScalesToWindow(props: { deployScales: ApplicationWindowScales, toWindow: ApplicationWindowHTMLElement, }) {
        props.toWindow.appendChild(props.deployScales)
    };

    // ? Собрать все возможные случаи направлений через функцию перечисления всех возможных комбинаций x, y ?
    private static UIWindow_ScaleControllersConfiguration: WindowScales = {

        straightLeft: {
            x: 'left',
        },
        straightTop: {
            y: 'top',
        },
        straightRight: {
            x: 'right',
        },
        straightBottom: {
            y: 'bottom',
        },

        cornerLeftTop: {
            x: 'left',
            y: 'top',
        },
        cornerRightTop: {
            x: 'right',
            y: 'top',
        },
        cornerRightBottom: {
            x: 'right',
            y: 'bottom',
        },
        cornerLeftBottom: {
            x: 'left',
            y: 'bottom',
        },
    };

    private static UIWindow_System_ConstructWindowScales(AppWindow: HTMLElement, minHeight: number, minWidth: number): ApplicationWindowScales {
        
        const AppWindowScales = document.createElement('div');
        AppWindowScales.style.position = 'absolute';
        AppWindowScales.style.width = 'calc(100% + 22px)';
        AppWindowScales.style.height = 'calc(100% + 22px)';
        const configCache: WindowScales = this.UIWindow_ScaleControllersConfiguration;

        for (const key in configCache) {

            const ScaleController: HTMLElement = this.UIWindow_System_ConstructScaleController(AppWindow, configCache[key], minHeight, minWidth)
            AppWindowScales.appendChild(ScaleController);
        };

        return AppWindowScales;
    };

    // ! requires at least one
    private static UIWindow_System_ConstructScaleController(AppWindow: HTMLElement, ControllerPosition: RequireAtLeastOne<ScaleControllerPosition, 'x' | 'y'>, minHeight: number, minWidth: number): HTMLElement {

        const scale: CSSStyleDeclaration = AppWindow.style;

        let x =  ControllerPosition.x;
        let y =  ControllerPosition.y;

        const elementWidth:  ScaleControllerSizing = x ? '11px' : '100%';
        const elementHeight: ScaleControllerSizing = y ? '11px' : '100%';

        const scaleVector: ScaleVector = {
            
            x: x ? true : false,
            y: y ? true : false,
        };


        const scaleController = document.createElement('div');
        scaleController.style.position = 'absolute';
        scaleController.style.width =  elementWidth;
        scaleController.style.height = elementHeight;

        if (x) { scaleController.style[x] = '0px' };
        if (y) { scaleController.style[y] = '0px' };

        if ((x === 'left') && (y === 'bottom')) { scaleController.onmousedown = (e): void => ResizeLeftBottom(e)}
        else if ((x === 'right') && (y === 'top')) { scaleController.onmousedown = (e): void => ResizeRightTop(e) }
        else if ((x === 'left') || (y === 'top')) { scaleController.onmousedown = (e): void => ResizeWithPos(e) }
        else { scaleController.onmousedown = (): void => JustResize() }

        function ResizeLeftBottom(e: MouseEvent): void {
            
            const dx: number = AppWindow.offsetLeft - e.clientX;
            const my: number = AppWindow.offsetTop;

            WindowResizer.on(AppWindow);

            const wconst = AppWindow.offsetLeft + AppWindow.clientWidth;

            document.addEventListener('mousemove', function MOVE(e) {
                
                document.addEventListener('mouseup', function rm() {
                    document.removeEventListener('mouseup', rm);
                    document.removeEventListener('mousemove', MOVE);
                    WindowResizer.off();
                });

                WindowResizer.wW = wconst - (e.clientX + dx);
                WindowResizer.wL = e.clientX + dx;
                WindowResizer.wH = e.clientY - my;
            });

        };

        function ResizeRightTop(e: MouseEvent): void {
            
            const mx: number = AppWindow.offsetLeft;
            const dy: number = AppWindow.offsetTop  - e.clientY;

            const hconst = AppWindow.offsetTop + AppWindow.clientHeight;

            document.addEventListener('mousemove', function MOVE(e) {
                
                document.addEventListener('mouseup', function rm() {
                    document.removeEventListener('mouseup', rm);
                    document.removeEventListener('mousemove', MOVE);
                });

                scale.width  = `${e.clientX - mx}px`;
                scale.height = `${hconst - (e.clientY + dy)}px`;
                scale.top  = `${e.clientY + dy}px`;

            });

        }

        function ResizeWithPos(e: MouseEvent): void {

            const dx: number = AppWindow.offsetLeft - e.clientX;
            const dy: number = AppWindow.offsetTop  - e.clientY;

            const hconst = AppWindow.offsetTop + AppWindow.clientHeight;
            const wconst = AppWindow.offsetLeft + AppWindow.clientWidth;

            document.addEventListener('mousemove', function MOVE(e) {
                
                document.addEventListener('mouseup', function rm() {
                    document.removeEventListener('mouseup', rm);
                    document.removeEventListener('mousemove', MOVE);
                });

                if (scaleVector.x) {
                    const X = e.clientX + dx;

                    scale.width = `${wconst - X}px`;
                    scale.left = `${X}px`;
                };
                if (scaleVector.y) {
                    const Y = e.clientY + dy;

                    scale.height = `${hconst - Y}px`;
                    scale.top  = `${Y}px`;
                };
            });
        };
        
        function JustResize(): void {

            const mx: number = AppWindow.offsetLeft;
            const my: number = AppWindow.offsetTop;

            document.addEventListener('mousemove', function MOVE(e) {
                
                document.addEventListener('mouseup', function rm() {
                    document.removeEventListener('mouseup', rm);
                    document.removeEventListener('mousemove', MOVE);
                });

                if (scaleVector.x) {
                    let X = e.clientX - mx;

                    scale.width  = `${X}px`;
                };
                if (scaleVector.y) { scale.height = `${e.clientY - my}px` };
            });
        };


        if (CONFIGURATION.system.development) { scaleController.style.backgroundColor = 'rgba(127, 0, 127, 0.3)' };
        return scaleController;
    };
}



interface WindowScales {
    [key: string]: RequireAtLeastOne<ScaleControllerPosition, 'x' | 'y'>,
}

type ScaleVector = {

    x: boolean,
    y: boolean,
}

type WindowMinimizeDirection = 'left' | 'top' | 'right' | 'bottom';

type ScaleControllerSizing = '11px' | '100%';

//  title.onmousedown = (e): void => {
            
//                 const dY: number = view.offsetTop - e.clientY;
//                 const dX: number = view.offsetLeft - e.clientX;

//                 document.addEventListener('mousemove', function MOVE(e) {
//                     title.addEventListener('mouseup', function rm() {
//                         title.removeEventListener('mouseup', rm);
//                         document.removeEventListener('mousemove', MOVE);
//                     });

//                     view.style.top = `${e.clientY + dY}px`;
//                     view.style.left = `${e.clientX + dX}px`;
//                 });
//             };

type ScaleControllerPosition = {

    x?: 'left' | 'right',
    y?: 'top' | 'bottom',
}

type ApplicationWindowHTMLElement = HTMLElement;
type ApplicationWindowScales = HTMLElement;



type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>>
    & {
        [K in Keys]-?:
            Required<Pick<T, K>>
            & Partial<Record<Exclude<Keys, K>, undefined>>
    }[Keys]

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>> 
    & {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys]



class WindowResizer {

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

    private static animate(context: WindowResizer) {

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