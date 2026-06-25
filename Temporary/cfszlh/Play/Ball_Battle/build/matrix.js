/**
 * JS矩阵模块，可用于矩阵运算
 * 当前版本 0.15
 * 于2024年9月2日开始开发
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const Version = '0.15';
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

function powOne( number=0 ) {
    if( number == 0 ) return 0;
    else if( number%2 == 0 ) return 1;
    else return -1;
}

/**
 * 替换矩阵内的项
 * @param {object} matrix 要更改的矩阵
 * @param {number} number 矩阵内项的索引
 * @param {object} array 要替换的项数组
 * @returns 返回更改后的矩阵
 */
function matrixSet( matrix, number, array ) {
    const element = [];
    for( let i = 0; i < matrix.element.length; i++ ) {
        if( i < number ) element.push( matrix.element[i] );
        else element.push( array[i-number] );
    }
    return element;
}

/**
 * 矩阵复制
 * @param {object} matrix 要复制的矩阵
 * @returns 返回复制后的矩阵
 */
function matrixCopy( matrix ) {
    const element = [];
    matrix.element.forEach(
        ( number )=>{
            element.push(number);
        }
    );
    return element;
}

/**
 * 矩阵加法
 * @param {object} matrixA 矩阵A
 * @param {object} matrixB 矩阵B
 * @param {object} type 模式，1为加法，-1为减法
 * @returns 返回矩阵A与矩阵B相加后的矩阵
 */
function matrixAdd( matrixA, matrixB, type ) {
    if( typeof matrixA.update == 'function' ) matrixA.update();
    if( typeof matrixB.update == 'function' ) matrixB.update();
    if( matrixA.line == matrixB.line && matrixA.column == matrixB.column ) {
        const element = [], count = matrixA.line*matrixA.column;
        let value;
        for( let i = 0; i < count; i++ ) {
            value = matrixA.element[i]+type*matrixB.element[i];
            element.push(value);
        }
        return element;
    }
}

/**
* 矩阵乘法
* @param {object} matrixA 矩阵A
* @param {object|number} matrixB 矩阵B或实数
* @returns 返回矩阵A与矩阵B相乘后的矩阵
*/
function matrixMultiply( matrixA, matrixB ) {
    if( typeof matrixA.update == 'function' ) matrixA.update();
    const element = [];
    let value;
    if( typeof matrixB == 'number' ) {
        // 若第二个参数为实数，则相乘
        matrixA.element.forEach(
            ( number )=>{
                value = number*matrixB;
                element.push(value);
            }
        );
    }
    else if( matrixA.column == matrixB.line ) {
        if( typeof matrixB.update == 'function' ) matrixB.update();
        // 若矩阵A的列等于矩阵B的行，则相乘
        for( let j = 0; j < matrixA.line; j++ ) {
            for( let i = 0; i < matrixB.column; i++ ) {
                value = 0;
                for( let k = 0; k < matrixA.column; k++ ) {
                    value += matrixA.element[j*matrixA.column+k]*matrixB.element[i+k*matrixB.column];
                }
                element.push(value);
            }
        }
    }
    return element;
}

/**
 * 计算矩阵的行列式
 * @param {object} matrix 要计算的矩阵
 * @returns 返回矩阵的行列式
 */
