// import './style.css'
// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'dat.gui'

// import CANNON, { Vec3 } from 'cannon'


/**
 * Debug
 */
const gui = new dat.GUI()
const debugobj={}
debugobj.createSphere=()=>{
    createSphere(0.3,{x:0,y:2,z:-5})
}
gui.add(debugobj,'createSphere')
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')
// const video = document.getElementById( 'camera' );

console.log(canvas)
// Scene
const scene = new THREE.Scene()

//Sound

const hitSound = new Audio('static/sounds/hit.mp3')

const playSound=(collision)=>
{
    // console.log(collision)
    const impactStrength=collision.contact.getImpactVelocityAlongNormal()

    if(impactStrength>1.5)
    {
        hitSound.currentTime=0
        hitSound.play()
    }
    
}


/**
 * Textures
 */
const loadingman=new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingman)

const texture=textureLoader.load('static/court.png')
const texture_net=textureLoader.load('static/tennis_net.png')
// texture.rotation = Math.PI * 0.25
texture.magFilter = THREE.NearestFilter
texture_net.magFilter = THREE.NearestFilter
// texture.minFilter = THREE.NearestFilter
// const texture_camera = new THREE.VideoTexture('textures/New.mp4' );

//Put Camera on this Texture
const texture_camera = textureLoader.load('static/court.png')

console.log(texture_camera)







//Physics
const world = new CANNON.World()
world.gravity.set(0, - 9.82, 0)
const defaultMat=new CANNON.Material('default')
// const plasticMat=new CANNON.Material('rubber')

// const sphereshape=new CANNON.Sphere(0.3)
// const spherebody=new CANNON.Body({
//     mass:1,
//     position:new CANNON.Vec3(0,3,0),
//     shape:sphereshape,
//     material:defaultMat
// })

// spherebody.applyLocalForce(new CANNON.Vec3(0,0,200),new CANNON.Vec3(0,0,0))
// world.addBody(spherebody)


//Floor physics
const floorShape= new CANNON.Plane()
const floorBody=new CANNON.Body()

floorBody.mass=0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1,0,0),
    Math.PI*0.5
)
floorBody.material=defaultMat
world.addBody(floorBody)


//Net physics
const netShape= new CANNON.Box(new CANNON.Vec3(10, 1.5, 0.1))
const netBody=new CANNON.Body()

netBody.mass=0
netBody.addShape(netShape)
netBody.material=defaultMat
world.addBody(netBody)




//Collider physics

const shape1 = new CANNON.Box(new CANNON.Vec3(2, 3, 1))

const body1 = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 1, 8),
    shape: shape1,
    material: defaultMat
})
body1.position.copy({x:0,y:1,z:8})

world.addBody(body1)

//





//Materials


const contactMat=new CANNON.ContactMaterial(defaultMat,defaultMat,{friction:0.2,restitution:0.8})
world.addContactMaterial(contactMat)




/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 15),
    new THREE.MeshStandardMaterial({
        map:texture,
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)




/**
 * Net
 */
 const geometry = new THREE.BoxGeometry( 10, 2, 0.1 );
 const material = new THREE.MeshBasicMaterial( {map:texture_net, side: THREE.DoubleSide,opacity:0.5,transparent:true} );
 const plane = new THREE.Mesh( geometry, material );
 scene.add( plane );

//Collider
const material1 = new THREE.MeshStandardMaterial({opacity:0,transparent:true})

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 1),
    material1
)
cube.position.z=8
cube.position.y=1
scene.add(cube)





/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.9)

directionalLight.position.set(0, 5, 5)
directionalLight2.position.set(0, 7,-5)

scene.add(directionalLight,directionalLight2)


// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
// scene.add(directionalLightHelper)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 5, 10)
camera.lookAt(scene.position)
scene.add(camera)


//Capture frame

const frame = new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({map:texture_camera, color:'#ccff00',side: THREE.DoubleSide}))
frame.position.set(-15,5,-9)
scene.add(frame)


// Controls
const controls = new THREE.OrbitControls(camera, canvas)
controls.enabled=false
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldelapsed=0

const objupdate=[]

const createSphere = (radius, position) =>
{
    // Three.js mesh
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 20, 20),
        new THREE.MeshStandardMaterial({
            roughness: 0.4,
            color:'#ccff00'
        })
    )
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    const shape = new CANNON.Sphere(radius)

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 2, -5),
        shape: shape,
        material: defaultMat
    })
    body.position.copy(position)
    body.addEventListener('collide',playSound)
    body.applyLocalForce(new CANNON.Vec3(0,250,450),new CANNON.Vec3(0,0,0))
    world.addBody(body)

    objupdate.push({
        mesh,
        body
    })


}


debugobj.reset = () =>
{
    for(const object of objupdate)
    {
        object.body.removeEventListener('collide', playSound)
        world.removeBody(object.body)
        scene.remove(object.mesh)
    }
}
gui.add(debugobj,'reset')

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltatime=elapsedTime-oldelapsed
    oldelapsed=elapsedTime

    // spherebody.applyForce(new CANNON.Vec3(0.2,0,0),spherebody.position)

    //Update physics
    world.step(1/60,deltatime,3)

    // sphere.position.copy(spherebody.position)

    for(const obj of objupdate)
    {
        obj.mesh.position.copy(obj.body.position)
        if (obj.mesh.position.z<-10)
        {
            obj.body.removeEventListener('collide', playSound)
            world.removeBody(obj.body)
            scene.remove(obj.mesh)
        }
        else
        {
            obj.body.applyForce(new CANNON.Vec3(0.2,0,0),obj.body.position)
            body1.addEventListener('collide',()=>
            {
                obj.body.applyForce(new CANNON.Vec3(0.3,1.2,-3.5),obj.body.position)
                obj.mesh.position.copy(obj.body.position)
                // obj.body.applyLocalForce(new CANNON.Vec3(0,200,-450),new CANNON.Vec3(0,0,0))
            })
        }
        
        
    }


    
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene,camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()