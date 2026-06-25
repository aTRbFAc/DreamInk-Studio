/**
 * LiaoJS
 * beta_v0.1.24.3
 * 于2024年9月2日开始开发
 * 于xxxx年x月x日结束开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const Version = 'beta 0.1.24.3';
const RENDERER_SYSTEM = document.createElement('canvas');
const DRAW_SYSTEM = RENDERER_SYSTEM.getContext( '2d', { willReadFrequently: true } );
const PI = Math.PI;
const abs = Math.abs;
const sqrt = Math.sqrt;
const sin = Math.sin;
const cos = Math.cos;
const acos = Math.acos;
const round = Math.round;
const ceil = Math.ceil;
const floor = Math.floor;
const trunc = Math.trunc;
const cos150 = cos(5/6*PI);
const sin150 = sin(5/6*PI);
const cos210 = cos(7/6*PI);
const sin210 = sin(7/6*PI);
//const __axes_value = 1/(2*sqrt(3));

/* 数学支持部分 */

import { Matrix2, Matrix3, Matrix4, MatrixNxM, Vector2, Vector3, Vector4, VectorN } from './matrix.js';

/**
 * 求旋转后的二维向量
 * @param {object} vector 原向量
 * @param {number} rad 旋转角度（弧度制）
 * @returns 返回旋转后的向量
 */
function getRotateVector2( x0, y0, rad ) {
    //if( typeof vector.update == 'function' ) vector.update();
    //if( vector.line == 2 && vector.column == 1 ) {
        const sino = sin(rad), coso = cos(rad),
        x = x0*coso-y0*sino,
        y = y0*coso+x0*sino;
        //x = vector.element[0]*coso-vector.element[1]*sino,
        //y = vector.element[1]*coso+vector.element[0]*sino;
        return { x, y };
    //}
}

/* 渲染组件部分 */

const RendererLogic = {
    ModelMatrixTransform: modelMatrixTransform,
    OriginalRendering: originalRendering,
    Sort: sort,
    OriginalModelRenderer: function( data ){
        const matrix = this.ModelMatrixTransform([ data.Matrix, data.Camera_Inverse_Matrix ]);
        data.Draw.imageSmoothingEnabled = true;
        data.Draw.globalAlpha = 1;
        data.Draw.setTransform(
            matrix.element[0],
            -matrix.element[3],
            -matrix.element[1],
            matrix.element[4],
            matrix.element[2]*data.UnitX+data.e,
            -matrix.element[5]*data.UnitY+data.f
        );
        this.OriginalRendering( data.Draw, data.Object2D, data.UnitX, data.UnitY, data.Opacity );
    },
    GroupModelRenderer: function( data ){
        const render_config = { Camera_Inverse_Matrix: data.Camera_Inverse_Matrix, Matrix: new Matrix3(), Object2D: undefined, Draw: data.Draw, UnitX: data.UnitX, UnitY: data.UnitY, Opacity: data.Opacity, e: data.e, f: data.f };
        this.Sort( data.Object2D.content, 'position.z' ).forEach(
            ( Child_Object2D )=>{
                render_config.Matrix.copy(data.Matrix);
                render_config.Matrix.multiply( Child_Object2D.matrix() );
                render_config.Object2D = Child_Object2D;
                if( Child_Object2D.type == 'GroupModel' ) {
                    this['GroupModelRenderer'](render_config);
                }
                else if( Child_Object2D.type == 'AxesModel' || Child_Object2D.type == 'GridModel' || Child_Object2D.type == 'GeometryModel' || Child_Object2D.type == 'LineModel' || Child_Object2D.type == 'TextModel' || Child_Object2D.type == 'TextureModel' || Child_Object2D.type == 'VideoModel' ) {
                    this['OriginalModelRenderer'](render_config);
                }
                else if( typeof this[Child_Object2D.type+'Renderer'] == 'function' ) {
                    this[Child_Object2D.type+'Renderer'](render_config);
                }
            }
        );
    },
    BoneModelRenderer: function( data ){
        const render_config = { Camera_Inverse_Matrix: data.Camera_Inverse_Matrix, Matrix: new Matrix3(), Object2D: undefined, Draw: data.Draw, UnitX: data.UnitX, UnitY: data.UnitY, Opacity: data.Opacity, e: data.e, f: data.f };
        // 渲染该骨骼内模型
        this.Sort( data.Object2D.content, 'position.z' ).forEach(
            ( Child_Object2D )=>{
                if( Child_Object2D.type == 'GeometryModel' || Child_Object2D.type == 'LineModel' || Child_Object2D.type == 'TextModel' || Child_Object2D.type == 'TextureModel' || Child_Object2D.type == 'VideoModel' ) {
                    render_config.Matrix.copy(data.Matrix);
                    render_config.Matrix.multiply( Child_Object2D.matrix() );
                    render_config.Object2D = Child_Object2D;
                    this['OriginalModelRenderer'](render_config);
                }
            }
        );
        // 渲染子骨骼
        this.Sort( data.Object2D.skeleton, 'position.z' ).forEach(
            ( Child_Bone )=>{
                render_config.Matrix.copy(data.Matrix);
                render_config.Matrix.multiply( Child_Bone.matrix() );
                render_config.Object2D = Child_Bone;
                this['BoneModelRenderer'](render_config);
            }
        );
    }
};

const DetailLogic = {
    OriginalModelVertex: originalModelVertex,
    GetModelDetail: getModelDetail,
    OriginalModelDetail: function( data ) {
        // data => { Object2D, UnitX, UnitY, Matrix }
        const vertexs = this.OriginalModelVertex(data.Object2D);
        return this.GetModelDetail( vertexs.x0, vertexs.y0, vertexs.x1, vertexs.y1, vertexs.x2, vertexs.y2, vertexs.x3, vertexs.y3, data.UnitX, data.UnitY, data.Matrix, data.Camera_Inverse_Matrix );
    }
};

/**
 * 数组中求最大值
 * @param {object} array 数组
 * @returns 返回数组array中的最大值
 */