function getMatrixDet( matrix ) {
    // 若为方阵，则计算行列式
    if( matrix.line == matrix.column ) {
        let det = 0;
        if( matrix.line == 1 ) {
            det = matrix.element[0];
        }
        else if( matrix.line == 2 ) {
            // 二阶行列式求解公式
            det = matrix.element[0]*matrix.element[3]-matrix.element[1]*matrix.element[2];
        }
        else if( matrix.line == 3 ) {
            //  三阶行列式求解公式
            const index11 = matrix.element[0],
            index21 = matrix.element[1],
            index31 = matrix.element[2],
            index12 = matrix.element[3],
            index22 = matrix.element[4],
            index32 = matrix.element[5],
            index13 = matrix.element[6],
            index23 = matrix.element[7],
            index33 = matrix.element[8];
            det = index11*index22*index33
            -index11*index32*index23
            +index31*index12*index23
            -index21*index12*index33
            +index21*index32*index13
            -index31*index22*index13;
        }
        else if( matrix.line == 4 ) {
            // 四阶行列式求解公式
            const index11 = matrix.element[0],
            index21 = matrix.element[1],
            index31 = matrix.element[2],
            index41 = matrix.element[3],
            index12 = matrix.element[4],
            index22 = matrix.element[5],
            index32 = matrix.element[6],
            index42 = matrix.element[7],
            index13 = matrix.element[8],
            index23 = matrix.element[9],
            index33 = matrix.element[10],
            index43 = matrix.element[11],
            index14 = matrix.element[12],
            index24 = matrix.element[13],
            index34 = matrix.element[14],
            index44 = matrix.element[15];
            det = index11*index22*index33*index44
            -index11*index22*index43*index34
            -index11*index32*index23*index44
            +index11*index42*index23*index34
            +index11*index32*index43*index24
            -index11*index42*index33*index24
            -index21*index12*index33*index44
            +index21*index12*index43*index34
            +index31*index12*index23*index44
            -index41*index12*index23*index34
            -index31*index12*index43*index24
            +index41*index12*index33*index24
            +index21*index32*index13*index44
            -index21*index42*index13*index34
            -index31*index22*index13*index44
            +index41*index22*index13*index34;
        }
        return det;
    }
}

/**
 * 求伴随矩阵
 * @param {object} matrix 原矩阵
 * @returns 返回此矩阵的伴随矩阵
 */
function getAdjointMatrix( matrix ) {
    // 若为方阵，则有伴随矩阵
    if( matrix.line == matrix.column && matrix.line > 1 && matrix.column > 1 ) {
        const element = [], matrix_i = new MatrixNxM( matrix.line-1, matrix.column-1 );
        let k, z, det, value;
        for( let i = 0; i < matrix.column; i++ ) {
            for( let j = 0; j < matrix.line; j++ ) {
                z = 0;
                for( let y = 0; y < matrix.line; y++ ) {
                    if( y != j ) {
                        for( let x = 0; x < matrix.column; x++ ) {
                            if( x != i ) {
                                k = x+matrix.column*y;
                                matrix_i.element[z] = matrix.element[k];
                                z += 1;
                            }
                        }
                    }
                }
                det = getMatrixDet(matrix_i);
                value = det*powOne(i+j+2);
                element.push(value);
            }
        }
        return element;
    }
}

/**
 * 求逆矩阵
 * @param {object} matrix 原矩阵
 * @returns 返回此矩阵的逆矩阵
 */
function getInverseMatrix( matrix ) {
    // 若为方阵，则计算逆矩阵
    if( matrix.line == matrix.column ) {
        let det = getMatrixDet(matrix);
        // 若此矩阵的行列式不为0，则说明此矩阵可逆
        if( det != 0 ) {
            det = 1/det;
            const element = [],
            // 获取此矩阵的伴随矩阵
            adjointMatrix = getAdjointMatrix(matrix);
            let value;
            adjointMatrix.forEach(
                (number)=>{
                    value = number*det;
                    element.push(value);
                }
            );
            return element;
        }
        else console.error('此矩阵无逆矩阵');
    }
}

// 矩阵分解

/**
 * 矩阵降维
 * @param {object} matrix 矩阵
 * @returns 返回降维后的矩阵
 */
function matrixReduction( matrix ) {
    // 若为列阵，则返回降维后的矩阵
    if( matrix.line > 1 && matrix.column == 1 ) {
        const element = [], count = matrix.line-1;
        let value;
        for( let i = 0; i < count; i++ ) {
            value = matrix.element[i]/matrix.element[count];
            element.push(value);
        }
        return element;
    }
}

/**
 * 矩阵反转
 * @param {object} matrix 原矩阵
 * @returns 返回反转后的矩阵
 */
function matrixReverse( matrix ) {
    const element = [];
    let value;
    for( let j = 0; j < matrix.column; j++ ) {
        for( let i = 0; i < matrix.line; i++ ) {
            value = matrix.element[i*matrix.column+j];
            element.push(value);
        }
    }
    return element;
}

/**
 * 向量乘法
 * @param {object} vectorA 向量A
 * @param {object} vectorB 向量B
 * @returns 返回向量A与向量B的乘积
 */
