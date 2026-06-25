/**
 * 动画模块
 * 当前版本 0.1.2
 * 于2025年2月26日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const sqrt = Math.sqrt;
const acos = Math.acos;
const cos = Math.cos;
// const atan = Math.atan
const pow = Math.pow;
const abs = Math.abs;
const PI = Math.PI;
const value_1_3 = 1 / 3;
const value_1_27 = 1 / 27;
const rad120 = 2 * PI * value_1_3;
const rad1240 = 2 * rad120;

/**
 * fade函数
 * @param {number} t 参数 t
 * @returns 返回 0 ~ 1 之间的平滑值
 */
function fade( t=0 ) {
    return 6 * t * t * t * t * t - 15 * t * t * t * t + 10 * t * t * t;
}

/**
 * 数组中求最小值
 * @param {object} array 数组
 * @returns 返回数组array中的最小值
 */
function min( array ) {
    return array.sort((a,b)=>{return a-b})[0];
}

/**
 * 卡尔丹一元三次方程求根函数
 * @param {number} p 参数 p
 * @param {number} q 参数 q
 * @returns 返回方程 x^3 + px + q = 0 的根
 */
function cardanoFormula( p, q ) {
    const delta = q * q * 0.25 + p * p * p * value_1_27;
    if( delta > 0 ) {
        const xi = sqrt(delta),
        x1 = pow( -q * 0.5 + xi, value_1_3 ) + pow( -q * 0.5 - xi, value_1_3 );
        return [ x1 ];
    }
    else {
        if( delta == 0 ) {
            if( p == 0 && q == 0 ) return [ 0 ];
            else if( p != 0 && q != 0 ) {
                const xi = pow( -q * 0.5, value_1_3 ),
                x1 = 2 * xi,
                x2 = -xi;
                return [ x1, x2 ];
            }
        }
        else if( delta < 0 ) {
            const r = abs( p ) * value_1_3 * sqrt( -p * value_1_3 ),
            o = value_1_3 * acos( -q / r * 0.5 ),
            xi = 2 * pow( r, value_1_3 ),
            x1 = xi * cos( o ),
            x2 = xi * cos( o + rad120 ),
            x3 = xi * cos( o + rad1240 );
            return [ x1, x2, x3 ];
        }
    }
}

/**
 * 一元一次方程求根函数
 * @param {number} a 参数 a
 * @param {number} b 参数 b
 * @returns 返回方程 ax + b = 0 的根
 */
function linearEquationOneV( a, b ) {
    return [ -b / a ];
}

/**
 * 一元二次方程求根函数
 * @param {number} a 参数 a
 * @param {number} b 参数 b
 * @param {number} c 参数 c
 * @returns 返回方程 ax^2 + bx + c = 0 的根
 */
function quadraticEquationOneV( a, b, c ) {
    const delta = b * b - 4 * a * c;
    const roots = [];
    if( delta >= 0 ) {
        const xii = 1 / a * 0.5;
        if( delta > 0 ) {
            const xi = sqrt(delta),
            x1 = ( -b + xi ) * xii,
            x2 = ( -b - xi ) * xii;
            roots.push(x1);
            roots.push(x2);
        }
        else if( delta == 0 ) roots.push( -b * xii );
    }
    return roots;
}

/**
 * 一元三次方程求根函数
 * @param {number} a 参数 a
 * @param {number} b 参数 b
 * @param {number} c 参数 c
 * @param {number} d 参数 d
 * @returns 返回方程 ax^3 + bx^2 + cx + d = 0 的根
 */
function cubicEquationOneV( a, b, c, d ) {
    const B = b / a, C = c / a, D = d / a;
    const p = C - B * B * value_1_3, q = 2 * B * B * B * value_1_27 - B * C * value_1_3 + D;
    const zRoots_arr = cardanoFormula( p, q ), xRoots_arr = [];
    let x_roots;
    zRoots_arr.forEach(
        z_roots => {
            x_roots = z_roots - B * value_1_3;
            xRoots_arr.push(x_roots);
        }
    );
    return xRoots_arr;
}

/**
 * 任意贝塞尔曲线轨道
 * @param {object} points 二级贝塞尔曲线顶点数组
 * @param {number} start_time 开始时间
 * @param {number} time 持续时间
 * @returns 返回两个AnFunc
 */
function AnGetBezierAnFunc( points, start_time, time ) {
    const end_time = start_time + time,
    v1 = [ points[4] - points[0], points[5] - points[1] ],
    v2 = [ points[6] - points[4], points[7] - points[5] ],
    v3 = [ points[2] - points[6], points[3] - points[7] ],
    ax = v3[0] - 2 * v2[0] + v1[0],
    bx = 3 * ( v2[0] - v1[0] ),
    cx = 3 * v1[0],
    ay = v3[1] - 2 * v2[1] + v1[1],
    by = 3 * ( v2[1] - v1[1] ),
    cy = 3 * v1[1];
    // new AnFunc( start_time, end_time, t=>{const dy = 3 * ay * t * t + 2 * by * t + cy, dx = 3 * ax * t * t + 2 * bx * t + cx;if(dx==0) return 0;else return PI*0.5-atan(dy/dx)})
    return [
        new AnFunc( start_time, end_time, t=>{t/=time;return ax * t * t * t + bx * t * t + cx * t + points[0]}),
        new AnFunc( start_time, end_time, t=>{t/=time;return ay * t * t * t + by * t * t + cy * t + points[1]})
    ];
}