function max( array ) {
    return array.sort((a,b)=>{return b-a})[0];
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
 * 三角纹理映射矩阵
 * 此代码取自 https://lrdcq.com/me/read.php/82.htm
 * 感谢 Lrdcq 大神
 * @param {number} x0 顶点1 x坐标
 * @param {number} y0 顶点1 y坐标
 * @param {number} x1 顶点2 x坐标
 * @param {number} y1 顶点2 y坐标
 * @param {number} x2 顶点3 x坐标
 * @param {number} y2 顶点3 y坐标
 * @param {number} u0 UV1 x坐标
 * @param {number} v0 UV1 y坐标
 * @param {number} u1 UV2 x坐标
 * @param {number} v1 UV2 y坐标
 * @param {number} u2 UV3 x坐标
 * @param {number} v2 UV3 y坐标
 * @returns 返回对应的Canvas矩阵
 */
function getTextureMappingMatrix( x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2 ) {
    x1 -= x0;
    y1 -= y0;
    x2 -= x0;
    y2 -= y0;

    u1 -= u0;
    v1 -= v0;
    u2 -= u0;
    v2 -= v0;

    const det = 1 / (u1*v2 - u2*v1),

    a = (v2*x1 - v1*x2) * det,
    b = (v2*y1 - v1*y2) * det,
    c = (u1*x2 - u2*x1) * det,
    d = (u1*y2 - u2*y1) * det,
    e = x0 - a*u0 - c*v0,
    f = y0 - b*u0 - d*v0;

    return [a,b,c,d,e,f];
}

/**
 * 本人于2024年9月8日拉了一坨代码，如下。
 * 望后期的我来修复。（暂时先用旧版代码吧--调皮脸）
 * @param {object} data 输入Object2D参数
 * @param {object} Object2D 默认Object2D参数
 * @param {object} stipulate 替换规则
 */
function extract( data, Object2D, stipulate=[] ) {
    if( data != undefined ) {
        for( let key in Object2D ) {
            if( data[key] != undefined ) {
                // 判断子属性是否为对象或数组
                // 且是否一个一个遍历
                if( typeof Object2D[key] == 'object' && stipulate == undefined || typeof Object2D[key] == 'object' && stipulate.indexOf(key) == -1 ) {
                    if( ! Array.isArray(Object2D[key]) ) {
                        // 此属性是对象
                        for( let key2 in Object2D[key] ) {
                            if( data[key][key2] != undefined ) Object2D[key][key2] = data[key][key2];
                        }
                    }
                    else {
                        // 此属性是数组
                        for( let i = 0; i < Object2D[key].length; i++ ) {
                            if( data[key][i] != undefined ) Object2D[key][i] = data[key][i];
                        }
                    }
                }
                else {
                    // 正常替换
                    Object2D[key] = data[key];
                }
            }
        }
    }
}

/**
 * 排序
 * @param {object} element 原数组
 * @param {object} attribute 排序规则
 * @returns 返回排序后的数组
 */
function sort( element, attribute ) {
    const key_array = new Array(),
    key_assemble = new Object(),
    new_element = new Array();
    let key_value = 0, key;
    element.forEach(
        ( Object2D )=>{
            key_value = getAttributeValue( Object2D, attribute );
            key_array.push(key_value);
            if( key_assemble['key_'+key_value] == undefined ) key_assemble['key_'+key_value] = [Object2D];
            else key_assemble['key_'+key_value].push(Object2D);
        }
    );
    key_array.sort((a,b)=>{return a-b}).forEach(
        ( value )=>{
            if( value != key ) {
                key_assemble['key_'+value].forEach(
                    ( Object2D )=>{
                        new_element.push(Object2D);
                    }
                );
                key = value;
            }
        }
    );
    return new_element;
}

/**
 * 颜色处理
 * 此代码取自 CSDN 上的文章
 * 代码文章 https://blog.csdn.net/qq_38188709/article/details/115464944
 * 感谢 CSDN 大神
 * @param {string|number} num 颜色参数，要么为十进制数字，要么为字符串
 * @returns 返回统一颜色字符串
 */
function getColorString( num=0 ) {
    if( typeof num == 'number' ) {
        const r = num >> 16,
        g = (num & 0xff00) >> 8,
        b = num & 0xff,
        hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    }
    else return num;
}

/**
 * 颜色混合
 * @param {object} colorA 颜色A rgba格式 背景色
 * @param {object} colorB 颜色B rgba格式 目标色
 * @returns 返回两个颜色混合后的颜色
 */
function getColorBlend( colorA, colorB ) {
    const color = { r: 0, g: 0, b: 0, a: 0 };
    const valueB = colorB.a*0.00392156863;
    color.r = trunc(colorA.r*(1-valueB)+colorB.r*valueB);
    color.g = trunc(colorA.g*(1-valueB)+colorB.g*valueB);
    color.b = trunc(colorA.b*(1-valueB)+colorB.b*valueB);
    color.a = trunc(colorA.a+colorB.a-colorA.a*valueB);
    if( color.r > 255 ) color.r = 255;
    if( color.g > 255 ) color.g = 255;
    if( color.b > 255 ) color.b = 255;
    if( color.a > 255 ) color.a = 255;
    return color;
}

/**
 * 获取Object2D模型的属性值
 * @param {object} Object2D 参数模型 
 * @param {string} attribute 属性值对应的属性路径
 * @returns 返回 attribute 路径对应的属性值
 */
function getAttributeValue( Object2D, attribute ) {
    const key_data = JSON.parse( '["'+attribute.replace( /\./g, '","' )+'"]' );
    let current = Object2D;
    for( let i = 0; i < key_data.length; i++ ) {
        current = current[key_data[i]];
    }
    return current;
}

/**
 * 获取 Object2D 模型矩阵
 * @param {object} Object2D 参数模型
 * @returns 返回此模型的模型矩阵
 */
function getModelMatrix( Object2D ) {
    const sinz = sin(Object2D.rotation.z),
    cosz = cos(Object2D.rotation.z),
    cosx = cos(Object2D.rotation.x),
    cosy = cos(Object2D.rotation.y),
    matrix = new Matrix3([
        cosy*cosz*Object2D.size, cosx*sinz*Object2D.size, Object2D.position.x,
        -cosy*sinz*Object2D.size, cosx*cosz*Object2D.size, Object2D.position.y,
        0, 0, 1
    ]);
    if( Object2D.getMatrix == undefined ) return matrix;
    else {
        if( Object2D.setMatrix == 'cover' ) return Object2D.getMatrix();
        else if( Object2D.setMatrix == 'inherit' ) {
            //matrix.premultiply( Object2D.getMatrix() );
            return modelMatrixTransform([ matrix, Object2D.getMatrix() ]);
        }
    }
}

/**
 * 获取模型尺寸数据
 * @param {object} Object2D 模型
 * @returns 返回模型尺寸坐标数据 Object格式
 */
function originalModelVertex( Object2D ) {
    const detail = { x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 },
    assembleX = [], assembleY = [];
    let maxx, maxy, minx, miny;
    if( Object2D.type == 'AxesModel' || Object2D.type == 'GridModel' ) {
        const is_u = [ Object2D.unit[0]*Object2D.extent[0], Object2D.unit[1]*Object2D.extent[0] ],
        is_v = [ Object2D.unit[2]*Object2D.extent[1], Object2D.unit[3]*Object2D.extent[1] ],
        the_u = [ Object2D.unit[0]*Object2D.extent[2], Object2D.unit[1]*Object2D.extent[2] ],
        the_v = [ Object2D.unit[2]*Object2D.extent[3], Object2D.unit[3]*Object2D.extent[3] ];

        const p1 = [ the_u[0]+is_v[0], the_u[1]+is_v[1] ],
        p2 = [ is_u[0]+is_v[0], is_u[1]+is_v[1] ],
        p3 = [ is_u[0]+the_v[0], is_u[1]+the_v[1] ],
        p4 = [ the_u[0]+the_v[0], the_u[1]+the_v[1] ];

        assembleX.push( p1[0] );
        assembleX.push( p2[0] );
        assembleX.push( p3[0] );
        assembleX.push( p4[0] );

        assembleY.push( p1[1] );
        assembleY.push( p2[1] );
        assembleY.push( p3[1] );
        assembleY.push( p4[1] );

        minx = min(assembleX);
        miny = min(assembleY);
        maxx = max(assembleX);
        maxy = max(assembleY);
    }
    else if( Object2D.type == 'GeometryModel' ) {
        for( let i = 0; i < Object2D.vertexs.length; i+=2 ) {
            assembleX.push(Object2D.vertexs[i]);
            assembleY.push(Object2D.vertexs[i+1]);
        }
        minx = min(assembleX);
        miny = min(assembleY);
        maxx = max(assembleX);
        maxy = max(assembleY);
    }
    else if( Object2D.type == 'LineModel' ) {
        //assembleX.push(  )
        //minx = min([])
    }
    else if( Object2D.type == 'TextureModel' ) {
        const texture = Object2D.content[Object2D.index];
        if( texture.type == 'default' ) {
            let width = texture.width,
            height = texture.height,
            image_width = (texture.uv[2]-texture.uv[0])*texture.file.width,
            image_height = (texture.uv[3]-texture.uv[1])*texture.file.height;
            if( width < 0 ) width = height*image_width/image_height;
            else if( height < 0 ) height = width*image_height/image_width;
            let x = width*0.5, y = height*0.5;
            minx = -x;
            miny = -y;
            maxx = x;
            maxy = y;
        }
        else if( texture.type == 'geometry' ) {
            for( let i = 0; i < texture.vertexs.length; i+=2 ) {
                assembleX.push( texture.vertexs[i] );
                assembleY.push( texture.vertexs[i+1] );
            }
            minx = min(assembleX);
            miny = min(assembleY);
            maxx = max(assembleX);
            maxy = max(assembleY);
        }
    }
    else if( Object2D.type == 'VideoModel' ) {
        const video = Object2D.content[Object2D.index];
        let width = video.width,
        height = video.height,
        video_width = (video.uv[2]-video.uv[0])*video.file.videoWidth,
        video_height = (video.uv[3]-video.uv[1])*video.file.videoHeight;
        if( width < 0 ) width = height*video_width/video_height;
        else if( height < 0 ) height = width*video_height/video_width;
        let x = width*0.5, y = height*0.5;
        minx = -x;
        miny = -y;
        maxx = x;
        maxy = y;
    }
    detail.x0 = minx;
    detail.y0 = maxy;
    detail.x1 = maxx;
    detail.y1 = maxy;
    detail.x2 = maxx;
    detail.y2 = miny;
    detail.x3 = minx;
    detail.y3 = miny;
    return detail;
}

/**
 * 获取模型经过矩阵变换后的尺寸数据
 * @param {number} x0 顶点1 x坐标
 * @param {number} y0 顶点1 y坐标
 * @param {number} x1 顶点2 x坐标
 * @param {number} y1 顶点2 y坐标
 * @param {number} x2 顶点3 x坐标
 * @param {number} y2 顶点3 y坐标
 * @param {number} x3 顶点4 x坐标
 * @param {number} y3 顶点4 y坐标
 * @param {number} unitX 单位宽度像素
 * @param {number} unitY 单位高度像素
 * @param {object} matrix 矩阵
 * @returns 返回模型尺寸数据 Object格式
 */
function getModelDetail( x0, y0, x1, y1, x2, y2, x3, y3, unitX, unitY, matrix, camera_inverse_matrix ) {
    matrix = modelMatrixTransform([ matrix, camera_inverse_matrix ]);
    const detail = { width: 0, height: 0, x: 0, y: 0 };
    let assembleX = [ x0, x1, x2, x3 ],
    assembleY = [ y0, y1, y2, y3 ],
    maxx = max(assembleX),
    maxy = max(assembleY),
    minx = min(assembleX),
    miny = min(assembleY);
    assembleX = [
        matrix.element[0]*minx+matrix.element[3]*maxy,
        matrix.element[0]*minx+matrix.element[3]*miny,
        matrix.element[0]*maxx+matrix.element[3]*miny,
        matrix.element[0]*maxx+matrix.element[3]*maxy
    ];
    assembleY = [
        matrix.element[1]*minx+matrix.element[4]*maxy,
        matrix.element[1]*minx+matrix.element[4]*miny,
        matrix.element[1]*maxx+matrix.element[4]*miny,
        matrix.element[1]*maxx+matrix.element[4]*maxy
    ];
    if( assembleX.length > 0 && assembleY.length > 0 ) {
        minx = min(assembleX);
        miny = min(assembleY);
        maxx = max(assembleX);
        maxy = max(assembleY);
        detail.width = trunc(abs(maxx-minx)*unitX);
        detail.height = trunc(abs(maxy-miny)*unitY);
        detail.x = minx;
        detail.y = maxy;
    }
    return detail;
}

/**
 * 单一模型矩阵变换
 * 用于对一个模型进行多次基础变换
 * @param {object} matrixs 模型矩阵变换组
 * @returns 返回最终矩阵
 */
function modelMatrixTransform( matrixs ) {
    const matrixA = new Matrix3();
    let matrixB, a, b, c, d, e, f;
    for( let i = matrixs.length-1; i >= 0; i-- ) {
        matrixB = matrixs[i];
        a = matrixA.element[0]*matrixB.element[0]+matrixA.element[1]*matrixB.element[3];
        c = matrixA.element[0]*matrixB.element[1]+matrixA.element[1]*matrixB.element[4];
        b = matrixA.element[3]*matrixB.element[0]+matrixA.element[4]*matrixB.element[3];
        d = matrixA.element[3]*matrixB.element[1]+matrixA.element[4]*matrixB.element[4];
        e = matrixA.element[8]*matrixB.element[2];
        f = matrixA.element[8]*matrixB.element[5];
        matrixA.element[0] = a;
        matrixA.element[1] = c;
        matrixA.element[3] = b;
        matrixA.element[4] = d;
        matrixA.element[2] += e;
        matrixA.element[5] += f;
        matrixA.element[8] *= matrixB.element[8];
    }
    return matrixA;
}

/**
 * 原件渲染函数 其二（核心函数）
 * @param {object} draw 渲染上下文
 * @param {object} Object2D 要渲染的模型
 * @param {number} unitX 单位宽度像素
 * @param {number} unitY 单位高度像素
 * @param {number} opacity 透明度
 */
function originalRendering( draw, Object2D, unitX, unitY, opacity ) {
    draw.globalAlpha = opacity*Object2D.opacity;
    if( Object2D.type == 'AxesModel' ) {
        const is_u = [ Object2D.unit[0]*Object2D.extent[0]*unitX, Object2D.unit[1]*Object2D.extent[0]*unitY ],
        is_v = [ Object2D.unit[2]*Object2D.extent[1]*unitX, Object2D.unit[3]*Object2D.extent[1]*unitY ],
        the_u = [ Object2D.unit[0]*Object2D.extent[2]*unitX, Object2D.unit[1]*Object2D.extent[2]*unitY ],
        the_v = [ Object2D.unit[2]*Object2D.extent[3]*unitX, Object2D.unit[3]*Object2D.extent[3]*unitY ],
        axes_u_color = getColorString( Object2D.color[0] ),
        axes_v_color = getColorString( Object2D.color[1] ),
        u_length = sqrt( is_u[0]*is_u[0]+is_u[1]*is_u[1] ),
        v_length = sqrt( is_v[0]*is_v[0]+is_v[1]*is_v[1] ),
        unit_u = [ is_u[0]/u_length, is_u[1]/u_length ],
        unit_v = [ is_v[0]/v_length, is_v[1]/v_length ];
        draw.lineWidth = Object2D.zoom[0];
        // 绘制u轴箭头
        draw.beginPath();
        draw.fillStyle = axes_u_color;
        draw.moveTo( is_u[0], -is_u[1] );
        draw.lineTo( is_u[0]+(cos150*unit_u[0]-sin150*unit_u[1])*unitX*Object2D.zoom[2], -is_u[1]-(sin150*unit_u[0]+cos150*unit_u[1])*unitY*Object2D.zoom[2] );
        draw.lineTo( is_u[0]-unit_u[0]*0.6*unitX*Object2D.zoom[2], -is_u[1]+unit_u[1]*0.6*unitY*Object2D.zoom[2] );
        draw.lineTo( is_u[0]+(cos210*unit_u[0]-sin210*unit_u[1])*unitX*Object2D.zoom[2], -is_u[1]-(sin210*unit_u[0]+cos210*unit_u[1])*unitY*Object2D.zoom[2] );
        draw.fill();
        draw.closePath();
        // 绘制v轴箭头
        draw.beginPath();
        draw.fillStyle = axes_v_color;
        draw.moveTo( is_v[0], -is_v[1] );
        draw.lineTo( is_v[0]+(cos150*unit_v[0]-sin150*unit_v[1])*unitX*Object2D.zoom[2], -is_v[1]-(sin150*unit_v[0]+cos150*unit_v[1])*unitY*Object2D.zoom[2] );
        draw.lineTo( is_v[0]-unit_v[0]*0.6*unitX*Object2D.zoom[2], -is_v[1]+unit_v[1]*0.6*unitY*Object2D.zoom[2] );
        draw.lineTo( is_v[0]+(cos210*unit_v[0]-sin210*unit_v[1])*unitX*Object2D.zoom[2], -is_v[1]-(sin210*unit_v[0]+cos210*unit_v[1])*unitY*Object2D.zoom[2] );
        draw.fill();
        draw.closePath();
        // 绘制u向量轴
        draw.beginPath();
        draw.strokeStyle = axes_u_color;
        draw.moveTo( the_u[0], -the_u[1] );
        draw.lineTo( is_u[0], -is_u[1] );
        draw.stroke();
        draw.closePath();
        // 绘制v向量轴
        draw.beginPath();
        draw.strokeStyle = axes_v_color;
        draw.moveTo( the_v[0], -the_v[1] );
        draw.lineTo( is_v[0], -is_v[1] );
        draw.stroke();
        draw.closePath();
        if( Object2D.scale ) {
            // 绘制坐标轴刻度线
            draw.font = Object2D.zoom[1]*20+"px Arial";
            const rotate_vector_u = getRotateVector2( Object2D.unit[0], Object2D.unit[1], PI * 0.5 ),
            rotate_vector_v = getRotateVector2( Object2D.unit[2], Object2D.unit[3], -PI * 0.5 );
            let x, y, metrics, font_width, font_height;
            // 绘制原点
            metrics = draw.measureText('0');
            font_width = metrics.actualBoundingBoxRight-metrics.actualBoundingBoxLeft;
            font_height = metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
            draw.fillStyle = getColorString( Object2D.color[4] );
            draw.beginPath();
            draw.fillText( '0', -rotate_vector_v.x*unitX*0.2-font_width*1.5, rotate_vector_u.y*unitY*0.2+font_height*1.5 );
            draw.closePath();
            draw.strokeStyle = axes_u_color;
            draw.fillStyle = getColorString( Object2D.color[2] );
            for( let i = trunc(Object2D.extent[2]); i < trunc(Object2D.extent[0]); i++ ) {
                if( i != 0 ) {
                    x = Object2D.unit[0]*i*unitX;
                    y = -Object2D.unit[1]*i*unitY;
                    // 刻度线
                    draw.beginPath();
                    draw.moveTo( x, y );
                    draw.lineTo( x+rotate_vector_u.x*unitX*0.2, y-rotate_vector_u.y*unitY*0.2 );
                    draw.stroke();
                    draw.closePath();
                    // 刻度值
                    metrics = draw.measureText(i);
                    font_width = metrics.actualBoundingBoxRight-metrics.actualBoundingBoxLeft;
                    font_height = metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
                    draw.beginPath();
                    draw.fillText( i, x-rotate_vector_u.x*unitX*0.2-font_width*0.5, y+rotate_vector_u.y*unitY*0.2+font_height*1.5 );
                    draw.closePath();
                }
            }
            draw.strokeStyle = axes_v_color;
            draw.fillStyle = getColorString( Object2D.color[3] );
            for( let i = trunc(Object2D.extent[3]); i < trunc(Object2D.extent[1]); i++ ) {
                if( i != 0 ) {
                    x = Object2D.unit[2]*i*unitX;
                    y = -Object2D.unit[3]*i*unitY;
                    // 刻度线
                    draw.beginPath();
                    draw.moveTo( x, y );
                    draw.lineTo( x+rotate_vector_v.x*unitX*0.2, y-rotate_vector_v.y*unitY*0.2 );
                    draw.stroke();
                    draw.closePath();
                    // 刻度值
                    metrics = draw.measureText(i);
                    font_width = metrics.actualBoundingBoxRight-metrics.actualBoundingBoxLeft;
                    font_height = metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
                    draw.beginPath();
                    draw.fillText( i, x-rotate_vector_v.x*unitX*0.2-font_width*1.5, y+rotate_vector_v.y*unitY*0.2+font_height*0.5 );
                    draw.closePath();
                }
            }
        }
    }
    else if( Object2D.type == 'GridModel' ) {
        const axes = [ 0, 0 ],
        grid_color = getColorString( Object2D.color[0] ),
        color_u = getColorString( Object2D.color[1] ),
        color_v = getColorString( Object2D.color[2] );
        // 绘制u轴
        for( let i = trunc(Object2D.extent[3]); i <= trunc(Object2D.extent[1]); i++ ) {
            axes[0] = Object2D.unit[2]*i*unitX;
            axes[1] = -Object2D.unit[3]*i*unitY;
            draw.beginPath();
            if( i == 0 ) draw.strokeStyle = color_u;
            else draw.strokeStyle = grid_color;
            draw.moveTo( axes[0]+Object2D.unit[0]*Object2D.extent[2]*unitX, axes[1]-Object2D.unit[1]*Object2D.extent[2]*unitY );
            draw.lineTo( axes[0]+Object2D.unit[0]*Object2D.extent[0]*unitX, axes[1]-Object2D.unit[1]*Object2D.extent[0]*unitY );
            draw.stroke();
            draw.closePath();
        }
        // 绘制v轴
        for( let i = trunc(Object2D.extent[2]); i <= trunc(Object2D.extent[0]); i++ ) {
            axes[0] = Object2D.unit[0]*i*unitX;
            axes[1] = -Object2D.unit[1]*i*unitY;
            draw.beginPath();
            if( i == 0 ) draw.strokeStyle = color_v;
            else draw.strokeStyle = grid_color;
            draw.moveTo( axes[0]+Object2D.unit[2]*Object2D.extent[3]*unitX, axes[1]-Object2D.unit[3]*Object2D.extent[3]*unitY );
            draw.lineTo( axes[0]+Object2D.unit[2]*Object2D.extent[1]*unitX, axes[1]-Object2D.unit[3]*Object2D.extent[1]*unitY );
            draw.stroke();
            draw.closePath();
        }
    }
    else if( Object2D.type == 'GeometryModel' ) {
        draw.fillStyle = getColorString( Object2D.color );
        if( Object2D.mode == 'default' ) {
            const point1 = [],
            point2 = [],
            point3 = [];
            for( let i = 0; i < Object2D.vertexs.length; i+=6 ) {
                point1[0] = Object2D.vertexs[i]*unitX;
                point1[1] = -Object2D.vertexs[i+1]*unitY;
                point2[0] = Object2D.vertexs[i+2]*unitX;
                point2[1] = -Object2D.vertexs[i+3]*unitY;
                point3[0] = Object2D.vertexs[i+4]*unitX;
                point3[1] = -Object2D.vertexs[i+5]*unitY;
                draw.beginPath();
                draw.moveTo( point1[0], point1[1] );
                draw.lineTo( point2[0], point2[1] );
                draw.lineTo( point3[0], point3[1] );
                draw.fill();
                draw.closePath();
            }
        }
        else if( Object2D.mode == 'old' ) {
            const point = [];
            draw.beginPath();
            for( let i = 0; i < Object2D.vertexs.length; i+=2 ) {
                point[0] = Object2D.vertexs[i]*unitX;
                point[1] = -Object2D.vertexs[i+1]*unitY;
                if( i == 0 ) draw.moveTo( point[0], point[1] );
                else draw.lineTo( point[0], point[1] );
            }
            draw.fill();
            draw.closePath();
        }
    }
    else if( Object2D.type == 'LineModel' ) {
        if( Object2D.mode == 'default' ) draw.setLineDash([0,0]);
        else if( Object2D.mode == 'virtual' ) draw.setLineDash([20,5]);
        draw.strokeStyle = getColorString( Object2D.color );
        draw.lineWidth = Object2D.width;
        draw.beginPath();
        draw.moveTo( Object2D.points[0]*unitX, -Object2D.points[1]*unitY );
        if( Object2D.points.length == 4 ) draw.lineTo( Object2D.points[2]*unitX, -Object2D.points[3]*unitY );
        else if( Object2D.points.length == 6 ) draw.quadraticCurveTo(
            Object2D.points[4]*unitX, -Object2D.points[5]*unitY,
            Object2D.points[2]*unitX, -Object2D.points[3]*unitY
        );
        else if( Object2D.points.length == 8 ) draw.bezierCurveTo(
            Object2D.points[4]*unitX, -Object2D.points[5]*unitY,
            Object2D.points[6]*unitX, -Object2D.points[7]*unitY,
            Object2D.points[2]*unitX, -Object2D.points[3]*unitY
        );
        draw.stroke();
        draw.closePath();
    }
    else if( Object2D.type == 'TextModel' ) {
        draw.font = Object2D.fontSize*unitY+"px "+Object2D.mode;
        const metrics = draw.measureText(Object2D.content),
        font_width = metrics.actualBoundingBoxRight-metrics.actualBoundingBoxLeft,
        font_height = metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
        draw.fillStyle = getColorString( Object2D.color );
        draw.beginPath();
        draw.fillText( Object2D.content, -font_width*0.5, font_height*0.5 );
        draw.closePath();
    }
    else if( Object2D.type == 'TextureModel' ) {
    const texture = Object2D.content[Object2D.index];
    if( texture.type == 'default' ) {
        let width = texture.width * unitX * Object2D.size,
        height = texture.height * unitY * Object2D.size,
        image_width = (texture.uv[2]-texture.uv[0])*texture.file.width,
        image_height = (texture.uv[3]-texture.uv[1])*texture.file.height;
        
        if( width < 0 ) width = height*image_width/image_height;
        else if( height < 0 ) height = width*image_height/image_width;
        
        draw.imageSmoothingEnabled = texture.smoothing;
        draw.save();
        draw.beginPath();
        // 绘制一个圆形路径，半径为宽度的一半（假设是正方形贴图或适配最短边）
        let radius = Math.min(width, height) / 2;
        draw.arc(0, 0, radius, 0, Math.PI * 2);
        draw.clip(); // 应用裁剪
        
        draw.drawImage( 
            texture.file, 
            texture.uv[0]*texture.file.width, 
            texture.uv[1]*texture.file.height, 
            image_width, 
            image_height, 
            -width*0.5, 
            -height*0.5, 
            width, 
            height 
        );
        
        draw.closePath();
        draw.restore();
    }
        else if( texture.type == 'geometry' ) {
            const p1 = [], p2 = [], p3 = [], u1 = [], u2 = [], u3 = [];
            let texture_mapping_matrix;
            for( let i = 0; i < texture.vertexs.length; i+=6 ) {
                p1[0] = texture.vertexs[i]*unitX;
                p1[1] = -texture.vertexs[i+1]*unitY;
                p2[0] = texture.vertexs[i+2]*unitX;
                p2[1] = -texture.vertexs[i+3]*unitY;
                p3[0] = texture.vertexs[i+4]*unitX;
                p3[1] = -texture.vertexs[i+5]*unitY;
                u1[0] = texture.uvs[i]*texture.file.width;
                u1[1] = texture.uvs[i+1]*texture.file.height;
                u2[0] = texture.uvs[i+2]*texture.file.width;
                u2[1] = texture.uvs[i+3]*texture.file.height;
                u3[0] = texture.uvs[i+4]*texture.file.width;
                u3[1] = texture.uvs[i+5]*texture.file.height;
                texture_mapping_matrix = getTextureMappingMatrix( p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], u1[0], u1[1], u2[0], u2[1], u3[0], u3[1] );
                draw.save();
                draw.imageSmoothingEnabled = texture.smoothing;
                draw.beginPath();
                draw.moveTo( p1[0], p1[1] );
                draw.lineTo( p2[0], p2[1] );
                draw.lineTo( p3[0], p3[1] );
                draw.clip();
                draw.transform( texture_mapping_matrix[0], texture_mapping_matrix[1], texture_mapping_matrix[2], texture_mapping_matrix[3], texture_mapping_matrix[4], texture_mapping_matrix[5] );
                draw.drawImage( texture.file, 0, 0 );
                draw.closePath();
                draw.restore();
            }
        }
    }
    else if( Object2D.type == 'VideoModel' ) {
        const video = Object2D.content[Object2D.index];
        let width = video.width*unitX,
        height = video.height*unitY,
        video_width = (video.uv[2]-video.uv[0])*video.file.videoWidth,
        video_height = (video.uv[3]-video.uv[1])*video.file.videoHeight;
        if( width < 0 ) width = height*video_width/video_height;
        else if( height < 0 ) height = width*video_height/video_width;
        // draw.imageSmoothingEnabled = image.smoothing;
        if( ! video.file.paused || video.file.ended ) {
            draw.beginPath();
            draw.drawImage( video.file, video.uv[0]*video.file.videoWidth, video.uv[1]*video.file.videoHeight, video_width, video_height, -width*0.5, -height*0.5, width, height );
            draw.closePath();
        }
        else {
            draw.fillStyle = 'red';
            draw.beginPath();
            draw.fillRect( -width*0.5, -height*0.5, width, height );
            draw.closePath();
        }
    }
}