function vectorMultiply( vectorA, vectorB ) {
    if( typeof vectorA.update == 'function' ) vectorA.update();
    if( typeof vectorB.update == 'function' ) vectorB.update();
    let product = 0, value;
    if( vectorA.line == vectorB.line && vectorA.column == 1 && vectorB.column == 1 ) {
        for( let i = 0; i < vectorA.element.length; i++ ) {
            value = vectorA.element[i]*vectorB.element[i];
            product += value;
        }
    }
    return product;
}

// 向量叉积

/**
 * 求向量夹角
 * @param {object} vectorA 向量A
 * @param {object} vectorB 向量B
 * @returns 返回向量A与向量B的夹角
 */
function vectorAngle( vectorA, vectorB ) {
    if( typeof vectorA.update == 'function' ) vectorA.update();
    if( typeof vectorB.update == 'function' ) vectorB.update();
    if( vectorA.line == vectorB.line && vectorA.column == 1 && vectorB.column == 1 ) {
        return vectorMultiply(vectorA,vectorB)/(getVectorNorm(vectorA)*getVectorNorm(vectorB));
    }
}

/**
 * 向量投影
 * @param {object} vectorA 向量A
 * @param {object} vectorB 向量B
 * @returns 返回向量A在向量B上的投影长度
 */
function vectorProjection( vectorA, vectorB ) {
    if( typeof vectorA.update == 'function' ) vectorA.update();
    if( typeof vectorB.update == 'function' ) vectorB.update();
    if( vectorA.line == vectorB.line && vectorA.column == 1 && vectorB.column == 1 ) {
        const projectionVector = new VectorN( vectorB.line, getVectorScale(vectorB,1) );
        return vectorMultiply(vectorA,projectionVector);
    }
}

// 求法向量

/**
 * 向量模
 * @param {object} vector 向量
 * @returns 返回向量的模
 */
function getVectorNorm( vector ) {
    if( typeof vector.update == 'function' ) vector.update();
    if( vector.line > 0 && vector.column == 1 ) {
        let value = 0;
        vector.element.forEach(
            ( number )=>{
                value += number*number;
            }
        );
        return sqrt(value);
    }
}

/**
 * 更改向量长度
 * @param {object} vector 向量
 * @param {number} length 要变化的长度
 * @returns 返回改变长度后的向量
 */
function getVectorScale( vector, length=1 ) {
    if( typeof vector.update == 'function' ) vector.update();
    if( vector.line > 0 && vector.column == 1 ) {
        const norm_1 = 1/getVectorNorm(vector),
        element = [];
        let value;
        vector.element.forEach(
            ( number )=>{
                value = number*norm_1*length;
                element.push(value);
            }
        );
        return element;
    }
}

class Matrix2 {
    constructor( element=[1,0,0,1] ) {
        this.type = 'Matrix';
        this.line = 2;
        this.column = 2;
        this.element = element;
    }
    set( array=[1], number=0 ) {
        if( number < this.element.length ) this.element = matrixSet( this, number, array );
        else console.error('参数错误！');
    }
    copy( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixCopy(matrix);
        else console.error('参数错误！');
    }
    addition( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixAdd( this, matrix, 1 );
        else console.error('参数错误！');
    }
    subtract( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixAdd( this, matrix, -1 );
        else console.error('参数错误！');
    }
    multiply( matrix ) {
        if( typeof matrix == 'number' ) this.element = matrixMultiply( this, matrix );
        else if( this.column == matrix.line ) {
            this.element = matrixMultiply( this, matrix );
            this.column = matrix.column;
        }
        else console.error('参数错误！');
    }
    premultiply( matrix ) {
        if( typeof matrix == 'number' ) this.element = matrixMultiply( this, matrix );
        else if( matrix.column == this.line ) {
            this.element = matrixMultiply( matrix, this );
            this.line = matrix.line;
        }
        else console.error('参数错误！');
    }
    det() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return getMatrixDet(this);
        else console.error('参数错误！');
    }
    adjoint() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return new MatrixNxM( this.line, this.column, getAdjointMatrix(this) );
        else console.error('参数错误！');
    }
    inverse() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return new MatrixNxM( this.line, this.column, getInverseMatrix(this) );
        else console.error('参数错误！');
    }
    reduction() {
        if( this.line > 1 && this.column == 1 ) {
            this.element = matrixReduction( this );
            this.line -= 1;
        }
        else console.error('参数错误！');
    }
    reverse() {
        const n = this.line, m = this.column;
        this.element = matrixReverse(this);
        this.line = m;
        this.column = n;
    }
}

