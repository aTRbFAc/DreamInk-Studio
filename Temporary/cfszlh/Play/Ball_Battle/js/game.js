import * as LIAO from '../build/liao.module.js'
import { AnBezier, AnFunc, AnLerp, AnCureController, Animation, AnGetBezierAnFunc } from '../plug-in/animation.js'

const PI = Math.PI
const E = Math.E
const sqrt = Math.sqrt
const random = Math.random
const sign = Math.sign
const abs = Math.abs
const trunc = Math.trunc
const pow = Math.pow
const sin = Math.sin
const cos = Math.cos

let id = 0

function GamesUPDATE( _GOject, games ) {
    let s0, s1, r0, r1, r
    games.element.forEach(
        GOject => {
            if( GOject.id != _GOject.id && GOject.radius > _GOject.radius && getLength( GOject, _GOject ) < GOject.radius ) {
                // 吞噬
                s0 = GOject.radius * GOject.radius
                s1 = _GOject.radius * _GOject.radius
                r0 = GOject.radius
                r1 = sqrt( s0 + s1 )
                //GOject.model.size = r / 0.5
                //GOject.radius = r
                //GOject.model.position.z = r
                games.remove(_GOject)
                
                games.animation.binding(
                    keys => {
                        r = r0 + (r1 - r0) * keys.x
                        GOject.model.size = r * 2
                        GOject.radius = r
                        GOject.model.position.z = r
                        GOject.name.position.z = r
                    }
                )
                games.animation.play()
            }
            else if( GOject.id != _GOject.id && GOject.radius < _GOject.radius && getLength( GOject, _GOject ) < _GOject.radius ) {
                // 被吞噬
                s0 = _GOject.radius * _GOject.radius
                s1 = GOject.radius * GOject.radius
                r0 = _GOject.radius
                r1 = sqrt( s0 + s1 )
                //_GOject.model.size = r / 0.5
                //_GOject.radius = r
                //_GOject.model.position.z = r
                games.remove(GOject)
                
                if( _GOject.id == games.player.id ) {
                    games.animation.binding(
                        keys => {
                            r = r0 + (r1 - r0) * keys.x
                            _GOject.model.size = r * 2
                            _GOject.radius = r
                            _GOject.model.position.z = r
                            _GOject.name.position.z = r
                            games.camera.position.z = _GOject.radius * 1.6 + 10
                        }
                    )
                    games.animation.play()
                }
                else {
                    games.animation.binding(
                        keys => {
                            r = r0 + (r1 - r0) * keys.x
                            _GOject.model.size = r * 2
                            _GOject.radius = r
                            _GOject.model.position.z = r
                            _GOject.name.position.z = r
                        }
                    )
                    games.animation.play()
                }
            }
        }
    )
}

function getVelocity( x ) {
    return 0.02 * pow( E, -0.4214 * (x - 0.5) )
}

function getLength( GOject1, GOject2 ) {
    const x = GOject2.position.x - GOject1.position.x, y = GOject2.position.y - GOject1.position.y
    return sqrt( x*x + y*y )
}

class GOject {
    constructor( name='producer', radius=0.5, seg=40, source='mediumSlateBlue', x=0, y=0, identity='producer', vx=0, vy=0, step=120 ) {
        this.type = 'GOject'
        this.id = id
        this.identity = identity
        this.radius = radius
        this.position = new LIAO.Vector2( x, y )
        this.velocity = new LIAO.Vector2( vx, vy )
        this.step = step
        this.step_i = 0
        this.source = source 
        id++

        // 判断是图片还是颜色
        const isImage = source instanceof HTMLImageElement || (typeof source === 'object' && source.tagName === 'IMG');

        if (isImage) {
            // 创建纹理
            const texture = new LIAO.Texture('default', {
                file: source,
                width: 1, // 基准宽度，稍后通过 size 缩放
                height: 1, // 基准高度
                smoothing: true
            });
            this.model = new LIAO.TextureModel({
                content: [texture],
                size: radius * 2 // 初始大小设为直径
            });
            // 标记这是一个图片对象，以便在 update 中特殊处理
            this.isImageModel = true;
        } else {
            // 原有的圆形逻辑
            this.model = new LIAO.CircleModel({ radius, color: source, seg });
            this.isImageModel = false;
        }

        if( identity == 'consumer' || identity == 'player' ) {
            this.name = new LIAO.TextModel({ content:name, size:0.4 })
        }
    }
}