/**
 * 渲染函数 其一（核心函数）
 * @param {object} camera 相机
 * @param {object} scene 场景
 * @param {object} argument 渲染参数
 * @returns 返回渲染后的 imageData 画面数据
 */
function render( renderer, camera, scene ) {
    renderer.draw.setTransform( 1, 0, 0, 1, 0, 0 );
    renderer.draw.clearRect( 0, 0, renderer.domElement.width, renderer.domElement.height );
    renderer.draw.globalAlpha = 1;
    if( ! scene.transparent ) {
        // 绘制底片
        renderer.draw.beginPath();
        renderer.draw.fillStyle = getColorString( scene.color );
        renderer.draw.fillRect( 0, 0, renderer.domElement.width, renderer.domElement.height );
        renderer.draw.closePath();
    }
    const camera_inverse_matrix = camera.matrix().inverse();
    let model_matrix;
    const render_config = {
        Camera_Inverse_Matrix: undefined,
        Matrix: undefined,
        Object2D: undefined,
        Draw: undefined,
        UnitX: camera.unitX,
        UnitY: camera.unitY,
        Opacity: 1,
        e: undefined,
        f: undefined
    };
    const PIXELA = { r: 0, g: 0, b: 0, a: 0 },
    PIXELB = { r: 0, g: 0, b: 0, a: 0, x: 0, y: 0 },
    MATRIX = new Matrix3();
    let MODEL_DETAIL, CAMERA_IMAGEDATA, IMAGEDATA, IMAGEDATA_WIDTH, CAMERA_IMAGEDATA_DATA, IMAGEDATA_DATA, _X, _Y, _R, _G, _B, _A, PIXEL, PIXEL_COUNT;
    sort( scene.element, 'position.z' ).forEach(
        ( Object2D )=>{
            model_matrix = Object2D.matrix();
            render_config.Object2D = Object2D;
            // render_config.Matrix = Object2D.matrix();
            // camera.draw.setTransform( 1, 0, 0, 1, argument.width*0.5, argument.height*0.5 );
            if( Object2D.SHADER_HANDLE == undefined ) {
                render_config.Draw = renderer.draw;
                render_config.Camera_Inverse_Matrix = camera_inverse_matrix;
                render_config.Matrix = model_matrix;
                render_config.e = renderer.domElement.width*0.5;
                render_config.f = renderer.domElement.height*0.5;
                if( Object2D.type == 'AxesModel' || Object2D.type == 'GridModel' || Object2D.type == 'GeometryModel' || Object2D.type == 'LineModel' || Object2D.type == 'TextModel' || Object2D.type == 'TextureModel' || Object2D.type == 'VideoModel' ) {
                    RendererLogic['OriginalModelRenderer'](render_config);
                }
                else if( typeof RendererLogic[Object2D.type+'Renderer'] == 'function' ) {
                    RendererLogic[Object2D.type+'Renderer'](render_config);
                }
            }
            else {
                if( Object2D.type == 'AxesModel' || Object2D.type == 'GridModel' || Object2D.type == 'GeometryModel' || Object2D.type == 'LineModel' || Object2D.type == 'TextModel' || Object2D.type == 'TextureModel' || Object2D.type == 'VideoModel' ) {
                    MODEL_DETAIL = DetailLogic['OriginalModelDetail']({ Object2D: Object2D, UnitX: camera.unitX, UnitY: camera.unitY, Matrix: model_matrix, Camera_Inverse_Matrix: camera_inverse_matrix });
                }
                else if( typeof DetailLogic[Object2D.type+'Detail'] == 'function' ) {
                    MODEL_DETAIL = DetailLogic[Object2D.type+'Detail']({ Object2D: Object2D, UnitX: camera.unitX, UnitY: camera.unitY, Matrix: model_matrix, Camera_Inverse_Matrix: camera_inverse_matrix });
                }
                // 在这里写后处理算法
                // ---- 修复  头
                if( MODEL_DETAIL.width > 0 && MODEL_DETAIL.height > 0 ) {
                    MATRIX.copy(camera_inverse_matrix);
                    MATRIX.element[2] = -model_matrix.element[2]*camera_inverse_matrix.element[8];
                    MATRIX.element[5] = -model_matrix.element[5]*camera_inverse_matrix.element[8];

                    render_config.Draw = DRAW_SYSTEM;
                    render_config.Camera_Inverse_Matrix = MATRIX;
                    render_config.Matrix = model_matrix;
                    render_config.e = MODEL_DETAIL.width*0.5;
                    render_config.f = MODEL_DETAIL.height*0.5;

                    DRAW_SYSTEM.setTransform( 1, 0, 0, 1, 0, 0 );
                    DRAW_SYSTEM.clearRect( 0, 0, RENDERER_SYSTEM.width, RENDERER_SYSTEM.height );
                    DRAW_SYSTEM.imageSmoothingEnabled = true;
                    DRAW_SYSTEM.globalAlpha = 1;
                    RENDERER_SYSTEM.width = MODEL_DETAIL.width;
                    RENDERER_SYSTEM.height = MODEL_DETAIL.height;
                    // ---- 修复  尾
                    if( Object2D.type == 'AxesModel' || Object2D.type == 'GridModel' || Object2D.type == 'GeometryModel' || Object2D.type == 'LineModel' || Object2D.type == 'TextModel' || Object2D.type == 'TextureModel' || Object2D.type == 'VideoModel' ) {
                        RendererLogic['OriginalModelRenderer'](render_config);
                    }
                    else if( typeof RendererLogic[Object2D.type+'Renderer'] == 'function' ) {
                        RendererLogic[Object2D.type+'Renderer'](render_config);
                    }
                    _X = round(renderer.domElement.width*0.5+(camera_inverse_matrix.element[2]+model_matrix.element[2]*camera_inverse_matrix.element[8])*camera.unitX-MODEL_DETAIL.width*0.5);
                    _Y = round(renderer.domElement.height*0.5-(camera_inverse_matrix.element[5]+model_matrix.element[5]*camera_inverse_matrix.element[8])*camera.unitY-MODEL_DETAIL.height*0.5);
                    IMAGEDATA = DRAW_SYSTEM.getImageData( 0, 0, MODEL_DETAIL.width, MODEL_DETAIL.height );
                    CAMERA_IMAGEDATA = renderer.draw.getImageData( _X, _Y, MODEL_DETAIL.width, MODEL_DETAIL.height );
                    IMAGEDATA_DATA = IMAGEDATA.data;
                    CAMERA_IMAGEDATA_DATA = CAMERA_IMAGEDATA.data;
                    // 遍历画面所有像素
                    IMAGEDATA_WIDTH = IMAGEDATA.width;
                    PIXEL_COUNT = IMAGEDATA.width*IMAGEDATA.height;
                    for( let i = 0; i < PIXEL_COUNT; i++ ) {
                        _R = 4*i;
                        _G = _R+1;
                        _B = _R+2;
                        _A = _R+3;
                        PIXELB.r = IMAGEDATA_DATA[_R];
                        PIXELB.g = IMAGEDATA_DATA[_G];
                        PIXELB.b = IMAGEDATA_DATA[_B];
                        PIXELB.a = IMAGEDATA_DATA[_A];
                        PIXELB.x = i%IMAGEDATA_WIDTH;
                        PIXELB.y = trunc(i/IMAGEDATA_WIDTH);
                        Object2D.SHADER_HANDLE(PIXELB);
                        PIXELA.r = CAMERA_IMAGEDATA_DATA[_R];
                        PIXELA.g = CAMERA_IMAGEDATA_DATA[_G];
                        PIXELA.b = CAMERA_IMAGEDATA_DATA[_B];
                        PIXELA.a = CAMERA_IMAGEDATA_DATA[_A];
                        PIXEL = getColorBlend( PIXELA, PIXELB );
                        CAMERA_IMAGEDATA_DATA[_R] = PIXEL.r;
                        CAMERA_IMAGEDATA_DATA[_G] = PIXEL.g;
                        CAMERA_IMAGEDATA_DATA[_B] = PIXEL.b;
                        CAMERA_IMAGEDATA_DATA[_A] = PIXEL.a;
                    }
                    renderer.draw.putImageData( CAMERA_IMAGEDATA, _X, _Y );
                }
            }
        }
    );
    // 输出画面
    // return camera.draw.getImageData( 0, 0, argument.width, argument.height );
}