class Matrix3 {
    constructor( element=[1,0,0,0,1,0,0,0,1] ) {
        this.type = 'Matrix';
        this.line = 3;
        this.column = 3;
        this.element = element;
    }
    set( array=[1], number=0 ) {
        if( number < this.element.length ) this.element = matrixSet( this, number, array );
        else console.error('参数错误！');
    }
    copy( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixCopy(matrix);
        else console.error('参数错误！');
    }
    addition( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixAdd( this, matrix, 1 );
        else console.error('参数错误！');
    }
    subtract( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixAdd( this, matrix, -1 );
        else console.error('参数错误！');
    }
    multiply( matrix ) {
        if( typeof matrix == 'number' ) this.element = matrixMultiply( this, matrix );
        else if( this.column == matrix.line ) {
            this.element = matrixMultiply( this, matrix );
            this.column = matrix.column;
        }
        else console.error('参数错误！');
    }
    premultiply( matrix ) {
        if( typeof matrix == 'number' ) this.element = matrixMultiply( this, matrix );
        else if( matrix.column == this.line ) {
            this.element = matrixMultiply( matrix, this );
            this.line = matrix.line;
        }
        else console.error('参数错误！');
    }
    det() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return getMatrixDet(this);
        else console.error('参数错误！');
    }
    adjoint() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return new MatrixNxM( this.line, this.column, getAdjointMatrix(this) );
        else console.error('参数错误！');
    }
    inverse() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return new MatrixNxM( this.line, this.column, getInverseMatrix(this) );
        else console.error('参数错误！');
    }
    reduction() {
        if( this.line > 1 && this.column == 1 ) {
            this.element = matrixReduction( this );
            this.line -= 1;
        }
        else console.error('参数错误！');
    }
    reverse() {
        const n = this.line, m = this.column;
        this.element = matrixReverse(this);
        this.line = m;
        this.column = n;
    }
}

class Matrix4 {
    constructor( element=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] ) {
        this.type = 'Matrix';
        this.line = 4;
        this.column = 4;
        this.element = element;
    }
    set( array=[1], number=0 ) {
        if( number < this.element.length ) this.element = matrixSet( this, number, array );
        else console.error('参数错误！');
    }
    copy( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixCopy(matrix);
        else console.error('参数错误！');
    }
    addition( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixAdd( this, matrix, 1 );
        else console.error('参数错误！');
    }
    subtract( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixAdd( this, matrix, -1 );
        else console.error('参数错误！');
    }
    multiply( matrix ) {
        if( typeof matrix == 'number' ) this.element = matrixMultiply( this, matrix );
        else if( this.column == matrix.line ) {
            this.element = matrixMultiply( this, matrix );
            this.column = matrix.column;
        }
        else console.error('参数错误！');
    }
    premultiply( matrix ) {
        if( typeof matrix == 'number' ) this.element = matrixMultiply( this, matrix );
        else if( matrix.column == this.line ) {
            this.element = matrixMultiply( matrix, this );
            this.line = matrix.line;
        }
        else console.error('参数错误！');
    }
    det() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return getMatrixDet(this);
        else console.error('参数错误！');
    }
    adjoint() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return new MatrixNxM( this.line, this.column, getAdjointMatrix(this) );
        else console.error('参数错误！');
    }
    inverse() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return new MatrixNxM( this.line, this.column, getInverseMatrix(this) );
        else console.error('参数错误！');
    }
    reduction() {
        if( this.line > 1 && this.column == 1 ) {
            this.element = matrixReduction( this );
            this.line -= 1;
        }
        else console.error('参数错误！');
    }
    reverse() {
        const n = this.line, m = this.column;
        this.element = matrixReverse(this);
        this.line = m;
        this.column = n;
    }
}

