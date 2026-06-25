// main.js
import * as LIAO from '../build/liao.module.js'
import { Rocker } from '../plug-in/rocker.js'
import { GOject, GameLoader } from './game.js'

const PI = Math.PI
const E = Math.E
const world_w = 20, world_h = 20
const player_name_arr = [ '老黑' ]

const random = Math.random
const trunc = Math.trunc
const round = Math.round
const pow = Math.pow
const sin = Math.sin
const cos = Math.cos

const renderer = new LIAO.Canvas2DRenderer()
const scene = new LIAO.Scene()
const camera = new LIAO.Camera()

// 【修改】预加载图片资源
const imgLoader = new LIAO.ImageLoad();
let playerImgSrc = '';
let npcImgSrc = '../../images/char/char_laohei2.jpg'; 

// 获取玩家数据
const savedPlayer = localStorage.getItem('escape_game_player');
let playerData = null;
if (savedPlayer) {
    playerData = JSON.parse(savedPlayer);
    
    if (playerData.avatar && playerData.avatar.startsWith('data:image')) {
        playerImgSrc = playerData.avatar;
    } else if (playerData.gender === 'male') {
        playerImgSrc = '../../images/char/char_male.jpg'; 
    } else {
        playerImgSrc = '../../images/char/char_female.jpg';
    }
} else {
    // 默认情况
    playerImgSrc = '../../images/char/char_male.jpg';
    playerData = { name: '玩家', gender: 'male' };
}

// 异步初始化，等待图片加载
async function init() {
    try {
        // 加载玩家图片和NPC图片
        const [playerImg, npcImg] = await Promise.all([
            imgLoader.load(playerImgSrc),
            imgLoader.load(npcImgSrc)
        ]);

        // 创建玩家
        // 参数: name, radius, seg, source(image), x, y, identity
        const player = new GOject( playerData.name, 0.5, 40, playerImg, 0, 0, 'player' )
        const games = new GameLoader( world_w, world_h, scene, camera, player )

        const rocker = new Rocker()
        rocker.setColor('rgba(255,255,255,0.6)')
        rocker.setRadius( 70 )
        rocker.setPosition( 100, 240 )
        rocker.touch = ( state, vec ) => {
            if( state == "move" ) {
                const k = 0.02 * pow( E, -0.4214 * (player.radius-0.5) )
                player.velocity.set( vec.x * k, -vec.y * k )
            }
            else player.velocity.set(0,0)
        }
        document.body.appendChild(rocker.domElement)
        
        renderer.setSize(innerWidth, innerHeight)
        document.querySelector('#graphic').appendChild(renderer.domElement)
        
        camera.position.z = 10.8
        camera.model = player.model
        // 玩家名字已经在 GOject 构造函数中设置，如果需要动态更改：
        // player.name.content = playerData.name; 
        
        const w_x = world_w * 0.5, w_y = world_h * 0.5
        scene.add(new LIAO.GridModel({
            extent: [ w_x, w_y, -w_x, -w_y ],
            opacity: 0.6
        }))
        
        games.add(player)
        
        initProducer(600, games) // 传递 games 实例以便添加对象
        initConsumer(20, games, npcImg) // 传递 npcImg
        
        function animate() {
            renderer.render( scene, camera )
            games.update()
            requestAnimationFrame(animate)
        }
        animate()

    } catch (error) {
        console.error("资源加载失败:", error);
    }
}

function getNames( names ) {
    const count = names.length, index = round(random() * count)
    return names[index]
}

function initProducer( count=80, games ) {
    // 食物仍然可以是彩色圆圈，或者你也可以给食物加图片
    let r, x, y, color, R, G, B
    for( let i = 0; i < count; i++ ) {
        R = trunc(random() * 255)
        G = trunc(random() * 255)
        B = trunc(random() * 255)
        color = 'rgb(' + R + ',' + G + ',' + B + ')'
        r = random() * 0.06 + 0.02
        x = (random() * 2 - 1) * world_w * 0.5
        y = (random() * 2 - 1) * world_h * 0.5
        // 食物保持为颜色圆圈，或者你可以加载一个小的食物图片
        games.add(new GOject( 'producer', r, 5, color, x, y ))
    }
}

function initConsumer( count=10, games, npcImage ) {
    let x, y, vx, vy
    for( let i = 0; i < count; i++ ) {
        x = (random() * 2 - 1) * world_w * 0.5
        y = (random() * 2 - 1) * world_h * 0.5
        vx = cos(random() * 2 * PI) * 0.02
        vy = sin(random() * 2 * PI) * 0.02
        // 【修改】使用 npcImage 作为源，身份为 consumer
        games.add(new GOject( getNames(player_name_arr), 0.5, 40, npcImage, x, y, 'consumer', vx, vy))
    }
}

onload = ()=>{
    init()
}