class AnBezier {
    constructor( points=[] ) {
        this.type = 'BezierCure';
        if( points.length == 8 ) this.points = points;
        else this.points = [ 0, 0, 8, 0, 3, 4, 6, 6 ];
    }
    value( x ) {
        const a = this.points[2] + 3 * ( this.points[4] - this.points[6] ) - this.points[0],
        b = 3 * ( this.points[6] - 2 * this.points[4] + this.points[0] ),
        c = 3 * ( this.points[4] - this.points[0] ),
        d = this.points[0] - x;
        let roots = [];
        if( a != 0 && b != 0 && c != 0 ) roots = cubicEquationOneV( a, b, c, d );
        else if( b != 0 && c != 0 ) roots = quadraticEquationOneV( b, c, d );
        else if( c != 0 ) roots = linearEquationOneV( c, d );
        if( roots.length > 0 ) {
            const k = min(roots);
            const y = ( this.points[3] + 3 * ( this.points[5] - this.points[7] ) - this.points[1] ) * k * k * k +
            3 * ( this.points[7] - 2 * this.points[5] + this.points[1] ) * k * k +
            3 * ( this.points[5] - this.points[1] ) * k +
            this.points[1];
            return y;
        }
        else return 0;
    }
}

class AnFunc {
    constructor( start_x=0, end_x=1, func=t=>{return t} ) {
        this.type = 'FuncCure';
        this.__func = func;
        this.__start_x = start_x;
        this.__end_x = end_x;
    }
    value( x ) {
        return this.__func(x);
    }
}

class AnLerp {
    constructor( start_x=0, end_x=1, a=0, b=1 ) {
        this.type = 'LerpCure';
        this.__start_x = start_x;
        this.__end_x = end_x;
        this.__a = a;
        this.__b = b;
        this.__c = end_x - start_x;
    }
    value( x ) {
        return this.__a + fade( x / this.__c ) * ( this.__b - this.__a );
    }
}

class AnCureController {
    constructor() {
        this.type = 'Controller';
        this.content = [];
    }
    add( cure ) {
        if( this.content.indexOf(cure) == -1 ) this.content.push(cure);
    }
    remove( cure ) {
        const indexOf = this.content.indexOf(cure);
        if( indexOf != -1 ) this.content.splice( indexOf, 1 );
    }
    value( x=0 ) {
        let y = x;
        this.content.forEach(
            cure => {
                if( cure.type == 'BezierCure' ) {
                    if( x > cure.points[0] && x < cure.points[2] ) {
                        // 该点在贝塞尔曲线中
                        y = cure.value(x);
                    }
                    else if( x == cure.points[0] ) {
                        // 该点在贝塞尔曲线起点
                        y = cure.points[1];
                    }
                    else if( x == cure.points[2] ) {
                        // 该点在贝塞尔曲线终点
                        y = cure.points[3];
                    }
                }
                else if( cure.type == 'FuncCure' && x >= cure.__start_x && x <= cure.__end_x ) y = cure.value(x-cure.__start_x);
                else if( cure.type == 'LerpCure' ) {
                    if( x > cure.__start_x && x < cure.__end_x ) {
                        // 该点在lerp曲线中
                        y = cure.value(x-cure.__start_x);
                    }
                    else if( x == cure.__start_x ) y = cure.__a;
                    else if( x == cure.__end_x ) y = cure.__b;
                }
            }
        );
        return y;
    }
}

class Animation {
    constructor( obj={} ) {
        this.type = 'Animation';
        this.keys = [];
        this.fps = 25;
        this.time = 2000;
        this.t = 0;
        this.state = 'end';
        this.cycle = false;
        this.__binding = undefined;
        this.__attributes = {};
        Object.keys(obj).forEach(
            key => {
                if( obj[key].type == 'Controller' ) {
                    this.__attributes[key] = obj[key].value(0);
                    this['__Controller_'+key] = obj[key];
                    this.keys.push(key);
                }
            }
        );
        this.__update = ( animation ) => {
            if( animation.state == 'play' ) {
                animation.t += 1000 / animation.fps;
                if( animation.t > animation.time && animation.cycle ) animation.t = 0;
                if( animation.t <= animation.time ) {
                    const tis = animation.t * 0.001;
                    animation.keys.forEach(
                        key => {
                            animation.__attributes[key] = animation['__Controller_'+key].value(tis);
                        }
                    );
                    animation.__binding?.(animation.__attributes);
                    setTimeout(
                        ()=>{animation.__update(animation)},
                        1000 / animation.fps
                    );
                }
                else animation.state = 'end';
            }
        };
    }
    play() {
        if( this.state != 'play' ) {
            if( this.state == 'end' ) this.t = 0;
            this.state = 'play';
            const tis = this.t * 0.001;
            this.keys.forEach(
                key => {
                    this.__attributes[key] = this['__Controller_'+key].value(tis);
                }
            );
            this.__binding?.(this.__attributes);
            setTimeout(
                ()=>{this.__update(this)},
                1000 / this.fps
            );
        }
    }
    pause() {
        if( this.state == 'play' ) this.state = 'pause';
    }
    end() {
        this.state = 'end';
    }
    binding( func ) {
        this.__binding = func;
    }
}

export { AnBezier, AnFunc, AnLerp, AnCureController, Animation, AnGetBezierAnFunc };