class MatrixNxM {
    constructor( n=2, m=2, element=[1,0,0,1] ) {
        this.type = 'Matrix';
        this.line = n;
        this.column = m;
        const count = n*m;
        if( element.length == count ) this.element = element;
        else {
            this.element = [];
            for( let i = 0; i < count; i++ ) this.element.push(0);
        }
    }
    set( array=[1], number=0 ) {
        if( number < this.element.length ) this.element = matrixSet( this, number, array );
        else console.error('参数错误！');
    }
    copy( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixCopy(matrix);
        else console.error('参数错误！');
    }
    addition( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixAdd( this, matrix, 1 );
        else console.error('参数错误！');
    }
    subtract( matrix ) {
        if( this.line == matrix.line && this.column == matrix.column ) this.element = matrixAdd( this, matrix, -1 );
        else console.error('参数错误！');
    }
    multiply( matrix ) {
        if( typeof matrix == 'number' ) this.element = matrixMultiply( this, matrix );
        else if( this.column == matrix.line ) {
            this.element = matrixMultiply( this, matrix );
            this.column = matrix.column;
        }
        else console.error('参数错误！');
    }
    premultiply( matrix ) {
        if( typeof matrix == 'number' ) this.element = matrixMultiply( this, matrix );
        else if( matrix.column == this.line ) {
            this.element = matrixMultiply( matrix, this );
            this.line = matrix.line;
        }
        else console.error('参数错误！');
    }
    det() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return getMatrixDet(this);
        else console.error('参数错误！');
    }
    adjoint() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return new MatrixNxM( this.line, this.column, getAdjointMatrix(this) );
        else console.error('参数错误！');
    }
    inverse() {
        if( this.line == this.column && this.line > 1 && this.line <= 4 ) return new MatrixNxM( this.line, this.column, getInverseMatrix(this) );
        else console.error('参数错误！');
    }
    reduction() {
        if( this.line > 1 && this.column == 1 ) {
            this.element = matrixReduction( this );
            this.line -= 1;
        }
        else console.error('参数错误！');
    }
    reverse() {
        const n = this.line, m = this.column;
        this.element = matrixReverse(this);
        this.line = m;
        this.column = n;
    }
}

class Vector2 {
    constructor( x=0, y=0 ) {
        this.type = 'Vector';
        this.line = 2;
        this.column = 1;
        this.x = x;
        this.y = y;
        this.element = [ x, y ];
    }
    set( x=0, y=0 ) {
        this.x = x;
        this.y = y;
        this.element[0] = x;
        this.element[1] = y;
    }
    copy( vector ) {
        if( this.line == vector.line ) {
            this.x = vector.x;
            this.y = vector.y;
            this.element[0] = vector.x;
            this.element[1] = vector.y;
        }
        else console.error('参数错误！');
    }
    addition( vector ) {
        if( this.line == vector.line && vector.column == 1 ) {
            this.element = matrixAdd( this, vector, 1 );
            this.x = this.element[0];
            this.y = this.element[1];
        }
        else console.error('参数错误！');
    }
    subtract( vector ) {
        if( this.line == vector.line && vector.column == 1 ) {
            this.element = matrixAdd( this, vector, -1 );
            this.x = this.element[0];
            this.y = this.element[1];
        }
        else console.error('参数错误！');
    }
    multiply( vector ) {
        if( typeof vector == 'number' ) {
            this.element = matrixMultiply( this, vector );
            this.x = this.element[0];
            this.y = this.element[1];
        }
        else if( this.line == vector.line && vector.column == 1 ) return vectorMultiply( this, vector );
        else console.error('参数错误！');
    }
    transform( matrix ) {
        if( matrix.type == 'Matrix' && matrix.column == this.line ) {
            this.element = matrixMultiply( matrix, this );
            this.x = this.element[0];
            this.y = this.element[1];
        }
        else console.error('参数错误！');
    }
    angle( vector ) {
        if( this.line == vector.line && vector.column == 1 ) return vectorAngle( this, vector );
        else console.error('参数错误！');
    }
    projection( vector ) {
        if( this.line == vector.line && vector.column == 1 ) return vectorProjection( vector, this );
        else console.error('参数错误！');
    }
    norm() {
        return getVectorNorm(this);
    }
    scale( length=1 ) {
        this.element = getVectorScale( this, length );
        this.x = this.element[0];
        this.y = this.element[1];
    }
    unit() {
        const element = getVectorScale( this, 1 );
        return new Vector2( element[0], element[1] );
    }
    update() {
        this.element[0] = this.x;
        this.element[1] = this.y;
    }
    reverse() {
        const n = this.line, m = this.column;
        this.line = m;
        this.column = n;
    }
}