class Canvas2DRenderer {
    constructor() {
        this.type = 'Renderer';
        this.domElement = document.createElement('canvas');
        this.draw = this.domElement.getContext( '2d', { willReadFrequently: true } );
        //this.shader = undefined;
        this.domElement.width = 200;
        this.domElement.height = 80;
    }
    setSize( width=200, height=80 ) {
        this.domElement.width = width;
        this.domElement.height = height;
    }
    render( scene, camera ) {
        render( this, camera, scene );
    }
}

class Scene {
    constructor() {
        this.type = 'Scene';
        this.color = 0x000000;
        this.transparent = false;
        this.element = [];
    }
    add( Object2D ) {
        if( this.element.indexOf(Object2D) == -1 ) this.element.push(Object2D);
    }
    remove( Object2D ) {
        const indexOf = this.element.indexOf(Object2D);
        if( indexOf != -1 ) this.element.splice( indexOf, 1 );
    }
}

class Camera {
    constructor() {
        this.type = 'Camera';
        this.position = new Vector3(0,0,10);
        //this.rotate = 0;
        this.model = undefined;
        this.unitX = 70;
        this.unitY = 70;
    }
    matrix() {
        let zoom = 1;
        if( this.position.z > 0 ) zoom = this.position.z/10;
        if( this.model != undefined ) {
            this.position.x = this.model.position.x;
            this.position.y = this.model.position.y;
        }
        const matrix = new Matrix3([zoom,0,this.position.x*zoom,0,zoom,this.position.y*zoom,0,0,zoom]);
        return matrix;
    }
}

