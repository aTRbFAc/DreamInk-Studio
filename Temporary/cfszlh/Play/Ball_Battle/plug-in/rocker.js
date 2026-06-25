/**
 * 摇杆模块
 * 当前版本 0.2
 * 写于2025年3月4日
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const sqrt = Math.sqrt;
const acos = Math.acos;

class Vec2 {
    constructor( x=0, y=0 ) {
        this.x = x;
        this.y = y;
    }
    set( x=0, y=0 ) {
        this.x = x;
        this.y = y;
    }
    copy( vec ) {
        this.x = vec.x;
        this.y = vec.y;
    }
    norm() {
        return sqrt(this.x*this.x + this.y*this.y);
    }
    unit() {
        const _n = 1 / sqrt(this.x*this.x + this.y*this.y);
        return new Vec2( this.x * _n, this.y * _n );
    }
    scale( length=1 ) {
        const _n = length / sqrt(this.x*this.x + this.y*this.y);
        this.x *= _n;
        this.y *= _n;
    }
}

class Rocker {
    constructor() {
        const dom = document.createElement('div');
        dom.style.position = 'absolute';
        dom.style.width = '100px';
        dom.style.height = '100px';
        dom.style.borderRadius = '50%';
        dom.style.backgroundColor = 'rgba(0,0,0,0.6)';
        dom.style.backgroundRepeat = 'no-repeat';
        dom.style.backgroundSize = '100% 100%';

        const cdom = document.createElement('div');
        cdom.style.position = 'relative';
        cdom.style.width = '50px';
        cdom.style.height = '50px';
        cdom.style.borderRadius = '50%';
        cdom.style.backgroundColor = 'white';
        dom.style.backgroundRepeat = 'no-repeat';
        dom.style.backgroundSize = '100% 100%';
        dom.appendChild(cdom);

        dom.style.left = '50px';
        dom.style.top = '50px';
        cdom.style.left = '25px';
        cdom.style.top = '25px';

        this.domElement = dom;

        const coord = new Vec2(), vec = new Vec2();
        let radius, cradius, x, y, x0, y0, unvec;
        cdom.ontouchstart = event=>{
            event.preventDefault();
            coord.set( event.targetTouches[0].pageX, event.targetTouches[0].pageY );
            radius = parseFloat(dom.style.width.replace('px',''))*0.5;
            cradius = parseFloat(cdom.style.width.replace('px',''))*0.5;
            x0 = parseFloat(dom.style.left.replace('px',''));
            y0 = parseFloat(dom.style.top.replace('px',''));
            this.touch?.( 'start', undefined );
        };
        cdom.ontouchmove = event=>{
            event.preventDefault();
            x = event.targetTouches[0].pageX;
            y = event.targetTouches[0].pageY;
            vec.set( x-coord.x, y-coord.y );
            unvec = vec.unit();
            if( vec.norm() < radius ) {
                cdom.style.left = x - x0 - cradius + 'px';
                cdom.style.top = y - y0 - cradius + 'px';
            }
            else {
                cdom.style.left = radius * ( 1 + unvec.x ) - cradius + 'px';
                cdom.style.top = radius * ( 1 + unvec.y ) - cradius + 'px';
            }
            this.touch?.( 'move', unvec );
        };
        cdom.ontouchend = ()=>{
            cdom.style.left = cdom.style.top = radius - cradius + 'px';
            this.touch?.( 'end', undefined );
        };
    }
    setRadius( radius=50 ) {
        const dom = this.domElement, cdom = dom.children[0];
        const cradius = parseFloat(cdom.style.width.replace('px',''))*0.5;
        dom.style.width = dom.style.height = 2*radius + 'px';
        cdom.style.left = cdom.style.top = radius - cradius + 'px';
    }
    setCRadius( cradius=25 ) {
        const dom = this.domElement, cdom = dom.children[0];
        const radius = parseFloat(dom.style.width.replace('px',''))*0.5;
        cdom.style.width = cdom.style.height = 2*cradius + 'px';
        cdom.style.left = cdom.style.top = radius - cradius + 'px';
    }
    setPosition( x=100, y=100 ) {
        const dom = this.domElement, cdom = dom.children[0];
        const radius = parseFloat(dom.style.width.replace('px',''))*0.5,
        cradius = parseFloat(cdom.style.width.replace('px',''))*0.5;
        dom.style.left = x - radius + 'px';
        dom.style.top = y - radius + 'px';
        cdom.style.left = cdom.style.top = radius - cradius + 'px';
    }
    setColor( color ) {
        this.domElement.style.backgroundColor = color;
    }
    setChColor( color ) {
        this.domElement.children[0].style.backgroundColor = color;
    }
    setImage( url ) {
        this.domElement.style.backgroundImage = 'url("' + url + '")';
    }
    setChImage( url ) {
        this.domElement.children[0].style.backgroundImage = 'url("' + url + '")';
    }
}

export { Rocker };