class Vector3 {
    constructor( x=0, y=0, z=0 ) {
        this.type = 'Vector';
        this.line = 3;
        this.column = 1;
        this.x = x;
        this.y = y;
        this.z = z;
        this.element = [ x, y, z ];
    }
    set( x=0, y=0, z=0 ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.element[0] = x;
        this.element[1] = y;
        this.element[2] = z;
    }
    copy( vector ) {
        if( this.line == vector.line ) {
            this.x = vector.x;
            this.y = vector.y;
            this.z = vector.z;
            this.element[0] = vector.x;
            this.element[1] = vector.y;
            this.element[2] = vector.z;
        }
        else console.error('参数错误！');
    }
    addition( vector ) {
        if( this.line == vector.line && vector.column == 1 ) {
            this.element = matrixAdd( this, vector, 1 );
            this.x = this.element[0];
            this.y = this.element[1];
            this.z = this.element[2];
        }
        else console.error('参数错误！');
    }
    subtract( vector ) {
        if( this.line == vector.line && vector.column == 1 ) {
            this.element = matrixAdd( this, vector, -1 );
            this.x = this.element[0];
            this.y = this.element[1];
            this.z = this.element[2];
        }
        else console.error('参数错误！');
    }
    multiply( vector ) {
        if( typeof vector == 'number' ) {
            this.element = matrixMultiply( this, vector );
            this.x = this.element[0];
            this.y = this.element[1];
            this.z = this.element[2];
        }
        else if( this.line == vector.line && vector.column == 1 ) return vectorMultiply( this, vector );
        else console.error('参数错误！');
    }
    transform( matrix ) {
        if( matrix.type == 'Matrix' && matrix.column == this.line ) {
            this.element = matrixMultiply( matrix, this );
            this.x = this.element[0];
            this.y = this.element[1];
            this.z = this.element[2];
        }
        else console.error('参数错误！');
    }
    angle( vector ) {
        if( this.line == vector.line && vector.column == 1 ) return vectorAngle( this, vector );
        else console.error('参数错误！');
    }
    projection( vector ) {
        if( this.line == vector.line && vector.column == 1 ) return vectorProjection( vector, this );
        else console.error('参数错误！');
    }
    norm() {
        return getVectorNorm(this);
    }
    scale( length=1 ) {
        this.element = getVectorScale( this, length );
        this.x = this.element[0];
        this.y = this.element[1];
        this.z = this.element[2];
    }
    unit() {
        const element = getVectorScale( this, 1 );
        return new Vector3( element[0], element[1], element[2] );
    }
    update() {
        this.element[0] = this.x;
        this.element[1] = this.y;
        this.element[2] = this.z;
    }
    reverse() {
        const n = this.line, m = this.column;
        this.line = m;
        this.column = n;
    }
    cross( vector ) {
        if( vector.line == 3 && vector.column == 1 ) {
            if( typeof vector.update == 'function' ) vector.update();
            if( typeof this.update == 'function' ) this.update();
            return new Vector3( this.y*vector.z-this.z*vector.y, this.z*vector.x-this.x*vector.z, this.y*vector.x-this.x*vector.y );
        }
    }
}