class ImageLoad {
    load( url ) {
        return new Promise(
            (resolve)=>{
                const image = new Image();
                image.src = url;
                image.onload = ()=>{
                    resolve( image );
                };
            }
        );
    }
}

class MediaLoad {
    load( url ) {
        return new Promise(
            (resolve)=>{
                const video = document.createElement('video');
                video.muted = true;
                video.src = url;
                video.onloadeddata = ()=>{
                    video.width = video.videoWidth;
                    video.height = video.videoHeight;
                    resolve( video );
                };
            }
        );
    }
}

class AxesModel {
    constructor( data ) {
        const Object2D = {
            unit: [ 1, 0, 0, 1 ],
            extent: [ 5, 5, -5, -5 ], // maxU, maxV, minU, minV
            // u轴，v轴，u轴数字，v轴数字，原点数字颜色
            color: [ 0xffffff, 0xffffff, 0xffffff, 0xffffff, 0xffffff ],
            scale: true,
            zoom: [ 1, 1, 1 ], // 线，数字，箭头大小
            size: 1,
            opacity: 1
        };
        extract( data, Object2D );
        this.type = 'AxesModel';
        this.unit = Object2D.unit;
        this.extent = Object2D.extent;
        this.color = Object2D.color;
        this.scale = Object2D.scale;
        this.zoom = Object2D.zoom;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
}

class GridModel {
    constructor( data ) {
        const Object2D = {
            unit: [ 1, 0, 0, 1 ],
            extent: [ 5, 5, -5, -5 ],
            // 网格，u轴，v轴
            color: [ 0xffffff, 0xffffff, 0xffffff ],
            zoom: 1,
            size: 1,
            opacity: 1
        };
        extract( data, Object2D );
        this.type = 'GridModel';
        this.unit = Object2D.unit;
        this.extent = Object2D.extent;
        this.color = Object2D.color;
        this.zoom = Object2D.zoom;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
}

class GeometryModel {
    constructor( data ) {
        const Object2D = {
            vertexs: [
                -1, 1,
                -1, -1,
                1, -1
            ],
            color: 0xffff00,
            size: 1,
            opacity: 1,
            mode: 'default'
        };
        extract( data, Object2D, [ 'vertexs' ] );
        this.type = 'GeometryModel';
        this.vertexs = Object2D.vertexs;
        this.color = Object2D.color;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.mode = Object2D.mode;
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
}

class LineModel {
    constructor( data ) {
        const Object2D = {
            points: [ 0, 0, 1, 1 ],
            width: 1,
            color: 0xff0000,
            mode: 'default',
            size: 1,
            opacity: 1
        };
        extract( data, Object2D, [ 'points' ] );
        this.type = 'LineModel';
        this.points = Object2D.points;
        this.width = Object2D.width;
        this.color = Object2D.color;
        this.mode = Object2D.mode;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
}

class TextModel {
    constructor( data ) {
        const Object2D = {
            content: 'Hello LiaoJS!',
            fontSize: 1,
            color: 0xffffff,
            mode: 'Arial',
            size: 1,
            opacity: 1
        };
        extract( data, Object2D );
        this.type = 'TextModel';
        this.content = Object2D.content;
        this.fontSize = Object2D.fontSize;
        this.color = Object2D.color;
        this.mode = Object2D.mode;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
}

class TextureModel {
    constructor( data ) {
        const Object2D = {
            content: [],
            index: 0,
            size: 1,
            opacity: 1
        };
        extract( data, Object2D, [ 'content' ] );
        this.type = 'TextureModel';
        this.content = Object2D.content;
        this.index = Object2D.index;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
    add( texture ) {
        if( this.content.indexOf(texture) == -1 ) this.content.push(texture);
    }
    remove( texture ) {
        const indexOf = this.content.indexOf(texture);
        if( indexOf != -1 ) this.content.splice( indexOf, 1 );
    }
}

class Texture {
    constructor( type='default', data={} ) {
        if( type == 'default' ) {
            const obj = {
                width: 1,
                height: 1,
                uv: [ 0, 0, 1, 1 ],
                file: undefined,
                smoothing: true
            };
            extract( data, obj );
            obj.type = 'default';
            return obj;
        }
        else if( type == 'geometry' ) {
            const obj = {
                type: 'geometry',
                vertexs: [],
                uvs: [],
                file: undefined,
                smoothing: true
            };
            if( data.vertexs != undefined ) obj.vertexs = data.vertexs;
            if( data.uvs != undefined ) obj.uvs = data.uvs;
            if( data.file != undefined ) obj.file = data.file;
            if( data.smoothing != undefined ) obj.smoothing = data.smoothing;
            return obj;
        }
    }
}

class VideoModel {
    constructor( data ) {
        const Object2D = {
            content: [],
            index: 0,
            size: 1,
            opacity: 1
        };
        extract( data, Object2D, [ 'content' ] );
        this.type = 'VideoModel';
        this.content = Object2D.content;
        this.index = Object2D.index;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
    add( video ) {
        if( this.content.indexOf(video) == -1 ) this.content.push(video);
    }
    remove( video ) {
        const indexOf = this.content.indexOf(video);
        if( indexOf != -1 ) this.content.splice( indexOf, 1 );
    }
}

class Video {
    constructor( data ) {
        const obj = {
            width: 2,
            height: 1,
            uv: [ 0, 0, 1, 1 ],
            file: undefined
        };
        extract( data, obj );
        return obj;
    }
}

class GroupModel {
    constructor( data ) {
        const Object2D = {
            content: [],
            size: 1,
            opacity: 1
        };
        extract( data, Object2D, [ 'content' ] );
        this.type = 'GroupModel';
        this.content = Object2D.content;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
    add( Object2D ) {
        if( this.content.indexOf(Object2D) == -1 ) this.content.push(Object2D);
    }
    remove( Object2D ) {
        const indexOf = this.content.indexOf(Object2D);
        if( indexOf != -1 ) this.content.splice( indexOf, 1 );
    }
}

class BoneModel {
    constructor( data ) {
        const Object2D = {
            skeleton: [],
            content: [],
            size: 1,
            opacity: 1
        };
        extract( data, Object2D, [ 'skeleton', 'content' ] );
        this.type = 'BoneModel';
        this.skeleton = Object2D.skeleton;
        this.content = Object2D.content;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
    add( bone ) {
        if( this.skeleton.indexOf(bone) == -1 ) this.skeleton.push(bone);
    }
    remove( bone ) {
        const indexOf = this.skeleton.indexOf(bone);
        if( indexOf != -1 ) this.skeleton.splice( indexOf, 1 );
    }
    addModel( Object2D ) {
        if( this.content.indexOf(Object2D) == -1 ) this.content.push(Object2D);
    }
    removeModel( Object2D ) {
        const indexOf = this.content.indexOf(Object2D);
        if( indexOf != -1 ) this.content.splice( indexOf, 1 );
    }
}

class Bone {
    constructor( data ) {
        const ObjectData = {
            skeleton: [],
            content: [],
            rotate: 0
        };
        extract( data, ObjectData, [ 'skeleton', 'content' ] );
        this.type = 'Bone';
        this.skeleton = ObjectData.skeleton;
        this.content = ObjectData.content;
        this.rotate = ObjectData.rotate;
        this.position = new Vector3();
    }
    matrix() {
        const cosz = cos(this.rotate), sinz = sin(this.rotate);
        return new Matrix3([
            cosz, sinz, this.position.x,
            -sinz, cosz, this.position.y,
            0, 0, 1
        ]);
    }
    add( bone ) {
        if( this.skeleton.indexOf(bone) == -1 ) this.skeleton.push(bone);
    }
    remove( bone ) {
        const indexOf = this.skeleton.indexOf(bone);
        if( indexOf != -1 ) this.skeleton.splice( indexOf, 1 );
    }
    addModel( Object2D ) {
        if( this.content.indexOf(Object2D) == -1 ) this.content.push(Object2D);
    }
    removeModel( Object2D ) {
        const indexOf = this.content.indexOf(Object2D);
        if( indexOf != -1 ) this.content.splice( indexOf, 1 );
    }
}

class RectangleModel {
    constructor( data ) {
        const Object2D = {
            width: 2,
            height: 2,
            color: 0xffff00,
            size: 1,
            opacity: 1
        };
        extract( data, Object2D );
        const x = Object2D.width*0.5, y = Object2D.height*0.5;
        this.type = 'GeometryModel';
        this.vertexs = [ -x, y, -x, -y, x, -y, x, y ];
        this.color = Object2D.color;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.mode = 'old';
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
}

class CircleModel {
    constructor( data ) {
        const Object2D = {
            radius: 1,
            radius2: 0,
            start: 0,
            end: 360,
            seg: 60,
            color: 0xffff00,
            size: 1,
            opacity: 1
        };
        extract( data, Object2D );
        const start_angle = Object2D.start / 180 * PI, angle = PI * ( Object2D.end - Object2D.start ) / ( 180 * Object2D.seg ), vertexs = [], vertexs2 = [];
        let rad, x0, y0;
        for( let i = 0; i <= Object2D.seg; i++ ) {
            rad = start_angle + angle * i;
            x0 = sin(rad);
            y0 = cos(rad);
            vertexs.push( Object2D.radius * x0 );
            vertexs.push( Object2D.radius * y0 );
            if( Object2D.radius2 != 0 ) {
                vertexs2.push( Object2D.radius2 * y0 );
                vertexs2.push( Object2D.radius2 * x0 );
            }
        }
        vertexs2.reverse();
        this.type = 'GeometryModel';
        if( vertexs2.length > 0 ) this.vertexs = vertexs.concat(vertexs2);
        else this.vertexs = vertexs.concat([0,0]);
        this.color = Object2D.color;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.mode = 'old';
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
}

class EllipseModel {
    constructor( data ) {
        const Object2D = {
            a: 1,
            b: 1,
            seg: 60,
            color: 0xffff00,
            size: 1,
            opacity: 1
        };
        extract( data, Object2D );
        const angle = 2 * PI / Object2D.seg, vertexs = [];
        let rad;
        for( let i = 0; i < Object2D.seg; i++ ) {
            rad = angle * i;
            vertexs.push( Object2D.a * sin(rad) );
            vertexs.push( Object2D.b * cos(rad) );
        }
        this.type = 'GeometryModel';
        this.vertexs = vertexs;
        this.color = Object2D.color;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.mode = 'old';
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
}

class StarModel {
    constructor( data ) {
        const Object2D = {
            radius: 1,
            radius2: 0.4,
            seg: 5,
            color: 0xffff00,
            size: 1,
            opacity: 1
        };
        extract( data, Object2D );
        const count = Object2D.seg * 2, angle = 2 * PI / count, vertexs = [];
        let rad, rad2;
        for( let i = 0; i <= count; i+=2 ) {
            if( i != 0 ) {
                rad2 = angle * ( i - 1 );
                vertexs.push( Object2D.radius2 * sin(rad2) );
                vertexs.push( Object2D.radius2 * cos(rad2) );
            }
            rad = angle * i;
            vertexs.push( Object2D.radius * sin(rad) );
            vertexs.push( Object2D.radius * cos(rad) );
        }
        this.type = 'GeometryModel';
        this.vertexs = vertexs;
        this.color = Object2D.color;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.mode = 'old';
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
}

class LineEllipseModel {
    constructor( data ) {
        const Object2D = {
            a: 1,
            b: 1,
            width: 1,
            seg: 60,
            color: 0xffff00,
            size: 1,
            opacity: 1
        };
        extract( data, Object2D );
        const angle = 2 * PI / Object2D.seg, content = [];
        let rad0, rad1;
        for( let i = 0; i < Object2D.seg; i++ ) {
            rad0 = angle * i;
            if( i < Object2D.seg-1 ) rad1 = angle * ( i + 1 );
            else rad1 = 0;
            content.push(
                new LineModel({
                    color: Object2D.color,
                    width: Object2D.width,
                    points: [
                        Object2D.a * sin(rad0),
                        Object2D.b * cos(rad0),
                        Object2D.a * sin(rad1),
                        Object2D.b * cos(rad1)
                    ]
                })
            );
        }
        this.type = 'GroupModel';
        this.content = content;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
    add( Object2D ) {
        if( this.content.indexOf(Object2D) == -1 ) this.content.push(Object2D);
    }
    remove( Object2D ) {
        const indexOf = this.content.indexOf(Object2D);
        if( indexOf != -1 ) this.content.splice( indexOf, 1 );
    }
}

class LineStarModel {
    constructor( data ) {
        const Object2D = {
            radius: 1,
            radius2: 0.4,
            seg: 5,
            color: 0xffff00,
            width: 1,
            size: 1,
            opacity: 1
        };
        extract( data, Object2D );
        const count = Object2D.seg * 2, angle = 2 * PI / count, content = [];
        let rad0, rad1, rad2;
        for( let i = 0; i < count; i+=2 ) {
            rad0 = angle * i;
            rad1 = angle * ( i + 1 );
            rad2 = angle * ( i + 2 );
            content.push(
                new LineModel({
                    color: Object2D.color,
                    width: Object2D.width,
                    points: [
                        Object2D.radius * sin(rad0),
                        Object2D.radius * cos(rad0),
                        Object2D.radius2 * sin(rad1),
                        Object2D.radius2 * cos(rad1)
                    ]
                })
            );
            content.push(
                new LineModel({
                    color: Object2D.color,
                    width: Object2D.width,
                    points: [
                        Object2D.radius2 * sin(rad1),
                        Object2D.radius2 * cos(rad1),
                        Object2D.radius * sin(rad2),
                        Object2D.radius * cos(rad2)
                    ]
                })
            );
        }
        this.type = 'GroupModel';
        this.content = content;
        this.size = Object2D.size;
        this.opacity = Object2D.opacity;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.setMatrix = 'cover';
        this.getMatrix = undefined;
    }
    matrix() {
        return getModelMatrix(this);
    }
    add( Object2D ) {
        if( this.content.indexOf(Object2D) == -1 ) this.content.push(Object2D);
    }
    remove( Object2D ) {
        const indexOf = this.content.indexOf(Object2D);
        if( indexOf != -1 ) this.content.splice( indexOf, 1 );
    }
}

export { Version, RendererLogic, DetailLogic, Matrix2, Matrix3, Matrix4, MatrixNxM, Vector2, Vector3, Vector4, VectorN, Canvas2DRenderer, Scene, Camera, ImageLoad, MediaLoad, AxesModel, GridModel, GeometryModel, LineModel, TextModel, TextureModel, VideoModel, GroupModel, BoneModel, Texture, Video, Bone, RectangleModel, CircleModel, EllipseModel, StarModel, LineEllipseModel, LineStarModel };