class GameLoader {
    constructor( width=10, height=10, scene, camera, player ) {
        this.type = 'GameLoader'
        this.width = width
        this.height = height
        this._x = width * 0.5
        this._y = height * 0.5
        this.scene = scene
        this.camera = camera
        this.player = player
        this.element = []
        
        const controller = new AnCureController()
        controller.add(new AnFunc( 0, 0.8, t=>{return t*1.25} ))
        this.animation = new Animation({
            x: controller
        })
        this.animation.fps = 60
        this.animation.time = 800
    }
    
    add( GOject ) {
        if( this.element.indexOf(GOject) == -1 ) {
            this.element.push(GOject)
            this.scene.add(GOject.model)
            if( GOject.name != undefined ) this.scene.add(GOject.name)
        }
    }
    
    remove( GOject ) {
        const indexOf = this.element.indexOf(GOject)
        if( indexOf != -1 ) {
            this.element.splice( indexOf, 1 )
            this.scene.remove(GOject.model)
            if( GOject.name != undefined ) this.scene.remove(GOject.name)
        }
    }
    
    update() {
        let s0, s1, r
        this.element.forEach(
            GOject => {
                // 【新增】同步图片模型的大小
                if (GOject.isImageModel) {
                    // 随着 radius 变大，model.size 也要变大
                    // 这里假设 model.size 对应的是直径的逻辑单位
                    GOject.model.size = GOject.radius * 2;
                    if(GOject.name) {
                         // 名字也稍微跟随大小或相机距离调整
                         GOject.name.size = this.camera.position.z * 0.04;
                    }
                }

                if( GOject.identity == 'consumer' || GOject.identity == 'player' ) {
                    GamesUPDATE( GOject, this )
                    
                    // 边界检查和移动逻辑
                    if( GOject.id != this.player.id && abs(GOject.position.x) >= this._x || GOject.id != this.player.id && abs(GOject.position.y) >= this._y ) {
                        GOject.velocity.x *= -1
                        GOject.velocity.y *= -1
                    }
                    else if( GOject.id != this.player.id && GOject.step_i >= GOject.step ) {
                        GOject.velocity.x = cos(random() * 2 * PI) * getVelocity(GOject.radius)
                        GOject.velocity.y = sin(random() * 2 * PI) * getVelocity(GOject.radius)
                        GOject.step_i = 0
                    }
                    
                    if( GOject.id == this.player.id && GOject.position.x > this._x ) GOject.position.x = this._x
                    if( GOject.id == this.player.id && GOject.position.x < -this._x ) GOject.position.x = -this._x
                    if( GOject.id == this.player.id && GOject.position.y > this._y ) GOject.position.y = this._y
                    if( GOject.id == this.player.id && GOject.position.y < -this._y ) GOject.position.y = -this._y
                    
                    GOject.position.x += GOject.velocity.x
                    GOject.position.y += GOject.velocity.y
                    if( GOject.id != this.player.id ) GOject.step_i++
                }
                
                // 同步位置
                GOject.model.position.x = GOject.position.x
                GOject.model.position.y = GOject.position.y
                
                if( GOject.name != undefined ) {
                    GOject.name.position.x = GOject.position.x
                    GOject.name.position.y = GOject.position.y
                    // 名字大小随相机远近调整，保持可读性
                    GOject.name.size = this.camera.position.z * 0.04
                }
            }
        )
    }
}

export { GOject, GameLoader }