class Vector4 {
    constructor( x=0, y=0, z=0, w=0 ) {
        this.type = 'Vector';
        this.line = 4;
        this.column = 1;
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.element = [ x, y, z, w ];
    }
    set( x=0, y=0, z=0, w=0 ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.element[0] = x;
        this.element[1] = y;
        this.element[2] = z;
        this.element[3] = w;
    }
    copy( vector ) {
        if( this.line == vector.line ) {
            this.x = vector.x;
            this.y = vector.y;
            this.z = vector.z;
            this.w = vector.w;
            this.element[0] = vector.x;
            this.element[1] = vector.y;
            this.element[2] = vector.z;
            this.element[3] = vector.w;
        }
        else console.error('参数错误！');
    }
    addition( vector ) {
        if( this.line == vector.line && vector.column == 1 ) {
            this.element = matrixAdd( this, vector, 1 );
            this.x = this.element[0];
            this.y = this.element[1];
            this.z = this.element[2];
            this.w = this.element[3];
        }
        else console.error('参数错误！');
    }
    subtract( vector ) {
        if( this.line == vector.line && vector.column == 1 ) {
            this.element = matrixAdd( this, vector, -1 );
            this.x = this.element[0];
            this.y = this.element[1];
            this.z = this.element[2];
            this.w = this.element[3];
        }
        else console.error('参数错误！');
    }
    multiply( vector ) {
        if( typeof vector == 'number' ) {
            this.element = matrixMultiply( this, vector );
            this.x = this.element[0];
            this.y = this.element[1];
            this.z = this.element[2];
            this.w = this.element[3];
        }
        else if( this.line == vector.line && vector.column == 1 ) return vectorMultiply( this, vector );
        else console.error('参数错误！');
    }
    transform( matrix ) {
        if( matrix.type == 'Matrix' && matrix.column == this.line ) {
            this.element = matrixMultiply( matrix, this );
            this.x = this.element[0];
            this.y = this.element[1];
            this.z = this.element[2];
            this.w = this.element[3];
        }
        else console.error('参数错误！');
    }
    angle( vector ) {
        if( this.line == vector.line && vector.column == 1 ) return vectorAngle( this, vector );
        else console.error('参数错误！');
    }
    projection( vector ) {
        if( this.line == vector.line && vector.column == 1 ) return vectorProjection( vector, this );
        else console.error('参数错误！');
    }
    norm() {
        return getVectorNorm(this);
    }
    scale( length=1 ) {
        this.element = getVectorScale( this, length );
        this.x = this.element[0];
        this.y = this.element[1];
        this.z = this.element[2];
        this.w = this.element[3];
    }
    unit() {
        const element = getVectorScale( this, 1 );
        return new Vector4( element[0], element[1], element[2], element[3] );
    }
    update() {
        this.element[0] = this.x;
        this.element[1] = this.y;
        this.element[2] = this.z;
        this.element[3] = this.w;
    }
    reverse() {
        const n = this.line, m = this.column;
        this.line = m;
        this.column = n;
    }
}

class VectorN {
    constructor( n=2, element=[0,0] ) {
        this.type = 'Vector';
        this.line = n;
        this.column = 1;
        if( element.length == n ) this.element = element;
        else {
            this.element = new Array();
            for( let i = 0; i < n; i++ ) this.element.push(0);
        }
    }
    set( element=[0,0] ) {
        if( this.line == element.length ) {
            for( let i = 0; i < this.line; i++ ) this.element[i] = element[i];
        }
        else console.error('参数错误！');
    }
    copy( vector ) {
        if( this.line == vector.line ) {
            for( let i = 0; i < this.line; i++ ) this.element[i] = vector.element[i];
        }
        else console.error('参数错误！');
    }
    addition( vector ) {
        if( this.line == vector.line && vector.column == 1 ) this.element = matrixAdd( this, vector, 1 );
        else console.error('参数错误！');
    }
    subtract( vector ) {
        if( this.line == vector.line && vector.column == 1 ) this.element = matrixAdd( this, vector, -1 );
        else console.error('参数错误！');
    }
    multiply( vector ) {
        if( typeof vector == 'number' ) this.element = matrixMultiply( this, vector );
        else if( this.line == vector.line && vector.column == 1 ) return vectorMultiply( this, vector );
        else console.error('参数错误！');
    }
    transform( matrix ) {
        if( matrix.type == 'Matrix' && matrix.column == this.line ) this.element = matrixMultiply( matrix, this );
        else console.error('参数错误！');
    }
    angle( vector ) {
        if( this.line == vector.line && vector.column == 1 ) return vectorAngle( this, vector );
        else console.error('参数错误！');
    }
    projection( vector ) {
        if( this.line == vector.line && vector.column == 1 ) return vectorProjection( vector, this );
        else console.error('参数错误！');
    }
    norm() {
        return getVectorNorm(this);
    }
    scale( length=1 ) {
        this.element = getVectorScale( this, length );
    }
    unit() {
        return new VectorN( this.line, getVectorScale( this, 1 ) );
    }
    reverse() {
        const n = this.line, m = this.column;
        this.line = m;
        this.column = n;
    }
}

export { Version, Matrix2, Matrix3, Matrix4, MatrixNxM, Vector2, Vector3, Vector4, VectorN };